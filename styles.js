// src/components/common/Styles.js
import { colorSystem } from '../../utils/ColorSystem.js';

/**
 * Returns CSS styles for the CASL Verification component with enhanced accessibility
 * @returns {string} CSS styles as a string
 */
export function getStyles() {
  return `
    :host {
      display: block;
      font-family: Arial, sans-serif;
      
      /* Use the color system variables */
      ${colorSystem.getCssVariables()}
      
      /* Other design tokens */
      --border-radius: 8px;
      --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      --focus-ring-color: var(--primary-base);
      --focus-ring-width: 3px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-section {
      background-color: var(--background-base);
      padding: 20px;
      border-radius: var(--border-radius);
      margin-bottom: 20px;
      box-shadow: var(--box-shadow);
    }
    
    /* Enhanced focus styles */
    *:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: 2px;
    }
    
    @media (forced-colors: active) {
      *:focus-visible {
        outline: 3px solid CanvasText;
        outline-offset: 3px;
      }
    }
    
    button {
      padding: 10px 20px;
      background-color: var(--primary-base);
      color: var(--primary-contrast);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
      transition: background-color 0.2s, opacity 0.2s;
      font-size: 16px;
    }
    
    button:hover {
      background-color: var(--primary-dark);
    }
    
    button:focus-visible {
      outline: var(--focus-ring-width) solid var(--primary-light);
      outline-offset: 2px;
    }
    
    button:disabled {
      background-color: var(--neutral-light);
      color: var(--neutral-dark);
      cursor: not-allowed;
    }
    
    button.success {
      background-color: var(--success-base);
      color: var(--success-contrast);
    }
    
    button.success:hover {
      background-color: var(--success-dark);
    }
    
    button.warning {
      background-color: var(--warning-base);
      color: var(--warning-contrast);
    }
    
    button.warning:hover {
      background-color: var(--warning-dark);
    }
    
    button.neutral {
      background-color: var(--neutral-base);
      color: var(--neutral-contrast);
    }
    
    button.neutral:hover {
      background-color: var(--neutral-dark);
    }
    
    input, select, textarea {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid var(--neutral-light);
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
      background-color: var(--background-base);
      color: var(--background-contrast);
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--primary-base);
      outline: none;
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: var(--background-contrast);
    }
    
    .error {
      color: var(--error-base);
      font-size: 14px;
      margin-top: -5px;
      margin-bottom: 10px;
    }
    
    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .alert {
      padding: 12px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .alert-success {
      background-color: #e8f5e9;
      color: var(--success-dark);
      border-left: 4px solid var(--success-base);
    }
    
    .alert-error {
      background-color: #ffebee;
      color: var(--error-base);
      border-left: 4px solid var(--error-base);
    }
    
    .alert-info {
      background-color: #e3f2fd;
      color: var(--primary-dark);
      border-left: 4px solid var(--primary-base);
    }
    
    .alert-warning {
      background-color: #fff8e1;
      color: #f57f17;
      border-left: 4px solid var(--warning-base);
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
      background-color: var(--primary-base);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .screenshot-container {
      border: 2px dashed var(--neutral-light);
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 4px;
      transition: border-color 0.2s;
      position: relative;
    }
    
    .screenshot-container:hover {
      border-color: var(--primary-base);
    }
    
    .screenshot-container.drag-over {
      background-color: #f0f7ff;
      border-color: var(--primary-base);
    }
    
    .screenshot-preview {
      max-width: 100%;
      max-height: 300px;
      margin-top: 10px;
      border-radius: 4px;
    }
    
    .file-input {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
      cursor: pointer;
    }
    
    .result-card {
      background-color: white;
      padding: 30px;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      text-align: center;
      margin-bottom: 20px;
    }
    
    .trust-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: bold;
      color: white;
      margin: 15px 0;
    }
    
    .score-display {
      margin: 20px 0;
    }
    
    .score-number {
      font-size: 48px;
      font-weight: bold;
    }
    
    .score-max {
      color: var(--neutral-base);
    }
    
    .result-message {
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;
      font-size: 18px;
      margin: 20px 0;
    }
    
    .adjustments-list {
      margin-top: 30px;
      text-align: left;
    }
    
    .adjustment-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .adjustment-points {
      font-weight: bold;
    }
    
    .adjustment-positive {
      color: var(--success-base);
    }
    
    .adjustment-negative {
      color: var(--error-base);
    }
    
    .tooltip {
      position: relative;
      display: inline-block;
      margin-left: 5px;
      cursor: help;
    }
    
    .tooltip .tooltip-icon {
      background-color: var(--neutral-light);
      color: var(--neutral-dark);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    
    .tooltip .tooltip-text {
      visibility: hidden;
      width: 250px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 8px;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s;
      font-size: 12px;
      font-weight: normal;
    }
    
    .tooltip:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
    
    .checkbox-container {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      padding: 4px 0;
    }
    
    .checkbox-container input[type="checkbox"] {
      width: auto;
      margin-right: 10px;
      margin-top: 3px;
    }
    
    .checkbox-label {
      font-weight: normal;
      flex: 1;
    }
    
    .trust-preview {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      padding: 15px;
      margin-top: 20px;
    }
    
    .trust-preview h3 {
      margin-top: 0;
      font-size: 16px;
      color: #333;
    }
    
    .preview-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      color: white;
      margin-right: 10px;
    }
    
    /* Skip link styles */
    .skip-to-content {
      position: absolute;
      top: -50px;
      left: 0;
      background: var(--primary-base);
      color: var(--primary-contrast);
      padding: 10px 16px;
      z-index: 1000;
      text-decoration: none;
      border-radius: 0 0 4px 0;
      transition: top 0.2s;
      opacity: 0;
    }
    
    .skip-to-content:focus {
      top: 0;
      opacity: 1;
    }
    
    /* Add sr-only class for screen reader text */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    /* Reduce motion styles */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
      
      .progress-indicator {
        transition: none !important;
      }
      
      .tooltip .tooltip-text {
        transition: none !important;
      }
      
      .skip-to-content {
        transition: none !important;
      }
      
      button, input, select, textarea {
        transition: none !important;
      }
    }
    
    /* Enhanced mobile accessibility */
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      .form-section {
        padding: 15px;
      }
      
      .progress-steps {
        display: none;
      }
      
      .mobile-step-indicator {
        display: block !important;
        text-align: center;
        margin-bottom: 20px;
      }
      
      /* Ensure sufficient touch target sizes for mobile */
      button, 
      [role="button"], 
      a,
      .checkbox-container,
      input[type="checkbox"],
      input[type="radio"],
      select, 
      .tooltip {
        min-height: 44px;
        min-width: 44px;
      }
      
      button {
        padding: 12px 20px;
        width: 100%;
        margin: 5px 0;
        font-size: 16px;
      }
      
      .navigation-buttons {
        flex-direction: column-reverse;
        gap: 12px;
      }
      
      /* Larger touch targets for form controls */
      input, select, textarea {
        padding: 14px;
        margin-bottom: 16px;
        font-size: 16px; /* Prevents iOS zoom on focus */
      }
      
      /* Improved checkbox appearance on mobile */
      .checkbox-container {
        padding: 8px 0;
        margin-bottom: 16px;
      }
      
      .checkbox-container input[type="checkbox"] {
        transform: scale(1.25);
        margin-right: 12px;
        margin-top: 5px;
      }
      
      /* Larger tooltip target */
      .tooltip .tooltip-icon {
        width: 24px;
        height: 24px;
        font-size: 14px;
      }
      
      /* Better spacing */
      label {
        margin-bottom: 8px;
        display: block;
      }
      
      .error {
        padding: 6px 0;
        font-size: 14px;
      }
    }
  `;
}
