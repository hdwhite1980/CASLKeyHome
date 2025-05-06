// src/components/FormSteps/UserIdentification.js
import { VERIFICATION_STATUSES } from '../../utils/constants.js';
import { renderTooltip, renderBackgroundCheckNotification } from '../common/Alerts.js';

/**
 * Renders the User Identification form step
 * @param {Object} formData - Form data values
 * @param {Object} errors - Validation errors
 * @param {Object} userIdentification - User identification data
 * @param {boolean} showScreenshotUpload - Whether to show screenshot upload
 * @param {string|null} screenshotData - Screenshot data URL
 * @param {string} verificationStatus - Current verification status
 * @returns {string} HTML string for user identification step
 */
export function renderUserIdentification(
  formData, 
  errors, 
  userIdentification, 
  showScreenshotUpload, 
  screenshotData, 
  verificationStatus
) {
  if (userIdentification.isChecking) {
    return `
      <div class="form-section" style="text-align: center">
        <h2>User Identification</h2>
        <p>Checking user status...</p>
        <div role="status" aria-live="polite">Verifying your information. Please wait.</div>
      </div>
    `;
  }
  
  let platformVerificationHtml = '';
  
  // Add the screenshot upload section if shown
  if (showScreenshotUpload) {
    platformVerificationHtml = `
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <h3>Platform Verification via Screenshot</h3>
        <p>Please upload a screenshot of your Airbnb or VRBO profile page to verify your account.</p>
        
        <div class="screenshot-container" 
             id="screenshot-dropzone"
             ondragover="this.getRootNode().host.handleDragOver(event)"
             ondragleave="this.getRootNode().host.handleDragLeave(event)"
             ondrop="this.getRootNode().host.handleDrop(event)">
          ${screenshotData ? `
            <p>Screenshot Preview:</p>
            <img src="${screenshotData}" class="screenshot-preview" alt="Uploaded profile screenshot" />
            <button onclick="this.getRootNode().host.clearScreenshot()" class="neutral">Remove Screenshot</button>
          ` : `
            <p>Drag a screenshot here or click to select a file</p>
            <input 
              type="file" 
              accept="image/*" 
              id="screenshot-input" 
              class="file-input"
              aria-label="Upload profile screenshot"
              onchange="this.getRootNode().host.handleScreenshotUpload(event)" 
            />
          `}
        </div>
        
        ${verificationStatus === VERIFICATION_STATUSES.PROCESSING ? `
          <div class="alert alert-info">
            <p>Your screenshot is being processed. This may take a minute...</p>
            <div role="status" aria-live="polite">Processing screenshot. This may take a minute.</div>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.VERIFIED ? `
          <div class="alert alert-success">
            <p>✅ Your account has been verified successfully!</p>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.MANUAL_REVIEW ? `
          <div class="alert alert-warning">
            <p>👀 Your screenshot has been submitted for manual review. We'll notify you once it's verified.</p>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.REJECTED ? `
          <div class="alert alert-error">
            <p>❌ We couldn't verify your account from this screenshot. Please try again with a clearer image.</p>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Check if we need to show the background check consent
  const needsBackgroundCheck = !formData.airbnbProfile && 
                            !formData.vrboProfile && 
                            !formData.otherPlatformProfile &&
                            !userIdentification.isVerified &&
                            verificationStatus !== VERIFICATION_STATUSES.VERIFIED &&
                            verificationStatus !== VERIFICATION_STATUSES.MANUAL_REVIEW;
  
  return `
    <div class="form-section" role="form" aria-labelledby="user-id-heading">
      <h2 id="user-id-heading">User Identification</h2>
      
      ${userIdentification.error ? `
        <div class="alert alert-error" role="alert" aria-live="assertive">
          ${userIdentification.error}
        </div>
      ` : ''}
      
      ${userIdentification.caslKeyId && userIdentification.isExistingUser ? `
        <div class="alert alert-success" role="status">
          Welcome back! We found your existing CASL Key ID: ${userIdentification.caslKeyId}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 15px;">
        <label for="name-input">Full Name*</label>
        <input 
          type="text" 
          id="name-input"
          name="name" 
          value="${formData.name}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.name ? 'true' : 'false'}"
          aria-describedby="${errors.name ? 'name-error' : ''}"
        />
        ${errors.name ? `<p id="name-error" class="error" role="alert">${errors.name}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="email-input">Email Address*</label>
        <input 
          type="email" 
          id="email-input"
          name="email" 
          value="${formData.email}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.email ? 'true' : 'false'}"
          aria-describedby="${errors.email ? 'email-error' : ''}"
        />
        ${errors.email ? `<p id="email-error" class="error" role="alert">${errors.email}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="phone-input">Phone Number*</label>
        <input 
          type="tel" 
          id="phone-input"
          name="phone" 
          value="${formData.phone}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.phone ? 'true' : 'false'}"
          aria-describedby="${errors.phone ? 'phone-error' : ''}"
        />
        ${errors.phone ? `<p id="phone-error" class="error" role="alert">${errors.phone}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="address-input">Address*</label>
        <input 
          type="text" 
          id="address-input"
          name="address" 
          value="${formData.address}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.address ? 'true' : 'false'}"
          aria-describedby="${errors.address ? 'address-error' : ''}"
        />
        ${errors.address ? `<p id="address-error" class="error" role="alert">${errors.address}</p>` : ''}
      </div>
      
      <h3>Platform Verification
        ${renderTooltip("Providing a platform profile helps verify your identity and may improve your trust score.")}
      </h3>
      
      <div style="margin-bottom: 15px;">
        <label for="airbnb-input">Airbnb Profile Link (Optional)</label>
        <input 
          type="url" 
          id="airbnb-input"
          name="airbnbProfile" 
          value="${formData.airbnbProfile}" 
          placeholder="https://www.airbnb.com/users/show/123456789"
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <p style="font-size: 12px; color: #666;">Providing a profile helps with verification</p>
      </div>

      <div style="margin-bottom: 15px;">
        <label for="vrbo-input">Vrbo Profile Link (Optional)</label>
        <input 
          type="url" 
          id="vrbo-input"
          name="vrboProfile" 
          value="${formData.vrboProfile}" 
          placeholder="https://www.vrbo.com/user/12345abcde"
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label for="other-platform-select">Other Platform Profile (Optional)</label>
        <div style="display: flex; gap: 10px;">
          <select
            id="other-platform-select"
            name="otherPlatformType"
            value="${formData.otherPlatformType}"
            onchange="this.getRootNode().host.handleInputChange(event)"
            style="flex: 1"
          >
            <option value="">Select platform</option>
            <option value="booking" ${formData.otherPlatformType === 'booking' ? 'selected' : ''}>Booking.com</option>
            <option value="tripadvisor" ${formData.otherPlatformType === 'tripadvisor' ? 'selected' : ''}>TripAdvisor</option>
            <option value="homeaway" ${formData.otherPlatformType === 'homeaway' ? 'selected' : ''}>HomeAway</option>
            <option value="other" ${formData.otherPlatformType === 'other' ? 'selected' : ''}>Other</option>
          </select>
          
          <input
            type="url"
            id="other-platform-input"
            name="otherPlatformProfile"
            value="${formData.otherPlatformProfile}"
            placeholder="https://example.com/profile/123"
            onchange="this.getRootNode().host.handleInputChange(event)"
            style="flex: 2"
          />
        </div>
      </div>
      
      ${!formData.airbnbProfile && !formData.vrboProfile && !formData.otherPlatformProfile ? `
        <button 
          onclick="this.getRootNode().host.toggleScreenshotUpload(true)" 
          class="success"
          style="margin-bottom: 15px"
        >
          Verify with Account Screenshot
        </button>
        
        ${renderBackgroundCheckNotification(needsBackgroundCheck)}
        
        <div class="checkbox-container">
          <input 
            type="checkbox" 
            id="bg-check-consent"
            name="consentToBackgroundCheck" 
            ${formData.consentToBackgroundCheck ? 'checked' : ''} 
            onchange="this.getRootNode().host.handleInputChange(event)"
          />
          <label for="bg-check-consent" class="checkbox-label">
            I consent to a background check to verify my identity. 
            This is necessary if you don't provide any platform profile links.
            ${renderTooltip("Background checks only verify your identity. Only a pass/fail result is stored, never your personal details.")}
          </label>
        </div>
      ` : ''}
      
      ${errors.verification ? `<p class="error" role="alert">${errors.verification}</p>` : ''}
      
      ${platformVerificationHtml}
    </div>
  `;
}
