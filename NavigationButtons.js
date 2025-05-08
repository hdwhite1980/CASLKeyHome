// src/components/common/NavigationButtons.js
import { FORM_STEPS } from '../../utils/constants.js';

/**
 * Renders accessible navigation buttons for form steps
 * @param {number} currentStep - Current step index
 * @param {boolean} isFormValid - Whether current form step is valid
 * @param {boolean} isLoading - Whether a request is in progress
 * @returns {string} HTML string for navigation buttons
 */
export function renderNavigationButtons(currentStep, isFormValid, isLoading) {
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  
  // Previous button attributes
  const prevButtonDisabled = isFirstStep ? 'disabled' : '';
  const prevButtonStyle = isFirstStep ? 'background-color: var(--neutral-light);' : '';
  const prevButtonAriaLabel = `Go to previous step: ${currentStep > 0 ? FORM_STEPS[currentStep - 1] : ''}`;
  
  // Next button attributes
  const nextButtonDisabled = !isFormValid || isLoading ? 'disabled' : '';
  const nextButtonStyle = (!isFormValid || isLoading) ? 'opacity: 0.7;' : '';
  const nextButtonAction = isLastStep ? 'Submit form' : `Go to next step: ${FORM_STEPS[currentStep + 1]}`;
  const nextButtonClass = `navigation-button next-button ${isLastStep ? 'submit-button' : ''}`;
  
  return `
    <div class="navigation-buttons" role="navigation" aria-label="Form navigation">
      <button 
        data-event-click="handlePreviousStep"
        ${prevButtonDisabled}
        style="${prevButtonStyle}"
        aria-label="${prevButtonAriaLabel}"
        class="navigation-button prev-button"
      >
        <span aria-hidden="true">←</span> Previous
      </button>
      
      <button 
        data-event-click="handleNextStep"
        ${nextButtonDisabled}
        style="${nextButtonStyle}"
        aria-label="${nextButtonAction}"
        class="${nextButtonClass}"
      >
        ${isLoading ? `
          <span class="loading-indicator" aria-hidden="true">
            <!-- Loading indicator SVG -->
            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="presentation">
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
            <span class="sr-only">${isLastStep ? 'Submitting form' : 'Loading next step'}</span>
          </span>
          <span>${isLastStep ? 'Submitting...' : 'Loading...'}</span>
        ` : isLastStep ? 'Submit' : 'Next <span aria-hidden="true">→</span>'}
      </button>
    </div>
    
    <style>
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .loading-indicator svg {
          animation: none !important;
        }
      }
    </style>
  `;
}
