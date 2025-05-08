// src/components/FormSteps/UserIdentification.js
import { VERIFICATION_STATUSES } from '../../utils/constants.js';
import { renderTooltip, renderBackgroundCheckNotification } from '../common/Alerts.js';
import { renderAccessibleFormField } from '../common/AccessibleFormField.js';
import { accessibilityHelper } from '../../utils/AccessibilityHelper.js';

/**
 * Renders the User Identification form step with enhanced accessibility
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
  // Provide a loading state during user verification check
  if (userIdentification.isChecking) {
    return `
      <div class="form-section" style="text-align: center">
        <h2 id="user-id-heading">User Identification</h2>
        <div class="loading-indicator" aria-hidden="true"></div>
        <p>Checking user status...</p>
        <div role="status" aria-live="polite">Verifying your information. Please wait.</div>
      </div>
    `;
  }
  
  // Platform verification section for screenshot upload
  let platformVerificationHtml = '';
  
  // Add the screenshot upload section if shown
  if (showScreenshotUpload) {
    platformVerificationHtml = `
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <h3 id="screenshot-heading">Platform Verification via Screenshot</h3>
        <p>Please upload a screenshot of your Airbnb or VRBO profile page to verify your account.</p>
        
        <div class="screenshot-container" 
             id="screenshot-dropzone"
             data-event-dragover="handleDragOver"
             data-event-dragleave="handleDragLeave"
             data-event-drop="handleDrop"
             aria-labelledby="screenshot-heading">
          ${screenshotData ? `
            <p>Screenshot Preview:</p>
            <img src="${screenshotData}" class="screenshot-preview" alt="Uploaded profile screenshot" />
            <button 
              data-event-click="clearScreenshot" 
              class="neutral"
              aria-label="Remove uploaded screenshot"
            >
              Remove Screenshot
            </button>
          ` : `
            <p>Drag a screenshot here or click to select a file</p>
            <input 
              type="file" 
              accept="image/*" 
              id="screenshot-input" 
              class="file-input"
              aria-label="Upload profile screenshot"
              data-event-change="handleScreenshotUpload" 
            />
          `}
        </div>
        
        ${verificationStatus === VERIFICATION_STATUSES.PROCESSING ? `
          <div class="alert alert-info" role="status">
            <div class="loading-indicator" aria-hidden="true"></div>
            <p>Your screenshot is being processed. This may take a minute...</p>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.VERIFIED ? `
          <div class="alert alert-success" role="status">
            <p>✅ Your account has been verified successfully!</p>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.MANUAL_REVIEW ? `
          <div class="alert alert-warning" role="status">
            <p>👀 Your screenshot has been submitted for manual review. We'll notify you once it's verified.</p>
          </div>
        ` : verificationStatus === VERIFICATION_STATUSES.REJECTED ? `
          <div class="alert alert-error" role="alert">
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
          <p>Welcome back! We found your existing CASL Key ID: <strong>${userIdentification.caslKeyId}</strong></p>
        </div>
      ` : ''}
      
      <div class="sr-only" id="form-instructions">
        This section collects your personal information for verification. Required fields are marked with an asterisk.
      </div>
      
      <fieldset aria-describedby="form-instructions">
        <legend class="sr-only">Personal Information</legend>
        
        <!-- Using our accessible form fields -->
        ${renderAccessibleFormField({
          id: 'name-input',
          name: 'name',
          label: 'Full Name',
          value: formData.name || '',
          required: true,
          error: errors.name || '',
          autocomplete: 'name'
        })}
        
        ${renderAccessibleFormField({
          id: 'email-input',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          value: formData.email || '',
          required: true,
          error: errors.email || '',
          autocomplete: 'email'
        })}
        
        ${renderAccessibleFormField({
          id: 'phone-input',
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          value: formData.phone || '',
          required: true,
          error: errors.phone || '',
          autocomplete: 'tel'
        })}
        
        ${renderAccessibleFormField({
          id: 'address-input',
          name: 'address',
          label: 'Address',
          value: formData.address || '',
          required: true,
          error: errors.address || '',
          autocomplete: 'street-address'
        })}
      </fieldset>
      
      <fieldset>
        <legend>
          <h3>Platform Verification
            ${renderTooltip("Providing a platform profile helps verify your identity and may improve your trust score.")}
          </h3>
        </legend>
        
        ${renderAccessibleFormField({
          id: 'airbnb-input',
          name: 'airbnbProfile',
          label: 'Airbnb Profile Link',
          type: 'url',
          value: formData.airbnbProfile || '',
          placeholder: 'https://www.airbnb.com/users/show/123456789',
          autocomplete: 'url',
          description: 'Link to your profile page on Airbnb (optional)'
        })}
        
        ${renderAccessibleFormField({
          id: 'vrbo-input',
          name: 'vrboProfile',
          label: 'Vrbo Profile Link',
          type: 'url',
          value: formData.vrboProfile || '',
          placeholder: 'https://www.vrbo.com/user/12345abcde',
          autocomplete: 'url',
          description: 'Link to your profile page on Vrbo (optional)'
        })}
        
        <div class="form-field">
          <label for="other-platform-select">Other Platform Profile (Optional)</label>
          <div style="display: flex; gap: 10px;">
            <select
              id="other-platform-select"
              name="otherPlatformType"
              value="${formData.otherPlatformType || ''}"
              data-event-change="handleInputChange"
              style="flex: 1"
              aria-label="Select platform type"
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
              value="${formData.otherPlatformProfile || ''}"
              placeholder="https://example.com/profile/123"
              data-event-change="handleInputChange"
              style="flex: 2"
              aria-label="Platform profile URL"
              autocomplete="url"
            />
          </div>
          <div class="field-description">Profile link from another travel or booking platform (optional)</div>
        </div>
      </fieldset>
      
      ${!formData.airbnbProfile && !formData.vrboProfile && !formData.otherPlatformProfile ? `
        <div class="alternative-verification-methods">
          <button 
            data-event-click="toggleScreenshotUpload" 
            class="success"
            style="margin-bottom: 15px"
            aria-label="Verify with account screenshot"
          >
            Verify with Account Screenshot
          </button>
          
          ${renderBackgroundCheckNotification(needsBackgroundCheck)}
          
          ${renderAccessibleFormField({
            id: 'bg-check-consent',
            name: 'consentToBackgroundCheck',
            label: `I consent to a background check to verify my identity.`,
            type: 'checkbox',
            value: formData.consentToBackgroundCheck || false,
            description: 'Background checks only verify your identity. Only a pass/fail result is stored, never your personal details. This is necessary if you don\'t provide any platform profile links.'
          })}
        </div>
      ` : ''}
      
      ${errors.verification ? `<p class="error" role="alert">${errors.verification}</p>` : ''}
      
      ${platformVerificationHtml}
    </div>
  `;
}
