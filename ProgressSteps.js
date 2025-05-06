// src/components/common/ProgressSteps.js
import { FORM_STEPS } from '../../utils/constants.js';

/**
 * Renders progress steps indicator
 * @param {number} currentStep - Current step index
 * @returns {string} HTML string for progress steps
 */
export function renderProgressSteps(currentStep) {
  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100;
  
  let stepsHtml = '';
  
  FORM_STEPS.forEach((step, index) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    const color = index <= currentStep ? 'var(--primary-color)' : '#999';
    const bgColor = isCompleted ? 'var(--primary-color)' : (isActive ? 'white' : '#ddd');
    const textColor = isCompleted ? 'white' : (isActive ? 'var(--primary-color)' : '#666');
    const borderStyle = isActive ? '2px solid var(--primary-color)' : 'none';
    
    stepsHtml += `
      <div 
        class="step" 
        style="color: ${color}" 
        role="tab" 
        aria-selected="${isActive ? 'true' : 'false'}" 
        aria-label="Step ${index + 1}: ${step} ${isCompleted ? '(completed)' : isActive ? '(current)' : ''}"
      >
        <div class="step-indicator" style="background-color: ${bgColor}; color: ${textColor}; border: ${borderStyle}">
          ${isCompleted ? '✓' : index + 1}
        </div>
        <span>${step}</span>
      </div>
    `;
  });
  
  return `
    <div class="progress-steps" role="tablist" aria-label="Form progress">
      ${stepsHtml}
    </div>
    <div class="progress-bar" role="progressbar" aria-valuenow="${currentStep + 1}" aria-valuemin="1" aria-valuemax="${FORM_STEPS.length}">
      <div class="progress-indicator" style="width: ${progressPercentage}%"></div>
    </div>
    <div class="mobile-step-indicator" style="text-align: center; margin-bottom: 20px; display: none">
      <span style="font-weight: bold">Step ${currentStep + 1} of ${FORM_STEPS.length}: ${FORM_STEPS[currentStep]}</span>
    </div>
  `;
}
