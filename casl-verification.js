class CASLVerification extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Constants
    this.API_BASE_URL = 'https://your-api-gateway-url/prod'; // Replace with your API Gateway URL
    
    // State
    this.currentStep = 0;
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
    this.userIdentification = {
      caslKeyId: null,
      isExistingUser: false,
      isVerified: false,
      verificationType: null,
      isChecking: false,
      error: null,
      platformData: null,
      idVerificationData: null
    };
    this.errors = {};
    this.isFormValid = false;
    this.isLoading = false;
    this.submitted = false;
    this.showScreenshotUpload = false;
    this.screenshotData = null;
    this.verificationStatus = 'NOT_SUBMITTED';
    
    // Initialize
    this.render();
    this.setupEventListeners();
    this.loadSavedData();
  }
  
  // When the element is added to the DOM
  connectedCallback() {
    console.log('CASL Verification Element connected');
  }
  
  // Apply styles
  getStyles() {
    return `
      :host {
        display: block;
        font-family: Arial, sans-serif;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .form-section {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      button {
        padding: 10px 20px;
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 5px;
      }
      
      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      
      input, select, textarea {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .error {
        color: red;
        font-size: 12px;
        margin-top: -5px;
        margin-bottom: 10px;
      }
      
      .navigation-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
      
      .alert {
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
      }
      
      .alert-success {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
      
      .alert-error {
        background-color: #ffebee;
        color: #c62828;
      }
      
      .alert-info {
        background-color: #e3f2fd;
        color: #0d47a1;
      }
      
      .alert-warning {
        background-color: #fff8e1;
        color: #f57f17;
      }
      
      .progress-steps {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .step {
        text-align: center;
        position: relative;
        width: 25%;
      }
      
      .step-indicator {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 5px;
        z-index: 2;
        position: relative;
      }
      
      .progress-bar {
        height: 8px;
        background-color: #eee;
        border-radius: 4px;
        margin-bottom: 25px;
        position: relative;
        overflow: hidden;
      }
      
      .progress-indicator {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: #4285F4;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      .screenshot-container {
        border: 2px dashed #ccc;
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
        border-radius: 4px;
      }
      
      .screenshot-preview {
        max-width: 100%;
        max-height: 300px;
        margin-top: 10px;
      }
      
      @media (max-width: 768px) {
        .mobile-step-indicator {
          display: block;
        }
      }
    `;
  }
  
  // Render the component
  render() {
    const content = this.submitted ? this.renderResults() : this.renderForm();
    
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="container">
        <h1 style="text-align: center; margin-bottom: 20px;">CASL Key Verification</h1>
        ${content}
      </div>
    `;
  }
  
  // Render the form based on current step
  renderForm() {
    return `
      ${this.renderProgressSteps()}
      ${this.renderAlerts()}
      ${this.renderCurrentStep()}
      ${this.renderNavigationButtons()}
    `;
  }
  
  // Render progress steps
  renderProgressSteps() {
    const steps = ['User Identification', 'Booking Info', 'Stay Intent', 'Agreement'];
    const progressPercentage = ((this.currentStep + 1) / steps.length) * 100;
    
    let stepsHtml = '';
    
    steps.forEach((step, index) => {
      const isActive = index === this.currentStep;
      const isCompleted = index < this.currentStep;
      const color = index <= this.currentStep ? '#4285F4' : '#999';
      const bgColor = isCompleted ? '#4285F4' : (isActive ? 'white' : '#ddd');
      const textColor = isCompleted ? 'white' : (isActive ? '#4285F4' : '#666');
      const borderStyle = isActive ? '2px solid #4285F4' : 'none';
      
      stepsHtml += `
        <div class="step" style="color: ${color}">
          <div class="step-indicator" style="background-color: ${bgColor}; color: ${textColor}; border: ${borderStyle}">
            ${isCompleted ? '✓' : index + 1}
          </div>
          <span>${step}</span>
        </div>
      `;
    });
    
    return `
      <div class="progress-steps">
        ${stepsHtml}
      </div>
      <div class="progress-bar">
        <div class="progress-indicator" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="mobile-step-indicator" style="text-align: center; margin-bottom: 20px; display: none">
        <span style="font-weight: bold">Step ${this.currentStep + 1} of ${steps.length}: ${steps[this.currentStep]}</span>
      </div>
    `;
  }
  
  // Render alert messages
  renderAlerts() {
    let alertsHtml = '';
    
    // Show saved data message
    if (this.showRestoredMessage) {
      alertsHtml += `
        <div class="alert alert-info">
          <span>Your previous form data has been restored.</span>
          <button onclick="this.getRootNode().host.clearSavedData()">Clear</button>
        </div>
      `;
    }
    
    // Show API error
    if (this.apiError) {
      alertsHtml += `
        <div class="alert alert-error">
          <span>${this.apiError}</span>
          <button onclick="this.getRootNode().host.clearApiError()">×</button>
        </div>
      `;
    }
    
    return alertsHtml;
  }
  
  // Render the current step content
  renderCurrentStep() {
    switch(this.currentStep) {
      case 0:
        return this.renderUserIdentification();
      case 1:
        return this.renderBookingInfo();
      case 2:
        return this.renderStayIntent();
      case 3:
        return this.renderAgreement();
      default:
        return '';
    }
  }
  
  // Render user identification step
  renderUserIdentification() {
  if (this.userIdentification.isChecking) {
    return `
      <div class="form-section" style="text-align: center">
        <h2>User Identification</h2>
        <p>Checking user status...</p>
      </div>
    `;
  }
  
  let platformVerificationHtml = '';
  
  // Add the new screenshot upload section if verification type is set to need it
  if (this.showScreenshotUpload) {
    platformVerificationHtml = `
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <h3>Platform Verification via Screenshot</h3>
        <p>Please upload a screenshot of your Airbnb or VRBO profile page to verify your account.</p>
        
        <div class="screenshot-container">
          ${this.screenshotData ? `
            <p>Screenshot Preview:</p>
            <img src="${this.screenshotData}" class="screenshot-preview" />
            <button onclick="this.getRootNode().host.clearScreenshot()">Remove Screenshot</button>
          ` : `
            <p>Drag a screenshot here or click to select a file</p>
            <input type="file" accept="image/*" id="screenshot-input" 
              onchange="this.getRootNode().host.handleScreenshotUpload(event)" />
          `}
        </div>
        
        ${this.verificationStatus === 'PROCESSING' ? `
          <div class="alert alert-info">
            <p>Your screenshot is being processed. This may take a minute...</p>
          </div>
        ` : this.verificationStatus === 'VERIFIED' ? `
          <div class="alert alert-success">
            <p>✅ Your account has been verified successfully!</p>
          </div>
        ` : this.verificationStatus === 'MANUAL_REVIEW' ? `
          <div class="alert alert-warning">
            <p>👀 Your screenshot has been submitted for manual review. We'll notify you once it's verified.</p>
          </div>
        ` : this.verificationStatus === 'REJECTED' ? `
          <div class="alert alert-error">
            <p>❌ We couldn't verify your account from this screenshot. Please try again with a clearer image.</p>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  return `
    <div class="form-section">
      <h2>User Identification</h2>
      
      ${this.userIdentification.error ? `
        <div class="alert alert-error">
          ${this.userIdentification.error}
        </div>
      ` : ''}
      
      ${this.userIdentification.caslKeyId && this.userIdentification.isExistingUser ? `
        <div class="alert alert-success">
          Welcome back! We found your existing CASL Key ID: ${this.userIdentification.caslKeyId}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 15px;">
        <label>Full Name*</label>
        <input 
          type="text" 
          name="name" 
          value="${this.formData.name}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        ${this.errors.name ? `<p class="error">${this.errors.name}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Email Address*</label>
        <input 
          type="email" 
          name="email" 
          value="${this.formData.email}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        ${this.errors.email ? `<p class="error">${this.errors.email}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Phone Number*</label>
        <input 
          type="tel" 
          name="phone" 
          value="${this.formData.phone}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        ${this.errors.phone ? `<p class="error">${this.errors.phone}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Address*</label>
        <input 
          type="text" 
          name="address" 
          value="${this.formData.address}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        ${this.errors.address ? `<p class="error">${this.errors.address}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Airbnb Profile Link (Optional)</label>
        <input 
          type="url" 
          name="airbnbProfile" 
          value="${this.formData.airbnbProfile}" 
          placeholder="https://www.airbnb.com/users/show/123456789"
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <p style="font-size: 12px; color: #666;">Providing a profile helps with verification</p>
      </div>

      <div style="margin-bottom: 15px;">
        <label>Vrbo Profile Link (Optional)</label>
        <input 
          type="url" 
          name="vrboProfile" 
          value="${this.formData.vrboProfile}" 
          placeholder="https://www.vrbo.com/user/12345abcde"
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label>Other Platform Profile (Optional)</label>
        <div style="display: flex; gap: 10px;">
          <select
            name="otherPlatformType"
            value="${this.formData.otherPlatformType}"
            onchange="this.getRootNode().host.handleInputChange(event)"
            style="flex: 1"
          >
            <option value="">Select platform</option>
            <option value="booking" ${this.formData.otherPlatformType === 'booking' ? 'selected' : ''}>Booking.com</option>
            <option value="tripadvisor" ${this.formData.otherPlatformType === 'tripadvisor' ? 'selected' : ''}>TripAdvisor</option>
            <option value="homeaway" ${this.formData.otherPlatformType === 'homeaway' ? 'selected' : ''}>HomeAway</option>
            <option value="other" ${this.formData.otherPlatformType === 'other' ? 'selected' : ''}>Other</option>
          </select>
          
          <input
            type="url"
            name="otherPlatformProfile"
            value="${this.formData.otherPlatformProfile}"
            placeholder="https://example.com/profile/123"
            onchange="this.getRootNode().host.handleInputChange(event)"
            style="flex: 2"
          />
        </div>
      </div>
      
      ${(!this.formData.airbnbProfile && !this.formData.vrboProfile && !this.formData.otherPlatformProfile) ? `
        <button 
          onclick="this.getRootNode().host.toggleScreenshotUpload(true)" 
          style="background-color: #4CAF50; margin-bottom: 15px"
        >
          Verify with Account Screenshot
        </button>
        
        <div class="alert alert-warning">
          <label>
            <input 
              type="checkbox" 
              name="consentToBackgroundCheck" 
              ${this.formData.consentToBackgroundCheck ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            I consent to a background check through Chekr adjudicator service to verify my identity. 
            This is necessary if you don't provide any platform profile links.
          </label>
        </div>
      ` : ''}
      
      ${this.errors.verification ? `<p class="error">${this.errors.verification}</p>` : ''}
      
      ${platformVerificationHtml}
    </div>
  `;
}

  
  // Render booking info step
  renderBookingInfo() {
    return `
      <div class="form-section">
        <h2>Booking Information</h2>
        
        <div style="margin-bottom: 15px;">
          <label>Platform used*</label>
          <select 
            name="platform" 
            value="${this.formData.platform}" 
            onchange="this.getRootNode().host.handleInputChange(event)"
          >
            <option value="">Select platform</option>
            <option value="Airbnb" ${this.formData.platform === 'Airbnb' ? 'selected' : ''}>Airbnb</option>
            <option value="Vrbo" ${this.formData.platform === 'Vrbo' ? 'selected' : ''}>Vrbo</option>
            <option value="Booking.com" ${this.formData.platform === 'Booking.com' ? 'selected' : ''}>Booking.com</option>
            <option value="Other" ${this.formData.platform === 'Other' ? 'selected' : ''}>Other</option>
          </select>
          ${this.errors.platform ? `<p class="error">${this.errors.platform}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>STR Listing Link*</label>
          <input 
            type="url" 
            name="listingLink" 
            value="${this.formData.listingLink}" 
            placeholder="https://www.example.com/listing/123" 
            onchange="this.getRootNode().host.handleInputChange(event)"
          />
          ${this.errors.listingLink ? `<p class="error">${this.errors.listingLink}</p>` : ''}
          <p style="font-size: 12px; color: #666;">This link verifies your booking is real</p>
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
          <div style="flex: 1;">
            <label>Check-in Date*</label>
            <input 
              type="date" 
              name="checkInDate" 
              value="${this.formData.checkInDate}" 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            ${this.errors.checkInDate ? `<p class="error">${this.errors.checkInDate}</p>` : ''}
          </div>
          
          <div style="flex: 1;">
            <label>Check-out Date*</label>
            <input 
              type="date" 
              name="checkOutDate" 
              value="${this.formData.checkOutDate}" 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            ${this.errors.checkOutDate ? `<p class="error">${this.errors.checkOutDate}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  // Render stay intent step
  renderStayIntent() {
    return `
      <div class="form-section">
        <h2>Stay Intent & Group Profile</h2>
        
        <div style="margin-bottom: 15px;">
          <label>What is the primary purpose of your stay?*</label>
          <select 
            name="stayPurpose" 
            value="${this.formData.stayPurpose}" 
            onchange="this.getRootNode().host.handleInputChange(event)"
          >
            <option value="">Select purpose</option>
            <option value="Business" ${this.formData.stayPurpose === 'Business' ? 'selected' : ''}>Business</option>
            <option value="Family Visit" ${this.formData.stayPurpose === 'Family Visit' ? 'selected' : ''}>Family Visit</option>
            <option value="Vacation" ${this.formData.stayPurpose === 'Vacation' ? 'selected' : ''}>Vacation</option>
            <option value="Special Occasion" ${this.formData.stayPurpose === 'Special Occasion' ? 'selected' : ''}>Special Occasion</option>
            <option value="Relocation" ${this.formData.stayPurpose === 'Relocation' ? 'selected' : ''}>Relocation</option>
            <option value="Medical Stay" ${this.formData.stayPurpose === 'Medical Stay' ? 'selected' : ''}>Medical Stay</option>
            <option value="Other" ${this.formData.stayPurpose === 'Other' ? 'selected' : ''}>Other</option>
          </select>
          ${this.errors.stayPurpose ? `<p class="error">${this.errors.stayPurpose}</p>` : ''}
        </div>
        
        ${this.formData.stayPurpose === 'Other' ? `
          <div style="margin-bottom: 15px;">
            <label>Please specify*</label>
            <input 
              type="text" 
              name="otherPurpose" 
              value="${this.formData.otherPurpose}" 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            ${this.errors.otherPurpose ? `<p class="error">${this.errors.otherPurpose}</p>` : ''}
          </div>
        ` : ''}
        
        <div style="margin-bottom: 15px;">
          <label>How many total guests will stay?*</label>
          <input 
            type="number" 
            name="totalGuests" 
            value="${this.formData.totalGuests}" 
            min="1" 
            max="20" 
            onchange="this.getRootNode().host.handleInputChange(event)"
          />
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="childrenUnder12" 
              ${this.formData.childrenUnder12 ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            Are there any children under 12?
          </label>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="nonOvernightGuests" 
              ${this.formData.nonOvernightGuests ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            Will any guests not be staying overnight?
          </label>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="travelingNearHome" 
              ${this.formData.travelingNearHome ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            Are you traveling within 20 miles of your home?
          </label>
        </div>
        
        ${this.formData.travelingNearHome ? `
          <div style="margin-bottom: 15px;">
            <label>ZIP code*</label>
            <input 
              type="text" 
              name="zipCode" 
              value="${this.formData.zipCode}" 
              placeholder="Enter your ZIP code" 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            ${this.errors.zipCode ? `<p class="error">${this.errors.zipCode}</p>` : ''}
          </div>
        ` : ''}
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="usedSTRBefore" 
              ${this.formData.usedSTRBefore ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            Have you used STRs before?
          </label>
        </div>
        
        ${this.formData.usedSTRBefore ? `
          <div style="margin-bottom: 15px;">
            <label>Optional: Previous stay links</label>
            <textarea 
              name="previousStayLinks" 
              value="${this.formData.previousStayLinks}" 
              placeholder="Enter links to previous stays (optional)" 
              rows="2"
              onchange="this.getRootNode().host.handleInputChange(event)"
            ></textarea>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Render agreement step
  renderAgreement() {
    return `
      <div class="form-section">
        <h2>Agreement Acknowledgement</h2>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="agreeToRules" 
              ${this.formData.agreeToRules ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            I agree to follow quiet hours and property rules*
          </label>
          ${this.errors.agreeToRules ? `<p class="error">${this.errors.agreeToRules}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="agreeNoParties" 
              ${this.formData.agreeNoParties ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            I agree not to host parties or events without host approval*
          </label>
          ${this.errors.agreeNoParties ? `<p class="error">${this.errors.agreeNoParties}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 15px;">
          <label>
            <input 
              type="checkbox" 
              name="understandFlagging" 
              ${this.formData.understandFlagging ? 'checked' : ''} 
              onchange="this.getRootNode().host.handleInputChange(event)"
            />
            I understand that violation of these terms may result in being flagged in CASL Key's network*
          </label>
          ${this.errors.understandFlagging ? `<p class="error">${this.errors.understandFlagging}</p>` : ''}
        </div>
      </div>
    `;
  }
  
  // Render navigation buttons
  renderNavigationButtons() {
    return `
      <div class="navigation-buttons">
        <button 
          onclick="this.getRootNode().host.handlePreviousStep()"
          ${this.currentStep === 0 ? 'disabled' : ''}
          style="background-color: ${this.currentStep === 0 ? '#ccc' : '#6c757d'}"
        >
          Previous
        </button>
        
        <button 
          onclick="this.getRootNode().host.handleNextStep()"
          ${!this.isFormValid || this.isLoading ? 'disabled' : ''}
          style="opacity: ${(!this.isFormValid || this.isLoading) ? 0.7 : 1}"
        >
          ${this.isLoading ? `
            <span>
              <span style="display: inline-block; margin-right: 8px">
                <!-- Simple loading indicator -->
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" opacity="0.25" />
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="4" 
                    stroke-dasharray="30 100" 
                    style="animation: spin 1s linear infinite" 
                  />
                </svg>
                <style>
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                </style>
              </span>
              ${this.currentStep === 3 ? 'Submitting...' : 'Loading...'}
            </span>
          ` : this.currentStep === 3 ? 'Submit' : 'Next'}
        </button>
      </div>
    `;
  }
  
  // Render results page
  renderResults() {
    return `
      <h1 style="text-align: center; margin-bottom: 20px;">CASL Key Verification Result</h1>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; margin-bottom: 20px;">
        <div style="margin-bottom: 20px;">
          <h2>CASL Key ID: ${this.userIdentification.caslKeyId || 'Not Assigned'}</h2>
        </div>
        
        <div style="display: inline-block; padding: 10px 20px; border-radius: 4px; font-weight: bold; color: white; background-color: 
          ${this.trustLevel === 'verified' ? '#4CAF50' : 
           this.trustLevel === 'review' ? '#FFC107' : 
           this.trustLevel === 'denied' ? '#9E9E9E' : '#F44336'}
        ">
          ${this.trustLevel === 'verified' ? '✅ Verified – Low Risk' : 
           this.trustLevel === 'review' ? '⚠️ Verified – Review Recommended' : 
           this.trustLevel === 'denied' ? '❌ Not Approved' : '🚫 Flagged'}
        </div>
        
        <div style="margin: 20px 0">
          <span style="font-size: 48px; font-weight: bold">${this.score}</span>
          <span style="color: #666">/100</span>
        </div>
        
        <p style="padding: 15px; background-color: #f5f5f5; border-radius: 8px; font-size: 18px">
          ${this.message}
        </p>
        
        <div style="margin-top: 30px; text-align: left">
          <h3>Score Deductions</h3>
          
          ${this.deductions.length > 0 ? `
            <div>
              ${this.deductions.map(deduction => `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee">
                  <span>${deduction.reason}</span>
                  <span style="font-weight: bold; color: ${deduction.points > 0 ? '#4CAF50' : '#F44336'}">
                    ${deduction.points}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: #666">No deductions applied.</p>
          `}
        </div>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px">
          <button onclick="this.getRootNode().host.handleReset()">
            Start Over
          </button>
        </div>
      </div>
    `;
  }
  
  // Event handler for input changes
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
    
    // Update storage and revalidate
    this.saveFormData();
    this.validateForm();
    this.render();
  }
  
  // Toggle screenshot upload section
  toggleScreenshotUpload(show) {
    this.showScreenshotUpload = show;
    this.render();
  }
  
  // Handle screenshot upload
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
  
  // Clear screenshot
  clearScreenshot() {
    this.screenshotData = null;
    this.render();
  }
  
  // Upload screenshot to AWS
  async uploadScreenshot() {
    if (!this.screenshotData) {
      this.apiError = "Please upload a screenshot first";
      this.render();
      return false;
    }
    
    this.isLoading = true;
    this.verificationStatus = 'PROCESSING';
    this.render();
    
    try {
      // Generate a unique user ID if not exists
      const userId = this.userIdentification.caslKeyId || `user_${Date.now()}`;
      
      // Call the AWS API to upload the screenshot
      const response = await fetch(`${this.API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          imageData: this.screenshotData
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      // Set up polling for verification status
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
  
  // Start polling for verification status
  startVerificationStatusPolling(userId) {
    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.API_BASE_URL}/status?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Status check result:', result);
        
        // Update the verification status
        this.verificationStatus = result.status;
        
        // If verification is complete (not processing), stop polling
        if (result.status !== 'PROCESSING') {
          clearInterval(pollInterval);
          this.isLoading = false;
          
          // If verified, update user identification
          if (result.status === 'VERIFIED') {
            this.userIdentification.isVerified = true;
            this.userIdentification.verificationType = 'screenshot';
            
            if (result.verificationDetails) {
              this.userIdentification.platformData = result.verificationDetails;
            }
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
  
  // Validate form on data change
  validateForm() {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      address: '',
      verification: '',
      platform: '',
      listingLink: '',
      checkInDate: '',
      checkOutDate: '',
      stayPurpose: '',
      otherPurpose: '',
      zipCode: '',
      agreeToRules: '',
      agreeNoParties: '',
      understandFlagging: ''
    };
    
    switch (this.currentStep) {
      case 0: // User identification
        if (!this.formData.name.trim()) newErrors.name = "Name is required";
        if (!this.formData.email.trim()) newErrors.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        if (!this.formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!this.formData.address.trim()) newErrors.address = "Address is required";
        
        // Check verification options
        if (!this.formData.airbnbProfile.trim() && 
            !this.formData.vrboProfile.trim() && 
            !this.formData.otherPlatformProfile.trim() && 
            !this.formData.consentToBackgroundCheck &&
            !this.userIdentification.isVerified &&
            this.verificationStatus !== 'VERIFIED' &&
            this.verificationStatus !== 'MANUAL_REVIEW') {
          newErrors.verification = "Either a platform profile, screenshot verification, or consent to background check is required";
        }
        break;
        
      case 1: // Booking info
        if (!this.formData.platform) newErrors.platform = "Please select a platform";
        if (!this.formData.listingLink.trim()) newErrors.listingLink = "Listing link is required";
        if (!this.formData.checkInDate) newErrors.checkInDate = "Check-in date is required";
        if (!this.formData.checkOutDate) newErrors.checkOutDate = "Check-out date is required";
        
        // Validate check-out date is after check-in date
        if (this.formData.checkInDate && this.formData.checkOutDate) {
          const checkIn = new Date(this.formData.checkInDate);
          const checkOut = new Date(this.formData.checkOutDate);
          
          if (checkOut <= checkIn) {
            newErrors.checkOutDate = "Check-out date must be after check-in date";
          }
        }
        break;
        
      case 2: // Stay intent & group profile
        if (!this.formData.stayPurpose) newErrors.stayPurpose = "Please select a purpose";
        if (this.formData.stayPurpose === 'Other' && !this.formData.otherPurpose.trim()) {
          newErrors.otherPurpose = "Please specify your purpose";
        }
        
        if (this.formData.travelingNearHome && !this.formData.zipCode.trim()) {
          newErrors.zipCode = "ZIP code is required";
        }
        break;
        
      case 3: // Agreement acknowledgement
        if (!this.formData.agreeToRules) {
          newErrors.agreeToRules = "You must agree to follow property rules";
        }
        if (!this.formData.agreeNoParties) {
          newErrors.agreeNoParties = "You must agree to the no unauthorized parties policy";
        }
        if (!this.formData.understandFlagging) {
          newErrors.understandFlagging = "You must acknowledge the flagging policy";
        }
        break;
    }
    
    this.errors = newErrors;
    this.isFormValid = Object.values(newErrors).every(error => !error);
  }
  
  // Handle next step
  async handleNextStep() {
    if (!this.isFormValid) {
      return;
    }
    
    // Special handling for first step (user identification)
    if (this.currentStep === 0) {
      // If screenshot verification is shown and there's data, upload it first
      if (this.showScreenshotUpload && this.screenshotData && 
          this.verificationStatus !== 'VERIFIED' && 
          this.verificationStatus !== 'MANUAL_REVIEW') {
        const uploadSuccess = await this.uploadScreenshot();
        if (!uploadSuccess) return;
      }
      
      const userVerified = await this.handleCheckUser();
      if (!userVerified) return;
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
  
  // Handle previous step
  handlePreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      this.saveFormData();
      this.validateForm();
      this.render();
    }
  }
  
  // Check user verification
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
      // In a real implementation, you would call your AWS Lambda function here
      // For demonstration, we'll simulate a response
      
      // This would be a call to your Lambda function through API Gateway
      const response = await fetch(`${this.API_BASE_URL}/user-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.formData.email,
          name: this.formData.name,
          phone: this.formData.phone,
          address: this.formData.address
        })
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Network error checking user status. Please try again.');
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.found) {
        // User exists in the system
        this.userIdentification = {
          caslKeyId: result.userData.caslKeyId,
          isExistingUser: true,
          isVerified: result.userData.isVerified,
          verificationType: 'existing',
          isChecking: false,
          error: null,
          platformData: null,
          idVerificationData: null
        };
      } else {
        // Generate new CASL Key ID for new user
        const newId = this.generateCASLKeyId();
        
        // By this point we might already have verified them via screenshot
        const isVerified = this.verificationStatus === 'VERIFIED' || 
                           this.verificationStatus === 'MANUAL_REVIEW';
        
        // Update user identification with the new CASL Key ID
        this.userIdentification = {
          caslKeyId: newId,
          isExistingUser: false,
          isVerified: isVerified,
          verificationType: isVerified ? 'screenshot' : null,
          isChecking: false,
          error: null,
          platformData: null,
          idVerificationData: null
        };
      }
      
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
  
  // Handle form submission
  async handleSubmit() {
    if (!this.isFormValid) return;

    this.isLoading = true;
    this.render();

    try {
      // Calculate score and get trust level results
      const result = this.calculateScore();
      const trustLevel = this.getTrustLevel(result.score);
      const message = this.getResultMessage(trustLevel);
      
      // Save results locally
      this.score = result.score;
      this.trustLevel = trustLevel;
      this.message = message;
      this.deductions = result.deductions;
      
      // Prepare verification data for database sync
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
          deductions: result.deductions,
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
          nonOvernightGuests: this.formData.nonOvernightGuests,
          travelingNearHome: this.formData.travelingNearHome,
          previousExperience: this.formData.usedSTRBefore
        }
      };
      
      // In a real implementation, you would submit this data to your AWS Lambda function
      // For demonstration, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
          verificationData
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
  
  // Generate a CASL Key ID
  generateCASLKeyId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'CK';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
  
  // Calculate score
  calculateScore() {
    // Start with 100 points
    let totalScore = 100;
    const scoreDeductions = [];
    
    // Apply deductions based on answers
    
    // Special occasion deduction
    if (this.formData.stayPurpose === 'Special Occasion') {
      totalScore -= 5;
      scoreDeductions.push({ reason: 'Special occasion/birthday', points: -5 });
    }
    
    // 6+ guests deduction
    if (this.formData.totalGuests > 5) {
      totalScore -= 3;
      scoreDeductions.push({ reason: '6+ guests', points: -3 });
    }
    
    // Non-overnight guests deduction
    if (this.formData.nonOvernightGuests) {
      totalScore -= 2;
      scoreDeductions.push({ reason: 'Additional (non-overnight) visitors', points: -2 });
    }
    
    // Traveling near home deduction
    if (this.formData.travelingNearHome) {
      totalScore -= 3;
      scoreDeductions.push({ reason: 'Booking within 20 miles of home', points: -3 });
    }
    
    // First-time STR guest deduction
    if (!this.formData.usedSTRBefore) {
      totalScore -= 5;
      scoreDeductions.push({ reason: 'First-time STR guest', points: -5 });
    }
    
    // Last-minute booking deduction
    const daysUntilCheckIn = this.getDaysUntilCheckIn();
    if (daysUntilCheckIn !== null && daysUntilCheckIn <= 2) {
      totalScore -= 3;
      scoreDeductions.push({ reason: 'Booking within 48 hours of check-in', points: -3 });
    }
    
    // Add bonus for verified platform profiles
    if (this.userIdentification.platformData && this.userIdentification.platformData.reviewCount > 5) {
      totalScore += 3;
      scoreDeductions.push({ reason: 'Well-reviewed on platform', points: +3 });
    }
    
    // Set final score (min 0, max 100)
    const finalScore = Math.max(0, Math.min(100, totalScore));
    
    return { score: finalScore, deductions: scoreDeductions };
  }
  
  // Calculate days until check-in
  getDaysUntilCheckIn() {
    if (!this.formData.checkInDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(this.formData.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  // Get trust level based on score
  getTrustLevel(score) {
    if (score >= 85) return 'verified';
    if (score >= 70) return 'review';
    if (score >= 50) return 'denied';
    return 'flagged';
  }
  
  // Get result message based on trust level
  getResultMessage(trustLevel) {
    switch (trustLevel) {
      case 'verified':
        return "You're officially CASL Key Verified! Your trust badge is valid for 12 months and can be shared with any CASL Key host. Keep your badge active by booking responsibly.";
      case 'review':
        return "You're almost there! While you're verified, your Trust Score indicates a few flags (e.g., local booking or large group). Hosts may ask additional questions.";
      case 'denied':
        return "We're unable to approve your CASL Key Trust Pass at this time. You may reapply in 90 days or contact support to resolve outstanding concerns.";
      case 'flagged':
        return "Your application has been flagged. You cannot reapply for 90 days. Please contact CASL support for more information.";
      default:
        return "";
    }
  }
  
  // Reset the form
  handleReset() {
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
    this.userIdentification = {
      caslKeyId: null,
      isExistingUser: false,
      isVerified: false,
      verificationType: null,
      isChecking: false,
      error: null,
      platformData: null,
      idVerificationData: null
    };
    this.currentStep = 0;
    this.submitted = false;
    this.score = 0;
    this.trustLevel = '';
    this.message = '';
    this.deductions = [];
    this.showScreenshotUpload = false;
    this.screenshotData = null;
    this.verificationStatus = 'NOT_SUBMITTED';
    
    this.validateForm();
    this.clearSavedData();
    this.render();
  }
  
  // Save form data to local storage
  saveFormData() {
    if (!this.submitted) {
      localStorage.setItem('caslVerificationForm', JSON.stringify(this.formData));
      localStorage.setItem('caslVerificationStep', this.currentStep.toString());
      localStorage.setItem('caslVerificationFormSaved', Date.now().toString());
    }
  }
  
  // Load saved form data from local storage
  loadSavedData() {
    const savedForm = localStorage.getItem('caslVerificationForm');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        const savedTime = localStorage.getItem('caslVerificationFormSaved');
        
        if (savedTime) {
          const hoursSinceSaved = (Date.now() - parseInt(savedTime)) / (1000 * 60 * 60);
          if (hoursSinceSaved < 24) {
            this.formData = parsedForm;
            this.currentStep = parseInt(localStorage.getItem('caslVerificationStep') || '0');
            this.showRestoredMessage = true;
            setTimeout(() => {
              this.showRestoredMessage = false;
              this.render();
            }, 5000);
          }
        }
      } catch (e) {
        console.error('Error restoring saved form:', e);
        this.clearSavedData();
      }
    }
    
    this.validateForm();
  }
  
  // Clear saved data
  clearSavedData() {
    localStorage.removeItem('caslVerificationForm');
    localStorage.removeItem('caslVerificationStep');
    localStorage.removeItem('caslVerificationFormSaved');
    this.showRestoredMessage = false;
  }
  
  // Clear API error
  clearApiError() {
    this.apiError = null;
    this.render();
  }
  
  // Setup event listeners
  setupEventListeners() {
    // No additional setup needed as we're using inline event handlers
  }
}

// Register the custom element
customElements.define('casl-verification', CASLVerification);