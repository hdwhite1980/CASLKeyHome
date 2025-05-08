// src/utils/accessibilityMessages.js
import { FORM_STEPS } from './constants.js';

/**
 * Accessibility messages for screen readers and announcements
 */
export const accessibilityMessages = {
  // Form navigation
  stepChange: (step, totalSteps) => 
    `Moving to step ${step} of ${totalSteps}: ${FORM_STEPS[step - 1]}`,
  
  navigationInstructions: 
    `This form has multiple steps. Use the Next and Previous buttons to navigate. Required fields are marked with an asterisk.`,
  
  // Form validation
  formErrors: (count) => {
    if (count === 1) return "1 form field has an error. Please correct it before proceeding.";
    return `${count} form fields have errors. Please correct them before proceeding.`;
  },
  
  // Status updates
  loading: (step) => {
    if (!step) return "Loading content, please wait.";
    return `Loading step ${step + 1}: ${FORM_STEPS[step]}. Please wait.`;
  },
  
  verificationProcessing: 
    "Your verification is being processed. This may take a minute. Please wait.",
  
  // Results
  verificationComplete: (caslKeyId, score, trustLevel) =>
    `Verification complete! Your CASL Key ID is ${caslKeyId}. Your trust score is ${score} out of 100, rated as ${trustLevel}.`,
  
  verificationFailed:
    "Verification could not be completed. Please check the provided information.",
  
  // Verification methods
  verificationMethod: {
    success: (method) => `${method} verification successful! This will improve your trust score.`,
    failed: (method) => `${method} verification failed. You can try again or use a different method.`,
    inProgress: (method) => `${method} verification in progress. Please wait.`
  },
  
  // Field-specific messages
  requiredField: (field) => `${field} is required.`,
  invalidField: (field) => `${field} is invalid.`,
  
  // Screen reader only instructions
  focusInstructions:
    "Use Tab key to navigate between form fields. Required fields are marked with an asterisk.",
  
  errorContext:
    "There are errors in the form. Each field with an error has been marked."
};
