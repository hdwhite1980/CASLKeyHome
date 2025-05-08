// src/utils/AccessibilityHelper.js

/**
 * Accessibility Helper utility
 * Provides accessibility enhancements for CASL Verification System
 */
class AccessibilityHelper {
  constructor() {
    // ARIA role descriptions
    this.ariaRoleDescriptions = {
      form: 'form',
      button: 'button',
      link: 'link',
      checkbox: 'checkbox',
      radio: 'radio',
      tab: 'tab',
      tabpanel: 'tabpanel',
      textbox: 'textbox',
      combobox: 'combobox',
      alert: 'alert',
      alertdialog: 'alertdialog',
      dialog: 'dialog',
      progressbar: 'progressbar',
      status: 'status',
      tooltip: 'tooltip',
      navigation: 'navigation',
      main: 'main',
      region: 'region'
    };
    
    // Common live regions configurations
    this.liveRegions = {
      polite: { 'aria-live': 'polite', 'aria-atomic': 'true' },
      assertive: { 'aria-live': 'assertive', 'aria-atomic': 'true' }
    };
    
    // Track focus trap elements
    this.focusTrapElements = new Set();
    
    // Initialize global keyboard navigation management
    this.initKeyboardNavigation();
  }
  
  /**
   * Set up global keyboard navigation
   */
  initKeyboardNavigation() {
    // Detect keyboard navigation
    let isUsingKeyboard = false;
    
    document.addEventListener('keydown', event => {
      // Tab key indicates keyboard navigation
      if (event.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-navigation');
      }
      
      // Handle focus traps for modals
      if (event.key === 'Tab' && this.focusTrapElements.size > 0) {
        this.manageFocusTrap(event);
      }
      
      // Handle escape key for modals
      if (event.key === 'Escape' && this.focusTrapElements.size > 0) {
        // Find the most recently added focus trap
        const lastTrap = Array.from(this.focusTrapElements).pop();
        if (lastTrap && typeof lastTrap.onEscape === 'function') {
          lastTrap.onEscape(event);
        }
      }
    });
    
    // Reset keyboard navigation on mouse use
    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Add CSS for keyboard focus styles
    this.addFocusStyles();
  }
  
  /**
   * Add CSS for keyboard focus styles with improved visual feedback
   */
  addFocusStyles() {
    // Only add once
    if (document.getElementById('a11y-focus-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'a11y-focus-styles';
    style.textContent = `
      /* Base focus styles */
      :focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
      
      /* Enhanced keyboard focus styles */
      .keyboard-navigation *:focus-visible,
      .keyboard-navigation *:focus {
        outline: 3px solid #4285F4 !important;
        outline-offset: 3px !important;
        border-radius: 3px;
      }
      
      /* High contrast mode support */
      @media (forced-colors: active) {
        .keyboard-navigation *:focus-visible,
        .keyboard-navigation *:focus {
          outline: 3px solid CanvasText !important;
          outline-offset: 3px !important;
        }
      }
      
      /* Enhanced focus styles for form elements */
      .keyboard-navigation button:focus,
      .keyboard-navigation [role="button"]:focus,
      .keyboard-navigation a:focus,
      .keyboard-navigation input:focus,
      .keyboard-navigation select:focus,
      .keyboard-navigation textarea:focus {
        outline: 3px solid #4285F4 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3) !important;
      }
      
      /* Enhanced focus styles for checkboxes and radios */
      .keyboard-navigation input[type="checkbox"]:focus + label,
      .keyboard-navigation input[type="radio"]:focus + label {
        outline: 2px solid #4285F4 !important;
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      /* Skip link styles */
      .skip-to-content {
        position: absolute;
        top: -50px;
        left: 0;
        background: #4285F4;
        color: white;
        padding: 10px 16px;
        z-index: 1000;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        transition: top 0.2s;
        font-weight: bold;
        opacity: 0;
      }
      
      .skip-to-content:focus {
        top: 0;
        opacity: 1;
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
        
        .skip-to-content {
          transition: none !important;
        }
      }
      
      /* Screen reader only text */
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
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Enhance HTML with accessibility attributes
   * @param {string} html - HTML to enhance
   * @returns {string} Enhanced HTML
   */
  enhanceHtml(html) {
    // Add missing ARIA attributes to form elements
    html = this.enhanceFormElements(html);
    
    // Add missing roles
    html = this.enhanceRoles(html);
    
    // Add missing labels
    html = this.enhanceLabels(html);
    
    // Add autocomplete attributes to appropriate fields
    html = this.enhanceAutocomplete(html);
    
    return html;
  }
  
  /**
   * Enhance form elements with accessibility attributes
   * @param {string} html - HTML to enhance
   * @returns {string} Enhanced HTML
   */
  enhanceFormElements(html) {
    // Add required aria-required attribute to required inputs
    html = html.replace(/<input([^>]*) required([^>]*)>/g, '<input$1 required$2 aria-required="true">');
    
    // Add aria-invalid to inputs with the error class
    html = html.replace(/<input([^>]*) class="([^"]*error[^"]*)"([^>]*)>/g, 
                      '<input$1 class="$2"$3 aria-invalid="true">');
    
    // Add aria-describedby for inputs that reference error messages
    html = html.replace(/aria-describedby="([^"]+)"/g, (match, id) => {
      // Check if id exists in the HTML
      if (html.includes(`id="${id}"`)) {
        return match;
      }
      return '';
    });
    
    return html;
  }
  
  /**
   * Enhance elements with appropriate ARIA roles
   * @param {string} html - HTML to enhance
   * @returns {string} Enhanced HTML
   */
  enhanceRoles(html) {
    // Add role="alert" to error messages
    html = html.replace(/<div([^>]*) class="([^"]*error[^"]*)"([^>]*)>/g, 
                      '<div$1 class="$2"$3 role="alert">');
    
    // Add role="status" to success messages
    html = html.replace(/<div([^>]*) class="([^"]*success[^"]*)"([^>]*)>/g, 
                      '<div$1 class="$2"$3 role="status">');
    
    return html;
  }
  
  /**
   * Enhance elements with appropriate labels
   * @param {string} html - HTML to enhance
   * @returns {string} Enhanced HTML
   */
  enhanceLabels(html) {
    // Add aria-label to buttons without text content
    html = html.replace(/<button([^>]*)>\\s*<\\/button>/g, (match, attrs) => {
      if (!attrs.includes('aria-label')) {
        return `<button${attrs} aria-label="Button"></button>`;
      }
      return match;
    });
    
    return html;
  }
  
  /**
   * Enhance form fields with autocomplete attributes
   * @param {string} html - HTML to enhance
   * @returns {string} Enhanced HTML
   */
  enhanceAutocomplete(html) {
    // Add autocomplete to common form fields
    const autocompleteMap = {
      'name': 'name',
      'email': 'email',
      'phone': 'tel',
      'address': 'street-address',
      'zipCode': 'postal-code'
    };
    
    // Add autocomplete attributes to matching fields
    Object.entries(autocompleteMap).forEach(([fieldName, autocompleteValue]) => {
      const regex = new RegExp(`<input([^>]*) name="${fieldName}"([^>]*)>`, 'g');
      html = html.replace(regex, (match, before, after)
