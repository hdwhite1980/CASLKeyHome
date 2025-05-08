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
      
      /* Primary colors with contrast-safe text colors */
      --primary-color: #4285F4;
      --primary-color-dark: #1a5dd4;
      --on-primary-color: #ffffff;
      
      --success-color: #4CAF50;
      --on-success-color: #ffffff;
      
      --warning-color: #EC9F05; /* Darkened for better contrast */
      --on-warning-color: #000000;
      
      --error-color: #c62828;
      --on-error-color: #ffffff;
      
      --neutral-color: #5C5C5C; /* Darkened for better contrast */
      --on-neutral-color: #ffffff;
      
      --surface-color: #ffffff;
      --on-surface-color: #212121;
      
      --disabled-color: #9E9E9E;
      --on-disabled-color: #212121;
      
      --border-radius: 8px;
      --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      --focus-ring-color: #4285F4;
      --focus-ring-width: 3px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-section {
      background-color: var(--surface-color);
      padding: 20px;
      border-radius: var(--border-radius);
      margin-bottom: 20px;
      box-shadow: var(--box-shadow);
    }
    
    button {
      padding: 10px 20px;
      background-color: var(--primary-color);
      color: var(--on-primary-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
      transition: background-color 0.2s, opacity 0.2s;
      min-height: 44px;
    }
    
    button:hover {
      background-color: var(--primary-color-dark);
    }
    
    button:focus {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
    
    button:disabled {
      background-color: var(--disabled-color);
      color: var(--on-disabled-color);
      cursor: not-allowed;
    }
    
    button.success {
      background-color: var(--success-color);
      color: var(--on-success-color);
    }
    
    button.success:hover {
      background-color: #3d8b40;
    }
    
    button.warning {
      background-color: var(--warning-color);
      color: var(--on-warning-color);
    }
    
    button.warning:hover {
      background-color: #c78500;
    }
    
    button.neutral {
      background-color: var(--neutral-color);
      color: var(--on-neutral-color);
    }
    
    button.neutral:hover {
      background-color: #3d3d3d;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
      min-height: 44px;
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: var(--primary-color);
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 0;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .error {
      color: var(--error-color);
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
      color: #0d47a1;
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
      min-height: 150px;
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
