// src/components/common/NavigationButtons.js
import { FORM_STEPS } from '../../utils/constants.js';

/**
 * Renders navigation buttons for form steps
 * @param {number} currentStep - Current step index
 * @param {boolean} isFormValid - Whether current form step is valid
 * @param {boolean} isLoading - Whether a request is in progress
 * @returns {string} HTML string for navigation buttons
 */
export function renderNavigationButtons(currentStep, isFormValid, isLoading) {
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  
  return `
    <div class="navigation-buttons">
      <button 
        onclick="this.getRootNode().host.handlePreviousStep()"
        ${currentStep === 0 ? 'disabled' : ''}
        style="background-color: ${currentStep === 0 ? '#ccc' : 'var(--neutral-color)'}"
        aria-label="Go to previous step"
      >
        Previous
      </button>
      
      <button 
        onclick="this.getRootNode().host.handleNextStep()"
        ${!isFormValid || isLoading ? 'disabled' : ''}
        style="opacity: ${(!isFormValid || isLoading) ? 0.7 : 1}"
        aria-label="${isLastStep ? 'Submit form' : 'Go to next step'}"
      >
        ${isLoading ? `
          <span>
            <span style="display: inline-block; margin-right: 8px" aria-hidden="true">
              <!-- Loading indicator SVG -->
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
            <span aria-live="polite">${isLastStep ? 'Submitting...' : 'Loading...'}</span>
          </span>
        ` : isLastStep ? 'Submit' : 'Next'}
      </button>
    </div>
  `;
}
