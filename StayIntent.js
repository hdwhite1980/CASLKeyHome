// src/components/FormSteps/StayIntent.js
import { renderTooltip } from '../common/Alerts.js';

/**
 * Renders the Stay Intent form step
 * @param {Object} formData - Form data values
 * @param {Object} errors - Validation errors
 * @returns {string} HTML string for stay intent step
 */
export function renderStayIntent(formData, errors) {
  return `
    <div class="form-section" role="form" aria-labelledby="stay-intent-heading">
      <h2 id="stay-intent-heading">Stay Intent & Group Profile</h2>
      
      <div style="margin-bottom: 15px;">
        <label for="purpose-select">What is the primary purpose of your stay?*
          ${renderTooltip("This helps hosts understand why you're traveling.")}
        </label>
        <select 
          id="purpose-select"
          name="stayPurpose" 
          value="${formData.stayPurpose}" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.stayPurpose ? 'true' : 'false'}"
          aria-describedby="${errors.stayPurpose ? 'purpose-error' : ''}"
        >
          <option value="">Select purpose</option>
          <option value="Business" ${formData.stayPurpose === 'Business' ? 'selected' : ''}>Business</option>
          <option value="Family Visit" ${formData.stayPurpose === 'Family Visit' ? 'selected' : ''}>Family Visit</option>
          <option value="Vacation" ${formData.stayPurpose === 'Vacation' ? 'selected' : ''}>Vacation</option>
          <option value="Special Occasion" ${formData.stayPurpose === 'Special Occasion' ? 'selected' : ''}>Special Occasion</option>
          <option value="Relocation" ${formData.stayPurpose === 'Relocation' ? 'selected' : ''}>Relocation</option>
          <option value="Medical Stay" ${formData.stayPurpose === 'Medical Stay' ? 'selected' : ''}>Medical Stay</option>
          <option value="Other" ${formData.stayPurpose === 'Other' ? 'selected' : ''}>Other</option>
        </select>
        ${errors.stayPurpose ? `<p id="purpose-error" class="error" role="alert">${errors.stayPurpose}</p>` : ''}
      </div>
      
      ${formData.stayPurpose === 'Other' ? `
        <div style="margin-bottom: 15px;">
          <label for="other-purpose-input">Please specify*</label>
          <input 
            type="text" 
            id="other-purpose-input"
            name="otherPurpose" 
            value="${formData.otherPurpose}" 
            onchange="this.getRootNode().host.handleInputChange(event)"
            aria-required="true"
            aria-invalid="${errors.otherPurpose ? 'true' : 'false'}"
            aria-describedby="${errors.otherPurpose ? 'other-purpose-error' : ''}"
          />
          ${errors.otherPurpose ? `<p id="other-purpose-error" class="error" role="alert">${errors.otherPurpose}</p>` : ''}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 15px;">
        <label for="guests-input">How many total guests will stay?*</label>
        <input 
          type="number" 
          id="guests-input"
          name="totalGuests" 
          value="${formData.totalGuests}" 
          min="1" 
          max="20" 
          onchange="this.getRootNode().host.handleInputChange(event)"
          aria-required="true"
          aria-invalid="${errors.totalGuests ? 'true' : 'false'}"
          aria-describedby="${errors.totalGuests ? 'guests-error' : ''}"
        />
        ${errors.totalGuests ? `<p id="guests-error" class="error" role="alert">${errors.totalGuests}</p>` : ''}
      </div>
      
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="children-checkbox"
          name="childrenUnder12" 
          ${formData.childrenUnder12 ? 'checked' : ''} 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <label for="children-checkbox" class="checkbox-label">
          Are there any children under 12?
          ${renderTooltip("Having children in your group may positively affect your trust score.")}
        </label>
      </div>
      
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="non-overnight-checkbox"
          name="nonOvernightGuests" 
          ${formData.nonOvernightGuests ? 'checked' : ''} 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <label for="non-overnight-checkbox" class="checkbox-label">
          Will any guests not be staying overnight?
          ${renderTooltip("This helps hosts understand if additional visitors may be present during the day.")}
        </label>
      </div>
      
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="local-travel-checkbox"
          name="travelingNearHome" 
          ${formData.travelingNearHome ? 'checked' : ''} 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <label for="local-travel-checkbox" class="checkbox-label">
          Are you traveling within 20 miles of your home?
          ${renderTooltip("Local bookings may require additional context for verification.")}
        </label>
      </div>
      
      ${formData.travelingNearHome ? `
        <div style="margin-bottom: 15px; margin-left: 25px;">
          <label for="zipcode-input">ZIP code*</label>
          <input 
            type="text" 
            id="zipcode-input"
            name="zipCode" 
            value="${formData.zipCode}" 
            placeholder="Enter your ZIP code" 
            onchange="this.getRootNode().host.handleInputChange(event)"
            aria-required="true"
            aria-invalid="${errors.zipCode ? 'true' : 'false'}"
            aria-describedby="${errors.zipCode ? 'zipcode-error' : ''}"
          />
          ${errors.zipCode ? `<p id="zipcode-error" class="error" role="alert">${errors.zipCode}</p>` : ''}
        </div>
      ` : ''}
      
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          id="used-str-checkbox"
          name="usedSTRBefore" 
          ${formData.usedSTRBefore ? 'checked' : ''} 
          onchange="this.getRootNode().host.handleInputChange(event)"
        />
        <label for="used-str-checkbox" class="checkbox-label">
          Have you used short-term rentals before?
          ${renderTooltip("Prior rental experience may positively impact your trust score.")}
        </label>
      </div>
      
      ${formData.usedSTRBefore ? `
        <div style="margin-bottom: 15px; margin-left: 25px;">
          <label for="previous-stays-input">Optional: Previous stay links</label>
          <textarea 
            id="previous-stays-input"
            name="previousStayLinks" 
            placeholder="Enter links to previous stays (optional)" 
            rows="2"
            onchange="this.getRootNode().host.handleInputChange(event)"
          >${formData.previousStayLinks}</textarea>
          <p style="font-size: 12px; color: #666;">Providing links to previous stays can improve your trust score</p>
        </div>
      ` : ''}
    </div>
  `;
}
