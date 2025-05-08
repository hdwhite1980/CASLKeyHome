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
     html = html.replace(regex, (match, before, after) => {
       // Only add if autocomplete is not already present
       if (!match.includes('autocomplete=')) {
         return `<input${before} name="${fieldName}" autocomplete="${autocompleteValue}"${after}>`;
       }
       return match;
     });
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
   liveRegion.className = 'sr-only';
   
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
     
     // Check for autocomplete on appropriate fields
     if ((control.type === 'text' || control.type === 'email' || control.type === 'tel') && !control.hasAttribute('autocomplete')) {
       issues.push({
         element: control,
         issue: 'Form control missing autocomplete attribute'
       });
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
   
   // Check for proper heading hierarchy
   let lastHeadingLevel = 0;
   const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6')).sort((a, b) => {
     const aIndex = Array.from(element.querySelectorAll('*')).indexOf(a);
     const bIndex = Array.from(element.querySelectorAll('*')).indexOf(b);
     return aIndex - bIndex;
   });
   
   headings.forEach(heading => {
     const level = parseInt(heading.tagName.substring(1), 10);
     
     if (lastHeadingLevel > 0 && level - lastHeadingLevel > 1) {
       issues.push({
         element: heading,
         issue: `Heading level skipped from h${lastHeadingLevel} to h${level}`
       });
     }
     
     lastHeadingLevel = level;
   });
   
   return {
     element,
     issues,
     hasIssues: issues.length > 0
   };
 }
 
 /**
  * Check color contrast ratio between foreground and background colors
  * @param {string} foreground - Foreground color (hex, rgb)
  * @param {string} background - Background color (hex, rgb)
  * @returns {Object|null} Contrast ratio information or null if invalid colors
  */
 checkColorContrast(foreground, background) {
   try {
     // Convert colors to RGB values
     const getRGB = (color) => {
       // Handle hex colors
       if (color.startsWith('#')) {
         const hex = color.substring(1);
         return {
           r: parseInt(hex.substring(0, 2), 16),
           g: parseInt(hex.substring(2, 4), 16),
           b: parseInt(hex.substring(4, 6), 16)
         };
       }
       
       // Handle rgb/rgba colors
       if (color.startsWith('rgb')) {
         const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
         if (match) {
           return {
             r: parseInt(match[1], 10),
             g: parseInt(match[2], 10),
             b: parseInt(match[3], 10)
           };
         }
       }
       
       return null;
     };
     
     // Get RGB values
     const fgRGB = getRGB(foreground);
     const bgRGB = getRGB(background);
     
     if (!fgRGB || !bgRGB) return null;
     
     // Calculate relative luminance
     const calculateLuminance = (rgb) => {
       const { r, g, b } = rgb;
       
       // Normalize RGB values
       const rSRGB = r / 255;
       const gSRGB = g / 255;
       const bSRGB = b / 255;
       
       // Calculate RGB values for luminance
       const rLuminance = rSRGB <= 0.03928 ? rSRGB / 12.92 : Math.pow((rSRGB + 0.055) / 1.055, 2.4);
       const gLuminance = gSRGB <= 0.03928 ? gSRGB / 12.92 : Math.pow((gSRGB + 0.055) / 1.055, 2.4);
       const bLuminance = bSRGB <= 0.03928 ? bSRGB / 12.92 : Math.pow((bSRGB + 0.055) / 1.055, 2.4);
       
       // Calculate relative luminance using WCAG formula
       return 0.2126 * rLuminance + 0.7152 * gLuminance + 0.0722 * bLuminance;
     };
     
     // Calculate luminance for foreground and background
     const fgLuminance = calculateLuminance(fgRGB);
     const bgLuminance = calculateLuminance(bgRGB);
     
     // Calculate contrast ratio
     const lighter = Math.max(fgLuminance, bgLuminance);
     const darker = Math.min(fgLuminance, bgLuminance);
     const contrastRatio = (lighter + 0.05) / (darker + 0.05);
     
     // Check against WCAG criteria
     return {
       ratio: contrastRatio,
       passes: {
         AA: contrastRatio >= 4.5,
         AALarge: contrastRatio >= 3,
         AAA: contrastRatio >= 7,
         AAALarge: contrastRatio >= 4.5
       },
       foreground,
       background
     };
   } catch (error) {
     console.error('Error checking color contrast:', error);
     return null;
   }
 }
}

// Export singleton instance
export const accessibilityHelper = new AccessibilityHelper();
