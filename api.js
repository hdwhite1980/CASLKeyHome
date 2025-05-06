// src/services/api.js
import { API_BASE_URL } from '../utils/constants.js';
import { generateCASLKeyId } from '../utils/idGenerator.js';
import { apiSecurity } from './apiSecurity.js';

/**
 * API service for CASL Verification with enhanced security
 */
class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.initializeApiSecurity();
  }

  /**
   * Initialize API security
   */
  async initializeApiSecurity() {
    try {
      await apiSecurity.initialize();
    } catch (error) {
      console.error('Failed to initialize API security:', error);
    }
  }

  /**
   * Generic request method with error handling and enhanced security
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request body data
   * @param {boolean} secure - Whether to use secure headers and encryption
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, method = 'GET', data = null, secure = true) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      
      // Base headers
      let headers = {
        'Content-Type': 'application/json',
        'Accept-Language': this.getPreferredLanguage()
      };
      
      // Add authentication headers for secure requests
      if (secure) {
        headers = await apiSecurity.getAuthHeaders(headers);
      }
      
      // Process request data
      let processedData = data;
      if (data && secure) {
        // For secure requests, encrypt sensitive data
        processedData = {
          payload: apiSecurity.encryptData(data),
          timestamp: Date.now()
        };
      }
      
      const options = {
        method,
        headers,
        body: processedData ? JSON.stringify(processedData) : undefined
      };
      
      // Execute request with timeout
      const response = await this.timeoutFetch(url, options);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }
      
      // Process response
      const responseData = await response.json();
      
      // Decrypt response if it's encrypted
      if (secure && responseData.encrypted) {
        return apiSecurity.decryptData(responseData.payload);
      }
      
      return responseData;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Handle token expiration
      if (error.message.includes('token expired') || error.message.includes('unauthorized')) {
        // Clear tokens and try to get new ones
        apiSecurity.clearTokens();
        await apiSecurity.refreshApiToken();
        
        // Retry the request once
        return this.request(endpoint, method, data, secure);
      }
      
      throw error;
    }
  }
  
  /**
   * Fetch with timeout
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>} Fetch response
   */
  async timeoutFetch(url, options, timeout = 30000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }
  
  /**
   * Get preferred language from browser or settings
   * @returns {string} Language code
   */
  getPreferredLanguage() {
    // First check if user has set a preference
    const userPref = localStorage.getItem('casl_language_preference');
    if (userPref) return userPref;
    
    // Otherwise use browser language
    return navigator.language || 'en-US';
  }
  
  /**
   * Check if a user exists in the system
   * @param {Object} userData - User data for checking
   * @returns {Promise<Object>} User verification data
   */
  async checkUserStatus(userData) {
    try {
      const result = await this.request('user-check', 'POST', {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        address: userData.address
      });
      
      if (result.found) {
        return {
          caslKeyId: result.userData.caslKeyId,
          isExistingUser: true,
          isVerified: result.userData.isVerified,
          verificationType: 'existing',
          isChecking: false,
          error: null,
          platformData: result.userData.platformData || null,
          idVerificationData: result.userData.idVerificationData || null
        };
      } else {
        // Generate new CASL Key ID for new user
        const newId = generateCASLKeyId();
        
        return {
          caslKeyId: newId,
          isExistingUser: false,
          isVerified: false,
          verificationType: null,
          isChecking: false,
          error: null,
          platformData: null,
          idVerificationData: null
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload a screenshot for verification
   * @param {string} imageData - Base64 encoded image data
   * @param {string} userId - User ID for verification
   * @returns {Promise<Object>} Upload result
   */
  async uploadScreenshot(imageData, userId) {
    return this.request('upload', 'POST', {
      userId,
      imageData
    });
  }

  /**
   * Check verification status of a user
   * @param {string} userId - User ID to check
   * @returns {Promise<Object>} Status check result
   */
  async checkVerificationStatus(userId) {
    return this.request(`status?userId=${userId}`, 'GET');
  }

  /**
   * Submit verification data to the API
   * @param {Object} verificationData - Complete verification data
   * @returns {Promise<Object>} Submission result
   */
  async submitVerification(verificationData) {
    return this.request('verify', 'POST', verificationData);
  }
  
  /**
   * Verify identity via government ID
   * @param {string} idImageData - Base64 encoded ID image data
   * @param {string} selfieImageData - Base64 encoded selfie image data
   * @param {string} userId - User ID for verification
   * @returns {Promise<Object>} Verification result
   */
  async verifyGovernmentId(idImageData, selfieImageData, userId) {
    return this.request('verify-id', 'POST', {
      userId,
      idImageData,
      selfieImageData
    });
  }
  
  /**
   * Verify with phone number via SMS code
   * @param {string} phoneNumber - Phone number to verify
   * @param {string} userId - User ID for verification
   * @returns {Promise<Object>} Verification result with code ID
   */
  async requestPhoneVerification(phoneNumber, userId) {
    return this.request('verify-phone/request', 'POST', {
      userId,
      phoneNumber
    });
  }
  
  /**
   * Verify SMS code sent to phone
   * @param {string} code - Verification code
   * @param {string} verificationId - Verification ID from request
   * @param {string} userId - User ID for verification
   * @returns {Promise<Object>} Verification result
   */
  async verifyPhoneCode(code, verificationId, userId) {
    return this.request('verify-phone/verify', 'POST', {
      userId,
      verificationId,
      code
    });
  }
  
  /**
   * Verify with social media profile
   * @param {string} platform - Social media platform name
   * @param {string} profileUrl - Profile URL
   * @param {string} accessToken - OAuth access token (if available)
   * @param {string} userId - User ID for verification
   * @returns {Promise<Object>} Verification result
   */
  async verifySocialMedia(platform, profileUrl, accessToken, userId) {
    return this.request('verify-social', 'POST', {
      userId,
      platform,
      profileUrl,
      accessToken
    });
  }
  
  /**
   * Get available languages for the API
   * @returns {Promise<Array>} Available languages
   */
  async getAvailableLanguages() {
    return this.request('languages', 'GET', null, false);
  }
  
  /**
   * Set preferred language for API responses
   * @param {string} languageCode - ISO language code
   */
  setLanguagePreference(languageCode) {
    localStorage.setItem('casl_language_preference', languageCode);
  }
}

// Export a singleton instance
export const apiService = new ApiService();
