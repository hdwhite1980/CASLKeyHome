// src/components/CASLVerification.js
import { getStyles } from './common/Styles.js';
import { renderProgressSteps } from './common/ProgressSteps.js';
import { renderAlerts, renderTrustPreview } from './common/Alerts.js';
import { renderNavigationButtons } from './common/NavigationButtons.js';
import { renderUserIdentification } from './FormSteps/UserIdentification.js';
import { renderBookingInfo } from './FormSteps/BookingInfo.js';
import { renderStayIntent } from './FormSteps/StayIntent.js';
import { renderAgreement } from './FormSteps/Agreement.js';
import { renderResults } from './ResultsView.js';

import { 
  validateUserIdentification, 
  validateBookingInfo, 
  validateStayIntent, 
  validateAgreement,
  isStepValid
} from '../utils/validation.js';

import {
  saveFormData,
  loadSavedData,
  clearSavedData,
  saveTrustPreview,
  getTrustPreview
} from '../services/storage.js';

import { apiService } from '../services/api.js';
import { backgroundCheckService } from '../services/backgroundCheck.js';
import {
  calculateScore,
  getTrustLevel,
  getResultMessage,
  generateHostSummary
} from '../services/scoreCalculator.js';

import { VERIFICATION_STATUSES } from '../utils/constants.js';

/**
 * Main CASL Key Verification component
 * This is a Web Component that implements a multi-step form for verifying
 * short-term rental guests and generating a trust score.
 */
export class CASLVerification extends HTMLElement {
  /**
   * Constructor initializes the component
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize state
    this.initializeState();
    
    // Render and setup
    this.render();
    this.setupEventListeners();
    this.loadSavedData();
  }
  
  /**
   * Initialize component state
   */
  initializeState() {
    // Current form step
    this.currentStep = 0;
    
    // Form data
    this.formData = {
      name: '',
      email: '',
      phone: '',
      address: '',
      airbnbProfile: '',
      vrboProfile: '',
      otherPlatformProfile: '',
      otherPlatformType: '',
      consentToBackgroundCheck: false,
      platform: '',
      listingLink: '',
      checkInDate: '',
      checkOutDate: '',
      stayPurpose: '',
      otherPurpose: '',
      totalGuests: 1,
      childrenUnder12: false,
      nonOvernightGuests: false,
      travelingNearHome: false,
      zipCode: '',
      usedSTRBefore: true,
      previousStayLinks: '',
      agreeToRules: false,
      agreeNoParties: false,
      understandFlagging: false
    };
    
    // User identification status
    this.userIdentification = {
      caslKeyId: null,
      isExistingUser: false,
      isVerified: false,
      verificationType: null,
      isChecking: false,
      error: null,
      platformData: null,
      idVerificationData: null,
      backgroundCheckStatus: null
    };
    
    // Form validation errors
    this.errors = {};
    
    // UI state
    this.isFormValid = false;
    this.isLoading = false;
    this.submitted = false;
    this.showScreenshotUpload = false;
    this.screenshotData = null;
    this.verificationStatus = VERIFICATION_STATUSES.NOT_SUBMITTED;
    this.showRestoredMessage = false;
    this.apiError = null;
    
    // Trust results
    this.score = 0;
    this.trustLevel = '';
    this.message = '';
    this.adjustments = [];
    
    // Trust preview (what hosts will see)
    this.trustPreview = null;
  }
  
  /**
   * When the element is added to the DOM
   */
  connectedCallback() {
    console.log('CASL Verification Element connected');
  }
  
  /**
   * Render the component
   */
  render() {
    const content = this.submitted ? this.renderResults() : this.renderForm();
    
    this.shadowRoot.innerHTML = `
      <style>${getStyles()}</style>
      <div class="container">
        <h1 style="text-align: center; margin-bottom: 20px;">CASL Key Verification</h1>
        ${content}
      </div>
    `;
  }
  
  /**
   * Render the form based on current step
   */
  renderForm() {
    return `
      ${renderProgressSteps(this.currentStep)}
      ${renderAlerts(this.showRestoredMessage, this.apiError)}
      ${this.renderCurrentStep()}
      ${this.trustPreview ? renderTrustPreview(this.trustPreview) : ''}
      ${renderNavigationButtons(this.currentStep, this.isFormValid, this.isLoading)}
    `;
  }
  
  /**
   * Render the current step content
   */
  renderCurrentStep() {
    switch(this.currentStep) {
      case 0:
        return renderUserIdentification(
          this.formData, 
          this.errors, 
          this.userIdentification, 
          this.showScreenshotUpload, 
          this.screenshotData, 
          this.verificationStatus
        );
      case 1:
        return renderBookingInfo(this.formData, this.errors);
      case 2:
        return renderStayIntent(this.formData, this.errors);
      case 3:
        return renderAgreement(this.formData, this.errors);
      default:
        return '';
    }
  }
  
  /**
   * Render verification results
   */
  renderResults() {
    return renderResults(
      this.userIdentification,
      this.trustLevel,
      this.score,
      this.message,
      this.adjustments
    );
  }
  
  /**
   * Handle input changes
   * @param {Event} event - Input change event
   */
  handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Update the form data
    this.formData[name] = inputValue;
    
    // Extra logic for dependent fields
    if (name === 'stayPurpose' && value !== 'Other') {
      this.formData.otherPurpose = '';
    }
    
    if (name === 'travelingNearHome' && !checked) {
      this.formData.zipCode = '';
    }
    
    // If background check consent changes, we may need to update preview
    if (name === 'consentToBackgroundCheck' && checked) {
      this.updateTrustPreview();
    }
    
    // Update storage and revalidate
    this.saveFormData();
    this.validateForm();
    this.render();
  }
  
  /**
   * Toggle screenshot upload section
   * @param {boolean} show - Whether to show the screenshot upload section
   */
  toggleScreenshotUpload(show) {
    this.showScreenshotUpload = show;
    this.render();
  }
  
  /**
   * Handle screenshot upload
   * @param {Event} event - File input change event
   */
  handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      this.apiError = "Please select an image file (JPG, PNG, etc.)";
      this.render();
      return;
    }
    
    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.screenshotData = e.target.result;
      this.render();
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Handle drag over event for screenshot drop zone
   * @param {Event} event - Drag over event
   */
  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = this.shadowRoot.getElementById('screenshot-dropzone');
    if (dropzone) {
      dropzone.classList.add('drag-over');
    }
  }
  
  /**
   * Handle drag leave event for screenshot drop zone
   * @param {Event} event - Drag leave event
   */
  handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = this.shadowRoot.getElementById('screenshot-dropzone');
    if (dropzone) {
      dropzone.classList.remove('drag-over');
    }
  }
  
  /**
   * Handle drop event for screenshot drop zone
   * @param {Event} event - Drop event
   */
  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropzone = this.shadowRoot.getElementById('screenshot-dropzone');
    if (dropzone) {
      dropzone.classList.remove('drag-over');
    }
    
    const file = event.dataTransfer.files[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      this.apiError = "Please select an image file (JPG, PNG, etc.)";
      this.render();
      return;
    }
    
    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.screenshotData = e.target.result;
      this.render();
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Clear uploaded screenshot
   */
  clearScreenshot() {
    this.screenshotData = null;
    this.render();
  }
  
  /**
   * Upload screenshot to API
   * @returns {Promise<boolean>} Success status
   */
  async uploadScreenshot() {
    if (!this.screenshotData) {
      this.apiError = "Please upload a screenshot first";
      this.render();
      return false;
    }
    
    this.isLoading = true;
    this.verificationStatus = VERIFICATION_STATUSES.PROCESSING;
    this.render();
    
    try {
      // Generate a unique user ID if not exists
      const userId = this.userIdentification.caslKeyId || `user_${Date.now()}`;
      
      // Call API to upload screenshot
      const result = await apiService.uploadScreenshot(this.screenshotData, userId);
      console.log('Upload result:', result);
      
      // Start polling for verification status
      this.startVerificationStatusPolling(userId);
      
      return true;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      this.apiError = `Error uploading screenshot: ${error.message}`;
      this.isLoading = false;
      this.render();
      return false;
    }
  }
  
  /**
   * Start polling for verification status
   * @param {string} userId - User ID for verification
   */
  startVerificationStatusPolling(userId) {
    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const result = await apiService.checkVerificationStatus(userId);
        console.log('Status check result:', result);
        
        // Update the verification status
        this.verificationStatus = result.status;
        
        // If verification is complete (not processing), stop polling
        if (result.status !== VERIFICATION_STATUSES.PROCESSING) {
          clearInterval(pollInterval);
          this.isLoading = false;
          
          // If verified, update user identification
          if (result.status === VERIFICATION_STATUSES.VERIFIED) {
            this.userIdentification.isVerified = true;
            this.userIdentification.verificationType = 'screenshot';
            
            if (result.verificationDetails) {
              this.userIdentification.platformData = result.verificationDetails;
            }
            
            // Update trust preview if available
            this.updateTrustPreview();
          }
          
          this.render();
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        clearInterval(pollInterval);
        this.apiError = `Error checking verification status: ${error.message}`;
        this.isLoading = false;
        this.render();
      }
    }, 3000);
  }
  
  /**
   * Update the trust preview (what hosts will see)
   */
  updateTrustPreview() {
    // Calculate initial score based on current data
    const result = calculateScore(this.formData, this.userIdentification);
    const trustLevel = getTrustLevel(result.score);
    
    // Generate a host-facing summary
    const previewData = {
      caslKeyId: this.userIdentification.caslKeyId || 'Pending',
      trustLevel,
      scoreRange: result.score >= 85 ? '85-100' : 
                 result.score >= 70 ? '70-84' : 
                 result.score >= 50 ? '50-69' : 'Below 50',
      platformVerified: !!this.userIdentification.verificationType,
      backgroundCheckCompleted: !!this.userIdentification.backgroundCheckStatus,
      flags: {
        localBooking: this.formData.travelingNearHome || false,
        highGuestCount: this.formData.totalGuests > 5 || false,
        noSTRHistory: !this.formData.usedSTRBefore || false
      }
    };
    
    // Save preview
    this.trustPreview = previewData;
    saveTrustPreview(previewData);
  }
  
  /**
   * Validate form based on current step
   */
  validateForm() {
    let stepErrors = {};
    
    // Validate current step
    switch (this.currentStep) {
      case 0:
        stepErrors = validateUserIdentification(
          this.formData, 
          this.userIdentification, 
          this.verificationStatus
        );
        break;
      case 1:
        stepErrors = validateBookingInfo(this.formData);
        break;
      case 2:
        stepErrors = validateStayIntent(this.formData);
        break;
      case 3:
        stepErrors = validateAgreement(this.formData);
        break;
    }
    
    this.errors = stepErrors;
    this.isFormValid = isStepValid(stepErrors);
  }
  
  /**
   * Handle next step button click
   */
  async handleNextStep() {
    if (!this.isFormValid) {
      return;
    }
    
    // Special handling for first step (user identification)
    if (this.currentStep === 0) {
      // If screenshot verification is shown and there's data, upload it first
      if (this.showScreenshotUpload && this.screenshotData && 
          this.verificationStatus !== VERIFICATION_STATUSES.VERIFIED && 
          this.verificationStatus !== VERIFICATION_STATUSES.MANUAL_REVIEW) {
        const uploadSuccess = await this.uploadScreenshot();
        if (!uploadSuccess) return;
      }
      
      // Check user status
      const userVerified = await this.handleCheckUser();
      if (!userVerified) return;
      
      // Handle background check if needed
      if (this.formData.consentToBackgroundCheck && 
          !this.userIdentification.backgroundCheckStatus) {
        await this.initiateBackgroundCheck();
      }
      
      // Update trust preview
      this.updateTrustPreview();
    }
    
    if (this.currentStep < 3) {
      this.currentStep += 1;
      this.saveFormData();
      this.validateForm();
      this.render();
    } else {
      this.handleSubmit();
    }
  }
  
  /**
   * Handle previous step button click
   */
  handlePreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      this.saveFormData();
      this.validateForm();
      this.render();
    }
  }
  
  /**
   * Check user verification with API
   * @returns {Promise<boolean>} Success status
   */
  async handleCheckUser() {
    if (!this.formData.email) {
      this.errors.email = "Email is required for verification";
      this.render();
      return false;
    }
    
    this.isLoading = true;
    this.apiError = null;
    this.userIdentification.isChecking = true;
    this.render();
    
    try {
      const userData = {
        email: this.formData.email,
        name: this.formData.name,
        phone: this.formData.phone,
        address: this.formData.address
      };
      
      // Check user status with API
      const userIdentification = await apiService.checkUserStatus(userData);
      
      // Update with verification status from screenshot if we already verified them
      const isVerified = this.verificationStatus === VERIFICATION_STATUSES.VERIFIED || 
                         this.verificationStatus === VERIFICATION_STATUSES.MANUAL_REVIEW;
      
      if (isVerified && !userIdentification.isVerified) {
        userIdentification.isVerified = true;
        userIdentification.verificationType = 'screenshot';
      }
      
      // Update user identification
      this.userIdentification = userIdentification;
      
      this.isLoading = false;
      this.render();
      return true;
    } catch (error) {
      this.isLoading = false;
      this.apiError = error.message || "An error occurred during verification";
      this.userIdentification = {
        ...this.userIdentification,
        isChecking: false,
        error: error.message || "Failed to verify user. Please try again."
      };
      
      this.render();
      return false;
    }
  }
  
  /**
   * Initiate background check if user consented
   */
  async initiateBackgroundCheck() {
    if (!this.formData.consentToBackgroundCheck) return;
    
    this.isLoading = true;
    this.render();
    
    try {
      const userData = {
        caslKeyId: this.userIdentification.caslKeyId,
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone,
        address: this.formData.address
      };
      
      // Call background check service
      const result = await backgroundCheckService.initiateBackgroundCheck(userData);
      
      // Update user identification with background check status
      this.userIdentification = {
        ...this.userIdentification,
        backgroundCheckStatus: result.passed ? 'passed' : 'failed',
        isVerified: this.userIdentification.isVerified || result.passed
      };
      
      this.isLoading = false;
      this.render();
    } catch (error) {
      console.error('Background check error:', error);
      this.apiError = error.message || "Error processing background check";
      this.isLoading = false;
      this.render();
    }
  }
  
  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (!this.isFormValid) return;

    this.isLoading = true;
    this.render();

    try {
      // Calculate score and get trust level results
      const result = calculateScore(this.formData, this.userIdentification);
      const trustLevel = getTrustLevel(result.score);
      const message = getResultMessage(trustLevel);
      
      // Save results locally
      this.score = result.score;
      this.trustLevel = trustLevel;
      this.message = message;
      this.adjustments = result.adjustments;
      
      // Prepare verification data for API submission
      const verificationData = {
        caslKeyId: this.userIdentification.caslKeyId,
        user: {
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          address: this.formData.address
        },
        verification: {
          score: result.score,
          trustLevel: trustLevel,
          verificationType: this.userIdentification.verificationType,
          backgroundCheckStatus: this.userIdentification.backgroundCheckStatus,
          adjustments: result.adjustments,
          verificationDate: new Date().toISOString()
        },
        booking: {
          platform: this.formData.platform,
          listingLink: this.formData.listingLink,
          checkInDate: this.formData.checkInDate,
          checkOutDate: this.formData.checkOutDate
        },
        stayDetails: {
          purpose: this.formData.stayPurpose,
          totalGuests: this.formData.totalGuests,
          childrenUnder12: this.formData.childrenUnder12,
          nonOvernightGuests: this.formData.nonOvernightGuests,
          travelingNearHome: this.formData.travelingNearHome,
          zipCode: this.formData.zipCode,
          previousExperience: this.formData.usedSTRBefore,
          previousStayLinks: this.formData.previousStayLinks
        }
      };
      
      // Generate host summary
      const hostSummary = generateHostSummary(verificationData);
      
      // Submit verification data to API
      await apiService.submitVerification({
        ...verificationData,
        hostSummary
      });
      
      // Mark as submitted
      this.submitted = true;
      this.isLoading = false;
      
      // Clear saved data
      this.clearSavedData();
      
      // Update UI
      this.render();
      
      // Dispatch event for external listeners
      const event = new CustomEvent('verificationComplete', {
        detail: {
          caslKeyId: this.userIdentification.caslKeyId,
          score: result.score,
          trustLevel,
          verificationData,
          hostSummary
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error during submission:', error);
      this.apiError = "Error submitting verification. Please try again.";
      this.isLoading = false;
      this.render();
    }
  }
  
  /**
   * Reset the form
   */
  handleReset() {
    this.initializeState();
    this.validateForm();
    this.clearSavedData();
    this.render();
  }
  
  /**
   * Save form data to local storage
   */
  saveFormData() {
    if (!this.submitted) {
      saveFormData(this.formData, this.currentStep);
    }
  }
  
  /**
   * Load saved form data from local storage
   */
  loadSavedData() {
    const savedData = loadSavedData();
    if (savedData) {
      this.formData = savedData.formData;
      this.currentStep = savedData.currentStep;
      this.showRestoredMessage = true;
      setTimeout(() => {
        this.showRestoredMessage = false;
        this.render();
      }, 5000);
      
      // Load trust preview if available
      this.trustPreview = getTrustPreview();
      
      this.validateForm();
    }
  }
  
  /**
   * Clear saved data from local storage
   */
  clearSavedData() {
    clearSavedData();
    this.showRestoredMessage = false;
  }
  
  /**
   * Clear API error message
   */
  clearApiError() {
    this.apiError = null;
    this.render();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // No additional setup needed as we're using inline event handlers
  }
}

// Register the custom element
customElements.define('casl-verification', CASLVerification);
