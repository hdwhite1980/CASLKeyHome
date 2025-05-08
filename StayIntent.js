// src/components/FormSteps/StayIntent.js
import { renderTooltip } from '../common/Alerts.js';
import { renderAccessibleFormField } from '../common/AccessibleFormField.js';

/**
 * Renders the Stay Intent form step with enhanced accessibility
 * @param {Object} formData - Form data values
 * @param {Object} errors - Validation errors
 * @returns {string} HTML string for stay intent step
 */
export function renderStayIntent(formData, errors) {
  // Purpose options for dropdown
  const purposeOptions = [
    { value: '', label: 'Select purpose' },
    { value: 'Business', label: 'Business' },
    { value: 'Family Visit', label: 'Family Visit' },
    { value: 'Vacation', label: 'Vacation' },
    { value: 'Special Occasion', label: 'Special Occasion' },
    { value: 'Relocation', label: 'Relocation' },
    { value: 'Medical Stay', label: 'Medical Stay' },
    { value: 'Other', label: 'Other' }
  ];

  return `
    <div class="form-section" role="form" aria-labelledby="stay-intent-heading">
      <h2 id="stay-intent-heading">Stay Intent & Group Profile</h2>
      
      <div class="sr-only" id="stay-intent-instructions">
        This section collects information about your stay purpose and guest details. Required fields are marked with an asterisk.
      </div>
      
      <fieldset aria-describedby="stay-intent-instructions">
        <legend class="sr-only">Stay Purpose Information</legend>
        
        ${renderAccessibleFormField({
          id: 'purpose-select',
          name: 'stayPurpose',
          label: `What is the primary purpose of your stay?`,
          tooltip: renderTooltip("This helps hosts understand why you're traveling."),
          type: 'select',
          value: formData.stayPurpose || '',
          required: true,
          error: errors.stayPurpose || '',
          options: purposeOptions
        })}
        
        ${formData.stayPurpose === 'Other' ? 
          renderAccessibleFormField({
            id: 'other-purpose-input',
            name: 'otherPurpose',
            label: 'Please specify',
            value: formData.otherPurpose || '',
            required: true,
            error: errors.otherPurpose || ''
          }) : ''}
      </fieldset>
      
      <fieldset>
        <legend class="sr-only">Guest Information</legend>
        
        ${renderAccessibleFormField({
          id: 'guests-input',
          name: 'totalGuests',
          label: 'How many total guests will stay?',
          type: 'number',
          value: formData.totalGuests || '',
          required: true,
          error: errors.totalGuests || '',
          min: 1,
          max: 20
        })}
        
        ${renderAccessibleFormField({
          id: 'children-checkbox',
          name: 'childrenUnder12',
          label: `Are there any children under 12?`,
          tooltip: renderTooltip("Having children in your group may positively affect your trust score."),
          type: 'checkbox',
          value: formData.childrenUnder12 || false
        })}
        
        ${renderAccessibleFormField({
          id: 'non-overnight-checkbox',
          name: 'nonOvernightGuests',
          label: `Will any guests not be staying overnight?`,
          tooltip: renderTooltip("This helps hosts understand if additional visitors may be present during the day."),
          type: 'checkbox',
          value: formData.nonOvernightGuests || false
        })}
      </fieldset>
      
      <fieldset>
        <legend class="sr-only">Location Information</legend>
        
        ${renderAccessibleFormField({
          id: 'local-travel-checkbox',
          name: 'travelingNearHome',
          label: `Are you traveling within 20 miles of your home?`,
          tooltip: renderTooltip("Local bookings may require additional context for verification."),
          type: 'checkbox',
          value: formData.travelingNearHome || false
        })}
        
        ${formData.travelingNearHome ? 
          renderAccessibleFormField({
            id: 'zipcode-input',
            name: 'zipCode',
            label: 'ZIP code',
            value: formData.zipCode || '',
            required: true,
            error: errors.zipCode || '',
            autocomplete: 'postal-code'
          }) : ''}
      </fieldset>
      
      <fieldset>
        <legend class="sr-only">Booking Experience</legend>
        
        ${renderAccessibleFormField({
          id: 'used-str-checkbox',
          name: 'usedSTRBefore',
          label: `Have you used short-term rentals before?`,
          tooltip: renderTooltip("Prior rental experience may positively impact your trust score."),
          type: 'checkbox',
          value: formData.usedSTRBefore || false
        })}
        
        ${formData.usedSTRBefore ? 
          renderAccessibleFormField({
            id: 'previous-stays-input',
           name: 'previousStayLinks',
           label: 'Optional: Previous stay links',
           type: 'textarea',
           value: formData.previousStayLinks || '',
           placeholder: 'Enter links to previous stays (optional)',
           description: 'Providing links to your previous stays can help build trust with hosts and improve your verification score.'
         }) : ''}
     </fieldset>
   </div>
 `;
}
