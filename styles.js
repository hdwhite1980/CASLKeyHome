// src/components/common/Styles.js

/**
 * Returns CSS styles for the CASL Verification component
 * @returns {string} CSS styles as a string
 */
export function getStyles() {
  return `
    :host {
      display: block;
      font-family: Arial, sans-serif;
      --primary-color: #4285F4;
      --success-color: #4CAF50;
      --warning-color: #FFC107;
      --error-color: #c62828;
      --neutral-color: #757575;
      --info-color: #0d47a1;
      --border-radius: 8px;
      --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-section {
      background-color: #fff;
      padding: 20px;
      border-radius: var(--border-radius);
      margin-bottom: 20px;
      box-shadow: var(--box-shadow);
    }
    
    button {
      padding: 10px 20px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
      transition: background-color 0.2s, opacity 0.2s;
    }
    
    button:hover {
      opacity: 0.9;
    }
    
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    button.success {
      background-color: var(--success-color);
    }
    
    button.warning {
      background-color: var(--warning-color);
      color: #333;
    }
    
    button.neutral {
      background-color: #6c757d;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--primary-color);
      outline: none;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .error {
      color: var(--error-color);
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
      padding: 12px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .alert-success {
      background-color: #e8f5e9;
      color: #2e7d32;
      border-left: 4px solid var(--success-color);
    }
    
    .alert-error {
      background-color: #ffebee;
      color: var(--error-color);
      border-left: 4px solid var(--error-color);
    }
    
    .alert-info {
      background-color: #e3f2fd;
      color: var(--info-color);
      border-left: 4px solid var(--primary-color);
    }
    
    .alert-warning {
      background-color: #fff8e1;
      color: #f57f17;
      border-left: 4px solid var(--warning-color);
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
      background-color: var(--primary-color);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .screenshot-container {
      border: 2px dashed #ccc;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 4px;
      transition: border-color 0.2s;
      position: relative;
    }
    
    .screenshot-container:hover {
      border-color: var(--primary-color);
    }
    
    .screenshot-container.drag-over {
      background-color: #f0f7ff;
      border-color: var(--primary-color);
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
      color: #666;
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
      color: var(--success-color);
    }
    
    .adjustment-negative {
      color: var(--error-color);
    }
    
    .tooltip {
      position: relative;
      display: inline-block;
      margin-left: 5px;
      cursor: help;
    }
    
    .tooltip .tooltip-icon {
      background-color: #ddd;
      color: #333;
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
      
      button {
        padding: 12px 20px;
        width: 100%;
        margin: 5px 0;
      }
      
      .navigation-buttons {
        flex-direction: column-reverse;
      }
    }
  `;
}
