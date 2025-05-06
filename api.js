// src/services/api.js
import { API_BASE_URL } from '../utils/constants.js';
import { generateCASLKeyId } from '../utils/idGenerator.js';

/**
 * API service for CASL Verification
 */
class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request method with error handling
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, method = 'GET', data = null) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      };
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
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
}

// Export a singleton instance
export const apiService = new ApiService();
