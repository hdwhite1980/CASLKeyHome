// src/services/apiSecurity.js

/**
 * API security service for CASL Verification
 * Provides token-based authentication and request encryption
 */
class ApiSecurityService {
  constructor() {
    this.apiToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
  }

  /**
   * Initialize the security service
   * @param {Object} config - Security configuration
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    // Check for stored tokens in secure storage
    this.apiToken = localStorage.getItem('casl_api_token');
    this.tokenExpiry = localStorage.getItem('casl_token_expiry');
    this.refreshToken = localStorage.getItem('casl_refresh_token');
    
    // If no token or token expired, attempt to get a new one
    if (!this.apiToken || this.isTokenExpired()) {
      console.log('API token missing or expired, attempting to refresh');
      await this.refreshApiToken();
    }
  }

  /**
   * Check if the current token is expired
   * @returns {boolean} True if token is expired or missing
   */
  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    
    const expiryDate = new Date(parseInt(this.tokenExpiry));
    const now = new Date();
    
    return now >= expiryDate;
  }

  /**
   * Refresh the API token
   * @returns {Promise<boolean>} Success status
   */
  async refreshApiToken() {
    try {
      if (this.refreshToken) {
        // Attempt to refresh using the refresh token
        const response = await fetch(`/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.updateTokens(data);
          return true;
        }
      }
      
      // If no refresh token or refresh failed, attempt to get a new token
      return await this.authenticateClient();
    } catch (error) {
      console.error('Error refreshing API token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Authenticate the client to get new tokens
   * @returns {Promise<boolean>} Success status
   */
  async authenticateClient() {
    try {
      // Create a secure client identifier
      const clientId = this.generateClientId();
      
      // Authenticate with the API
      const response = await fetch(`/api/auth/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          // Add additional device/environment info for security
          environment: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      this.updateTokens(data);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Update tokens in memory and secure storage
   * @param {Object} tokenData - New token data
   */
  updateTokens(tokenData) {
    this.apiToken = tokenData.token;
    this.tokenExpiry = tokenData.expiry;
    this.refreshToken = tokenData.refreshToken;
    
    // Save to secure storage
    localStorage.setItem('casl_api_token', this.apiToken);
    localStorage.setItem('casl_token_expiry', this.tokenExpiry);
    localStorage.setItem('casl_refresh_token', this.refreshToken);
  }

  /**
   * Clear tokens from memory and storage
   */
  clearTokens() {
    this.apiToken = null;
    this.tokenExpiry = null;
    this.refreshToken = null;
    
    localStorage.removeItem('casl_api_token');
    localStorage.removeItem('casl_token_expiry');
    localStorage.removeItem('casl_refresh_token');
  }

  /**
   * Generate a unique client identifier
   * @returns {string} Client ID
   */
  generateClientId() {
    // Get device fingerprint data
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;
    
    // Combine and hash data to create a unique ID
    const baseString = `${screenInfo}|${timeZone}|${language}|${platform}|${Date.now()}`;
    return this.hashString(baseString);
  }

  /**
   * Simple hash function for client ID
   * @param {string} str - String to hash
   * @returns {string} Hashed string
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add authentication headers to a request
   * @param {Object} headers - Existing headers
   * @returns {Object} Headers with authentication
   */
  async getAuthHeaders(headers = {}) {
    // Ensure we have a valid token
    if (!this.apiToken || this.isTokenExpired()) {
      await this.refreshApiToken();
    }
    
    // Add authentication headers
    return {
      ...headers,
      'Authorization': `Bearer ${this.apiToken}`,
      'X-Client-ID': this.generateClientId()
    };
  }

  /**
   * Encrypt request data
   * @param {Object} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  encryptData(data) {
    // In a real implementation, use a robust encryption library
    // This is a placeholder for the concept
    const jsonStr = JSON.stringify(data);
    // For demonstration purposes, we'll use base64 encoding
    // In production, use actual encryption with a secure library
    return btoa(jsonStr);
  }

  /**
   * Decrypt response data
   * @param {string} encryptedData - Encrypted data
   * @returns {Object} Decrypted data
   */
  decryptData(encryptedData) {
    // Placeholder for decryption
    try {
      const jsonStr = atob(encryptedData);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const apiSecurity = new ApiSecurityService();
