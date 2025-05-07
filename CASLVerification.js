<style>${getStyles()}</style>
      <div class="container" dir="${i18nService.getLanguageInfo(i18nService.currentLanguage)?.direction || 'ltr'}">
        <div class="header">
          <h1 style="text-align: center; margin-bottom: 20px;">${t('app.title')}</h1>
          ${i18nService.renderLanguageSelector()}
        </div>
        ${content}
      </div>
    `;
    
    // Replace inline handlers with data attributes for event delegation
    html = eventManager.replaceInlineHandlers(html);
    
    // Enhance with accessibility attributes
    html = accessibilityHelper.enhanceHtml(html);
    
    this.shadowRoot.innerHTML = html;
    
    // Announce status changes to screen readers
    this.announceStatusChanges();
  }
  
  /**
   * Announce status changes to screen readers
   */
  announceStatusChanges() {
    if (this.isLoading) {
      accessibilityHelper.announce(t('accessibility.loading'), 'polite');
    } else if (this.apiError) {
      accessibilityHelper.announce(t('accessibility.error', { message: this.apiError }), 'assertive');
    } else if (this.submitted) {
      accessibilityHelper.announce(t('accessibility.submissionComplete'), 'polite');
    }
  }
  
  /**
   * Render the form based on current step
   */
  renderForm() {
    // If additional verification methods are shown, render those
    if (this.showVerificationMethods) {
      return `
        ${renderAlerts(this.showRestoredMessage, this.apiError)}
        ${this.selectedVerificationMethod 
          ? renderVerificationMethod(this.selectedVerificationMethod, this.userIdentification.caslKeyId)
          : renderVerificationMethodSelector(this.userIdentification)}
        <div class="navigation-buttons">
          <button 
            data-event-click="toggleVerificationMethods"
            class="neutral"
          >
            ${t('app.previous')}
          </button>
        </div>
      `;
    }
    
    // Otherwise render the main form steps
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
    
    // Create updated form data
    const updatedFormData = { ...this.formData };
    updatedFormData[name] = inputValue;
    
    // Extra logic for dependent fields
    if (name === 'stayPurpose' && value !== 'Other') {
      updatedFormData.otherPurpose = '';
    }
    
    if (name === 'travelingNearHome' && !checked) {
      updatedFormData.zipCode = '';
    }
    
    // Update global state
    stateManager.updateFormData(updatedFormData);
    
    // If background check consent changes, we may need to update preview
    if (name === 'consentToBackgroundCheck' && checked) {
      this.updateTrustPreview();
    }
  }
  
  /**
   * Handle language change
   * @param {Event} event - Language change event
   */
  handleLanguageChange(event) {
    const langCode = event.target.value;
    i18nService.changeLanguage(langCode);
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
   * Toggle verification methods section
   * @param {boolean} show - Whether to show verification methods
   */
  toggleVerificationMethods(show = false) {
    this.showVerificationMethods = show;
    this.selectedVerificationMethod = null;
    this.render();
  }
  
  /**
   * Select a verification method
   * @param {string} method - Verification method to select
   */
  selectVerificationMethod(method) {
    // Reset verification services
    governmentIdVerification.reset();
    phoneVerification.reset();
    socialVerification.reset();
    
    // Set selected method
    this.selectedVerificationMethod = method;
    
    // Update state and re-render
    this.render();
  }
  
  /**
   * Handle screenshot upload
   * @param {Event} event - File input change event
   */
  handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Validate file type
      const allowedTypes = configManager.getAllowedImageTypes();
      if (!allowedTypes.includes(file.type)) {
        throw errorHandler.createValidationError(t('errors.invalidImageType'));
      }
      
      // Validate file size
      const maxSize = configManager.get('MAX_SCREENSHOT_SIZE');
      if (file.size > maxSize) {
        throw errorHandler.createValidationError(
          t('errors.imageTooLarge', { size: Math.floor(maxSize / (1024 * 1024)) })
        );
      }
      
      // Read the file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.screenshotData = e.target.result;
        this.render();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    }
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
    
    // Use the same upload handler for dropped files
    this.handleScreenshotUpload({ target: { files: [file] } });
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
      stateManager.showAlert(t('errors.noScreenshot'));
      return false;
    }
    
    stateManager.setLoading(true);
    this.verificationStatus = VERIFICATION_STATUSES.PROCESSING;
    this.render();
    
    try {
      // Generate a unique user ID if not exists
      const userId = this.userIdentification.caslKeyId || `user_${Date.now()}`;
      
      // Call API to upload screenshot
      const result = await apiService.uploadScreenshot(this.screenshotData, userId);
      
      // Start polling for verification status
      this.startVerificationStatusPolling(userId);
      
      return true;
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
      stateManager.setLoading(false);
      return false;
    }
  }
  
  /**
   * Start polling for verification status
   * @param {string} userId - User ID for verification
   */
  startVerificationStatusPolling(userId) {
    // Poll interval from config
    const pollInterval = configManager.get('VERIFICATION_POLL_INTERVAL', 3000);
    
    // Create interval for polling
    const intervalId = setInterval(async () => {
      try {
        const result = await apiService.checkVerificationStatus(userId);
        
        // Update the verification status
        this.verificationStatus = result.status;
        
        // If verification is complete (not processing), stop polling
        if (result.status !== VERIFICATION_STATUSES.PROCESSING) {
          clearInterval(intervalId);
          stateManager.setLoading(false);
          
          // If verified, update user identification
          if (result.status === VERIFICATION_STATUSES.VERIFIED) {
            stateManager.setVerification({
              ...this.userIdentification,
              isVerified: true,
              verificationType: 'screenshot',
              platformData: result.verificationDetails || null
            });
            
            // Update trust preview
            this.updateTrustPreview();
            
            // Announce success to screen readers
            accessibilityHelper.announce(t('accessibility.verificationSuccess'), 'polite');
          } else {
            // Announce failure or review status
            if (result.status === VERIFICATION_STATUSES.MANUAL_REVIEW) {
              accessibilityHelper.announce(t('accessibility.manualReviewRequired'), 'polite');
            } else {
              accessibilityHelper.announce(t('accessibility.verificationFailed'), 'assertive');
            }
          }
        }
      } catch (error) {
        errorHandler.handleError(error);
        clearInterval(intervalId);
        stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
        stateManager.setLoading(false);
      }
    }, pollInterval);
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
    this.saveTrustPreview(previewData);
    this.render();
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
      // Announce errors to screen readers
      accessibilityHelper.announce(t('accessibility.formHasErrors'), 'assertive');
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
      // Move to next step
      this.currentStep += 1;
      
      // Update form data state
      stateManager.updateFormData({
        ...this.formData,
        currentStep: this.currentStep
      });
      
      // Validate the new step
      this.validateForm();
      
      // Announce step change to screen readers
      accessibilityHelper.announce(
        t('accessibility.movingToStep', { step: this.currentStep + 1 }),
        'polite'
      );
    } else {
      // Submit form
      this.handleSubmit();
    }
  }
  
  /**
   * Handle previous step button click
   */
  handlePreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      
      // Update form data state
      stateManager.updateFormData({
        ...this.formData,
        currentStep: this.currentStep
      });
      
      // Validate the new step
      this.validateForm();
      
      // Announce step change to screen readers
      accessibilityHelper.announce(
        t('accessibility.movingToStep', { step: this.currentStep + 1 }),
        'polite'
      );
    }
  }
  
  /**
   * Check user verification with API
   * @returns {Promise<boolean>} Success status
   */
  async handleCheckUser() {
    if (!this.formData.email) {
      stateManager.showAlert(t('errors.emailRequired'));
      return false;
    }
    
    stateManager.setLoading(true);
    
    try {
      const userData = {
        email: this.formData.email,
        name: this.formData.name,
        phone: this.formData.phone,
        address: this.formData.address
      };
      
      // Update verification state to checking
      stateManager.setVerification({
        ...this.userIdentification,
        isChecking: true,
        error: null
      });
      
      // Check user status with API
      const userIdentification = await apiService.checkUserStatus(userData);
      
      // Update with verification status from screenshot if we already verified them
      const isVerified = this.verificationStatus === VERIFICATION_STATUSES.VERIFIED || 
                         this.verificationStatus === VERIFICATION_STATUSES.MANUAL_REVIEW;
      
      if (isVerified && !userIdentification.isVerified) {
        userIdentification.isVerified = true;
        userIdentification.verificationType = 'screenshot';
      }
      
      // Update global state
      stateManager.setVerification({
        ...userIdentification,
        isChecking: false
      });
      
      return true;
    } catch (error) {
      errorHandler.handleError(error);
      
      // Update UI state with error
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
      
      // Update verification state with error
      stateManager.setVerification({
        ...this.userIdentification,
        isChecking: false,
        error: error.message || t('errors.userCheckFailed')
      });
      
      return false;
    } finally {
      stateManager.setLoading(false);
    }
  }
  
  /**
   * Initiate background check if user consented
   */
  async initiateBackgroundCheck() {
    if (!this.formData.consentToBackgroundCheck) return;
    
    stateManager.setLoading(true);
    
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
      stateManager.setVerification({
        ...this.userIdentification,
        backgroundCheckStatus: result.passed ? 'passed' : 'failed',
        isVerified: this.userIdentification.isVerified || result.passed
      });
      
      // Announce result to screen readers
      if (result.passed) {
        accessibilityHelper.announce(t('accessibility.backgroundCheckPassed'), 'polite');
      } else {
        accessibilityHelper.announce(t('accessibility.backgroundCheckFailed'), 'assertive');
      }
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
    }
  }
  
  /**
   * Handle Government ID verification
   * @param {string} userId - User ID
   */
  async handleIdImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const success = await governmentIdVerification.uploadIdImage(file);
    if (!success) {
      stateManager.showAlert(governmentIdVerification.error);
    }
    this.render();
  }
  
  /**
   * Handle Selfie image upload
   * @param {string} userId - User ID
   */
  async handleSelfieImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const success = await governmentIdVerification.uploadSelfieImage(file);
    if (!success) {
      stateManager.showAlert(governmentIdVerification.error);
    }
    this.render();
  }
  
  /**
   * Clear ID image
   */
  clearIdImage() {
    governmentIdVerification.idImageData = null;
    this.render();
  }
  
  /**
   * Clear selfie image
   */
  clearSelfieImage() {
    governmentIdVerification.selfieImageData = null;
    this.render();
  }
  
  /**
   * Verify Government ID
   * @param {string} userId - User ID
   */
  async verifyGovId(userId) {
    stateManager.setLoading(true);
    
    try {
      const result = await governmentIdVerification.verifyId(userId);
      
      if (result && result.status === 'verified') {
        // Update user identification
        stateManager.setVerification({
          ...this.userIdentification,
          idVerificationData: {
            verified: true,
            method: 'government-id',
            timestamp: new Date().toISOString()
          }
        });
        
        // Update trust preview
        this.updateTrustPreview();
        
        // Announce success to screen readers
        accessibilityHelper.announce(t('accessibility.idVerificationSuccess'), 'polite');
      }
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
    }
  }
  
  /**
   * Request phone verification
   * @param {string} userId - User ID
   */
  async requestPhoneVerification(userId) {
    const phoneInput = this.shadowRoot.getElementById('phone-input');
    if (!phoneInput) return;
    
    const phoneNumber = phoneInput.value;
    if (!phoneNumber) {
      stateManager.showAlert(t('errors.phoneRequired'));
      return;
    }
    
    stateManager.setLoading(true);
    
    try {
      const success = await phoneVerification.requestVerificationCode(phoneNumber, userId);
      
      if (!success) {
        stateManager.showAlert(phoneVerification.error);
      } else {
        // Announce to screen readers
        accessibilityHelper.announce(t('accessibility.verificationCodeSent'), 'polite');
      }
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
      this.render();
    }
  }
  
  /**
   * Verify phone code
   * @param {string} userId - User ID
   */
  async verifyPhoneCode(userId) {
    const codeInput = this.shadowRoot.getElementById('verification-code');
    if (!codeInput) return;
    
    const code = codeInput.value;
    if (!code) {
      stateManager.showAlert(t('errors.codeRequired'));
      return;
    }
    
    stateManager.setLoading(true);
    
    try {
      const result = await phoneVerification.verifyCode(code, userId);
      
      if (result && result.verified) {
        // Update user identification
        stateManager.setVerification({
          ...this.userIdentification,
          phoneVerificationData: {
            verified: true,
            phoneNumber: phoneVerification.phoneNumber,
            timestamp: new Date().toISOString()
          }
        });
        
        // Update trust preview
        this.updateTrustPreview();
        
        // Announce success
        accessibilityHelper.announce(t('accessibility.phoneVerificationSuccess'), 'polite');
      } else if (phoneVerification.error) {
        stateManager.showAlert(phoneVerification.error);
      }
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
      this.render();
    }
  }
  
  /**
   * Resend verification code
   * @param {string} userId - User ID
   */
  async resendVerificationCode(userId) {
    // Clear previous timer
    phoneVerification.clearTimer();
    
    // Request new code
    await this.requestPhoneVerification(userId);
  }
  
  /**
   * Handle social platform change
   * @param {Event} event - Change event
   */
  handleSocialPlatformChange(event) {
    const platform = event.target.value;
    socialVerification.platform = platform;
    this.render();
  }
  
  /**
   * Verify social profile
   * @param {string} userId - User ID
   */
  async verifySocialProfile(userId) {
    const platformSelect = this.shadowRoot.getElementById('social-platform');
    const profileUrlInput = this.shadowRoot.getElementById('profile-url');
    
    if (!platformSelect || !profileUrlInput) return;
    
    const platform = platformSelect.value;
    const profileUrl = profileUrlInput.value;
    
    if (!platform) {
      stateManager.showAlert(t('errors.platformRequired'));
      return;
    }
    
    if (!profileUrl) {
      stateManager.showAlert(t('errors.profileUrlRequired'));
      return;
    }
    
    stateManager.setLoading(true);
    
    try {
      const result = await socialVerification.verifySocialProfile(platform, profileUrl, userId);
      
      if (result && result.status === 'verified') {
        // Update user identification
        stateManager.setVerification({
          ...this.userIdentification,
          socialVerificationData: {
            verified: true,
            platform,
            profileUrl,
            timestamp: new Date().toISOString()
          }
        });
        
        // Update trust preview
        this.updateTrustPreview();
        
        // Announce success
        accessibilityHelper.announce(t('accessibility.socialVerificationSuccess'), 'polite');
      } else if (socialVerification.error) {
        stateManager.showAlert(socialVerification.error);
      }
    } catch (error) {
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
      this.render();
    }
  }
  
  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (!this.isFormValid) return;

    stateManager.setLoading(true);
    
    try {
      // Calculate score and get trust level results
      const result = calculateScore(this.formData, this.userIdentification);
      const trustLevel = getTrustLevel(result.score);
      const message = getResultMessage(trustLevel);
      
      // Update results state
      stateManager.setResults({
        score: result.score,
        trustLevel,
        message,
        adjustments: result.adjustments,
        isSubmitted: false // Will be set to true after API call
      });
      
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
          idVerificationStatus: this.userIdentification.idVerificationData?.verified || false,
          phoneVerificationStatus: this.userIdentification.phoneVerificationData?.verified || false,
          socialVerificationStatus: this.userIdentification.socialVerificationData?.verified || false,
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
      stateManager.setResults({
        score: result.score,
        trustLevel,
        message,
        adjustments: result.adjustments,
        isSubmitted: true,
        hostSummary
      });
      
      // Clear saved form data
      this.clearSavedData();
      
      // Announce completion to screen readers
      accessibilityHelper.announce(t('accessibility.verificationComplete'), 'polite');
      
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
      errorHandler.handleError(error);
      stateManager.showAlert(errorHandler.getUserFriendlyMessage(error));
    } finally {
      stateManager.setLoading(false);
    }
  }
  
  /**
   * Reset the form
   */
  handleReset() {
    // Reset state
    stateManager.resetSection('formData');
    stateManager.resetSection('verification');
    stateManager.resetSection('results');
    stateManager.hideAlert();
    
    // Reset services
    governmentIdVerification.reset();
    phoneVerification.reset();
    socialVerification.reset();
    
    // Reset local state
    this.currentStep = 0;
    this.showScreenshotUpload = false;
    this.screenshotData = null;
    this.verificationStatus = VERIFICATION_STATUSES.NOT_SUBMITTED;
    this.showRestoredMessage = false;
    this.showVerificationMethods = false;
    this.selectedVerificationMethod = null;
    
    // Reset trust preview
    this.trustPreview = null;
    localStorage.removeItem(`${configManager.get('STORAGE_PREFIX', 'casl_')}trust_preview`);
    
    // Clear saved data
    this.clearSavedData();
    
    // Validate form
    this.validateForm();
    
    // Announce reset to screen readers
    accessibilityHelper.announce(t('accessibility.formReset'), 'polite');
  }
  
  /**
   * Save form data to storage
   */
  saveFormData() {
    if (this.submitted) return;
    
    try {
      // Get storage prefix
      const prefix = configManager.get('STORAGE_PREFIX', 'casl_');
      
      // Save data
      const data = {
        formData: this.formData,
        currentStep: this.currentStep,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`${prefix}saved_form_data`, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving form data:', error);
    }
  }
  
  /**
   * Load saved form data from storage
   */
  loadSavedData() {
    try {
      // Get storage prefix
      const prefix = configManager.get('STORAGE_PREFIX', 'casl_');
      
      // Get saved data
      const dataStr = localStorage.getItem(`${prefix}saved_form_data`);
      if (!dataStr) return;
      
      // Parse data
      const data = JSON.parse(dataStr);
      
      // Check if data is expired
      const maxAge = configManager.get('FORM_STATE_MAX_AGE', 24 * 60 * 60 * 1000); // 24 hours
      const timestamp = new Date(data.timestamp).getTime();
      const now = Date.now();
      
      if (now - timestamp > maxAge) {
        // Remove expired data
        localStorage.removeItem(`${prefix}saved_form_data`);
        return;
      }
      
      // Update state
      if (data.formData) {
        // Update state manager
        stateManager.updateFormData({
          ...data.formData,
          currentStep: data.currentStep || 0
        });
        
        // Update local state
        this.currentStep = data.currentStep || 0;
        this.formData = data.formData;
        this.showRestoredMessage = true;
        
        // Auto-hide restored message after 5 seconds
        setTimeout(() => {
          this.showRestoredMessage = false;
          this.render();
        }, 5000);
        
        // Validate form
        this.validateForm();
        
        // Announce to screen readers
        accessibilityHelper.announce(t('accessibility.formDataRestored'), 'polite');
      }
    } catch (error) {
      console.warn('Error loading saved form data:', error);
    }
  }
  
  /**
   * Clear saved data from storage
   */
  clearSavedData() {
    try {
      // Get storage prefix
      const prefix = configManager.get('STORAGE_PREFIX', 'casl_');
      
      // Remove saved data
      localStorage.removeItem(`${prefix}saved_form_data`);
      
      // Update UI
      this.showRestoredMessage = false;
    } catch (error) {
      console.warn('Error clearing saved data:', error);
    }
  }
  
  /**
   * Clear API error message
   */
  clearApiError() {
    stateManager.hideAlert();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Register event handlers with event manager
    this.registerEventHandlers();
    
    // Listen for language changes
    document.addEventListener('caslLanguageChanged', () => {
      this.render();
    });
    
    // Listen for phone verification timer expiration
    document.addEventListener('phoneVerificationTimerExpired', () => {
      this.render();
    });
  }
  
  /**
   * Register event handlers with event manager
   */
  registerEventHandlers() {
    // Register input change handler
    eventManager.registerHandler(
      this.componentId,
      'handleInputChange',
      this.handleInputChange.bind(this)
    );
    
    // Register language change handler
    eventManager.registerHandler(
      this.componentId,
      'handleLanguageChange',
      this.handleLanguageChange.bind(this)
    );
    
    // Register navigation handlers
    eventManager.registerHandler(
      this.componentId,
      'handleNextStep',
      this.handleNextStep.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handlePreviousStep',
      this.handlePreviousStep.bind(this)
    );
    
    // Register screenshot upload handlers
    eventManager.registerHandler(
      this.componentId,
      'toggleScreenshotUpload',
      (_, target) => this.toggleScreenshotUpload(true)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handleScreenshotUpload',
      this.handleScreenshotUpload.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'clearScreenshot',
      this.clearScreenshot.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handleDragOver',
      this.handleDragOver.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handleDragLeave',
      this.handleDragLeave.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handleDrop',
      this.handleDrop.bind(this)
    );
    
    // Register verification methods handlers
    eventManager.registerHandler(
      this.componentId,
      'toggleVerificationMethods',
      (_, target) => this.toggleVerificationMethods(false)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'selectVerificationMethod',
      (_, target) => this.selectVerificationMethod(target.getAttribute('data-method'))
    );
    
    // Register ID verification handlers
    eventManager.registerHandler(
      this.componentId,
      'handleIdImageUpload',
      this.handleIdImageUpload.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'handleSelfieImageUpload',
      this.handleSelfieImageUpload.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'clearIdImage',
      this.clearIdImage.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'clearSelfieImage',
      this.clearSelfieImage.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'verifyGovId',
      (_, target) => this.verifyGovId(target.getAttribute('data-user-id'))
    );
    
    // Register phone verification handlers
    eventManager.registerHandler(
      this.componentId,
      'requestPhoneVerification',
      (_, target) => this.requestPhoneVerification(target.getAttribute('data-user-id'))
    );
    
    eventManager.registerHandler(
      this.componentId,
      'verifyPhoneCode',
      (_, target) => this.verifyPhoneCode(target.getAttribute('data-user-id'))
    );
    
    eventManager.registerHandler(
      this.componentId,
      'resendVerificationCode',
      (_, target) => this.resendVerificationCode(target.getAttribute('data-user-id'))
    );
    
    // Register social verification handlers
    eventManager.registerHandler(
      this.componentId,
      'handleSocialPlatformChange',
      this.handleSocialPlatformChange.bind(this)
    );
    
    eventManager.registerHandler(
      this.componentId,
      'verifySocialProfile',
      (_, target) => this.verifySocialProfile(target.getAttribute('data-user-id'))
    );
    
    // Register reset handler
    eventManager.registerHandler(
      this.componentId,
      'handleReset',
      this.handleReset.bind(this)
    );
    
    // Register error clearing handler
    eventManager.registerHandler(
      this.componentId,
      'clearApiError',
      this.clearApiError.bind(this)
    );
  }
}

// Register the custom element
customElements.define('casl-verification-enhanced', EnhancedCASLVerification);
// src/components/EnhancedCASLVerification.js
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

import { stateManager } from '../utils/StateManager.js';
import { eventManager } from '../utils/EventManager.js';
import { errorHandler } from '../utils/ErrorHandler.js';
import { configManager } from '../utils/ConfigManager.js';
import { accessibilityHelper } from '../utils/AccessibilityHelper.js';
import { formHelper } from '../utils/FormHelper.js';

import { apiService } from '../services/api.js';
import { apiSecurity } from '../services/apiSecurity.js';
import { i18nService, t } from '../services/i18n.js';
import { governmentIdVerification } from '../services/governmentIdVerification.js';
import { phoneVerification } from '../services/phoneVerification.js';
import { socialVerification } from '../services/socialVerification.js';
import { backgroundCheckService } from '../services/backgroundCheck.js';

import {
  calculateScore,
  getTrustLevel,
  getResultMessage,
  generateHostSummary
} from '../services/scoreCalculator.js';

import {
  renderVerificationMethodSelector,
  renderVerificationMethod,
  getVerificationBonus
} from './VerificationMethods.js';

import { VERIFICATION_STATUSES } from '../utils/constants.js';

/**
 * Enhanced CASL Key Verification component with production-ready improvements
 * Uses centralized error handling, state management, HTTP-only cookie auth,
 * removes inline event handlers, and adds accessibility enhancements
 */
export class EnhancedCASLVerification extends HTMLElement {
  /**
   * Constructor initializes the component
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize component ID for event handling
    this.componentId = eventManager.initComponent(this);
    
    // Create live region for accessibility announcements
    this.liveRegion = accessibilityHelper.createLiveRegion('polite', 'verification-status');
    
    // Initialize state by subscribing to state manager
    this.initializeState();
    
    // Render and setup
    this.render();
    this.setupEventListeners();
    
    // Initialize API security and i18n
    this.initializeServices();
  }
  
  /**
   * Initialize component state
   */
  initializeState() {
    // Subscribe to global state sections
    this.unsubscribeHandlers = [];
    
    // Subscribe to form data state
    this.unsubscribeHandlers.push(
      stateManager.subscribe('formData', state => {
        this.formData = state;
        this.validateForm();
        this.render();
      })
    );
    
    // Subscribe to verification state
    this.unsubscribeHandlers.push(
      stateManager.subscribe('verification', state => {
        this.userIdentification = state;
        this.validateForm();
        this.render();
      })
    );
    
    // Subscribe to UI state
    this.unsubscribeHandlers.push(
      stateManager.subscribe('ui', state => {
        this.isLoading = state.loading;
        this.apiError = state.alert;
        this.render();
      })
    );
    
    // Subscribe to results state
    this.unsubscribeHandlers.push(
      stateManager.subscribe('results', state => {
        this.submitted = state.isSubmitted;
        this.score = state.score;
        this.trustLevel = state.trustLevel;
        this.message = state.message;
        this.adjustments = state.adjustments;
        this.render();
      })
    );
    
    // Set local state that isn't in global state manager
    this.currentStep = stateManager.getState('formData').currentStep || 0;
    this.showScreenshotUpload = false;
    this.screenshotData = null;
    this.verificationStatus = VERIFICATION_STATUSES.NOT_SUBMITTED;
    this.showRestoredMessage = false;
    this.showVerificationMethods = false;
    this.selectedVerificationMethod = null;
    
    // Get initial form data from state manager
    this.formData = stateManager.getState('formData');
    
    // Get verification data
    this.userIdentification = stateManager.getState('verification');
    
    // Get UI state
    const uiState = stateManager.getState('ui');
    this.isLoading = uiState.loading;
    this.apiError = uiState.alert;
    
    // Get results state
    const resultsState = stateManager.getState('results');
    this.submitted = resultsState.isSubmitted;
    this.score = resultsState.score;
    this.trustLevel = resultsState.trustLevel;
    this.message = resultsState.message;
    this.adjustments = resultsState.adjustments;
    
    // Initialize errors object
    this.errors = {};
    
    // Get trust preview from storage
    this.trustPreview = null;
    this.loadTrustPreview();
  }
  
  /**
   * Load trust preview from storage
   */
  loadTrustPreview() {
    try {
      const storageKey = `${configManager.get('STORAGE_PREFIX', 'casl_')}trust_preview`;
      const previewStr = localStorage.getItem(storageKey);
      
      if (previewStr) {
        this.trustPreview = JSON.parse(previewStr);
      }
    } catch (error) {
      errorHandler.handleError(error);
    }
  }
  
  /**
   * Save trust preview to storage
   * @param {Object} previewData - Trust preview data
   */
  saveTrustPreview(previewData) {
    try {
      const storageKey = `${configManager.get('STORAGE_PREFIX', 'casl_')}trust_preview`;
      localStorage.setItem(storageKey, JSON.stringify(previewData));
      this.trustPreview = previewData;
    } catch (error) {
      errorHandler.handleError(error);
    }
  }
  
  /**
   * Initialize services
   */
  async initializeServices() {
    try {
      // Initialize API security
      await apiSecurity.initialize();
      
      // Initialize i18n service
      await i18nService.init();
      
      // Check for saved form data
      this.loadSavedData();
    } catch (error) {
      errorHandler.handleError(error);
    }
  }
  
  /**
   * When the element is added to the DOM
   */
  connectedCallback() {
    console.log('Enhanced CASL Verification Element connected');
    
    // Add live region to document
    document.body.appendChild(this.liveRegion);
  }
  
  /**
   * When the element is removed from the DOM
   */
  disconnectedCallback() {
    // Remove state subscriptions
    this.unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
    
    // Clean up event handling
    eventManager.cleanupComponent(this.componentId);
    
    // Remove live region
    if (this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const content = this.submitted ? this.renderResults() : this.renderForm();
    
    let html = `
      <style>${getStyles()}</style>
      <div class="container" dir="${i18nService.getLanguageInfo(i18nService.currentLanguage)?.direction || 'ltr'}">
        <div class="header">
          <h1 style="text-align: center; margin-bottom: 20px;">${t('app.title')}</h1>
