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
   * Add CSS for keyboard focus styles
   */
  addFocusStyles() {
    // Only add once
    if (document.getElementById('a11y-focus-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'a11y-focus-styles';
    style.textContent = `
      /* Only show focus styles when using keyboard */
      .keyboard-navigation *:focus {
        outline: 2px solid #4285F4 !important;
        outline-offset: 2px !important;
      }
      
      /* Hide focus styles when using mouse */
      *:focus:not(:focus-visible) {
        outline: none !important;
      }
      
      /* Ensure appropriate focus styles for focusable elements */
      .keyboard-navigation button:focus,
      .keyboard-navigation [role="button"]:focus,
      .keyboard-navigation a:focus,
      .keyboard-navigation input:focus,
      .keyboard-navigation select:focus,
      .keyboard-navigation textarea:focus {
        outline: 2px solid #4285F4 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3) !important;
      }
      
      /* Skip link styles */
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #4285F4;
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.2s;
      }
      
      .skip-to-content:focus {
        top: 0;
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
   * Create a focus trap for modal dialogs
   * @param {HTMLElement} element - Element to trap focus within
   * @param {Function} onEscape - Function to call when Escape is pressed
   * @returns {Object} Focus trap controller
   */
  createFocusTrap(element, onEscape) {
    // Get all focusable elements
    const focusableElements = this.getFocusableElements(element);
    
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found for focus trap');
      return null;
    }
    
    // Store element's previous focus state
    const previouslyFocused = document.activeElement;
    
    // Focus the first element
    focusableElements[0].focus();
    
    // Create trap controller
    const trapController = {
      element,
      focusableElements,
      previouslyFocused,
      onEscape,
      
      // Release the focus trap
      release: () => {
        this.focusTrapElements.delete(trapController);
        
        // Restore focus
        if (previouslyFocused && previouslyFocused.focus) {
          previouslyFocused.focus();
        }
      }
    };
    
    // Add to active traps
    this.focusTrapElements.add(trapController);
    
    return trapController;
  }
  
  /**
   * Handle tab key navigation for focus traps
   * @param {KeyboardEvent} event - Keyboard event
   */
  manageFocusTrap(event) {
    // Get the most recently added trap
    const trapController = Array.from(this.focusTrapElements).pop();
    
    if (!trapController) return;
    
    const { element, focusableElements } = trapController;
    
    // Skip if event doesn't belong to the trapped element
    if (!element.contains(event.target)) return;
    
    // Handle tabbing
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstFocusable) {
      // Shift+Tab on first element - wrap to last
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      // Tab on last element - wrap to first
      event.preventDefault();
      firstFocusable.focus();
    }
  }
  
  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {Array} Array of focusable elements
   */
  getFocusableElements(container) {
    // Find all potentially focusable elements
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');
    
    // Use querySelectorAll for shadow DOM
    if (container.shadowRoot) {
      return Array.from(container.shadowRoot.querySelectorAll(selector));
    }
    
    return Array.from(container.querySelectorAll(selector));
  }
  
  /**
   * Create a live region for announcing dynamic content
   * @param {string} type - Type of live region ('polite' or 'assertive')
   * @param {string} id - ID for the live region
   * @returns {HTMLElement} Live region element
   */
  createLiveRegion(type = 'polite', id = null) {
    const liveRegion = document.createElement('div');
    
    if (id) {
      liveRegion.id = id;
    } else {
      liveRegion.id = `live-region-${Date.now()}`;
    }
    
    // Set appropriate ARIA attributes
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('aria-relevant', 'additions text');
    
    // Hide visually but keep available to screen readers
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.margin = '-1px';
    liveRegion.style.padding = '0';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    
    return liveRegion;
  }
  
  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} type - Type of announcement ('polite' or 'assertive')
   */
  announce(message, type = 'polite') {
    // Create or get live region
    let liveRegion = document.getElementById(`a11y-live-${type}`);
    
    if (!liveRegion) {
      liveRegion = this.createLiveRegion(type, `a11y-live-${type}`);
      document.body.appendChild(liveRegion);
    }
    
    // Clear existing content
    liveRegion.textContent = '';
    
    // Set new content (after a small delay to ensure announcement)
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 50);
  }
  
  /**
   * Add a skip link to the page
   * @param {string} targetId - ID of the main content
   */
  addSkipLink(targetId = 'main-content') {
    // Check if skip link already exists
    if (document.querySelector('.skip-to-content')) {
      return;
    }
    
    // Create skip link
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    
    // Add to the beginning of the body
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Ensure target element has an ID and is focusable
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      if (!targetElement.getAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
    } else {
      console.warn(`Skip link target #${targetId} not found`);
    }
  }
  
  /**
   * Check if an element is properly accessible
   * @param {HTMLElement} element - Element to check
   * @returns {Object} Accessibility issues
   */
  checkAccessibility(element) {
    const issues = [];
    
    // Check form controls for labels
    const formControls = element.querySelectorAll('input, select, textarea');
    formControls.forEach(control => {
      const id = control.id;
      if (!id) {
        issues.push({
          element: control,
          issue: 'Form control missing ID attribute'
        });
      } else {
        const label = element.querySelector(`label[for="${id}"]`);
        if (!label && !control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
          issues.push({
            element: control,
            issue: 'Form control missing associated label'
          });
        }
      }
    });
    
    // Check images for alt text
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: img,
          issue: 'Image missing alt attribute'
        });
      }
    });
    
    // Check buttons for accessible names
    const buttons = element.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      if (!button.textContent.trim() && 
          !button.hasAttribute('aria-label') && 
          !button.hasAttribute('aria-labelledby')) {
        issues.push({
          element: button,
          issue: 'Button missing accessible name'
        });
      }
    });
    
    return {
      element,
      issues,
      hasIssues: issues.length > 0
    };
  }
}

// Export singleton instance
export const accessibilityHelper = new AccessibilityHelper();
