// src/components/UserDashboard.js
import { getStyles } from './common/Styles.js';
import { userService } from '../services/userService.js';
import { i18nService, t } from '../services/i18n.js';
import { API_BASE_URL } from '../utils/constants.js';

/**
 * User Dashboard component for CASL Key Verification
 * Shows verification history and allows purchasing new verifications
 */
export class UserDashboard extends HTMLElement {
  /**
   * Constructor initializes the component
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize state
    this.initializeState();
    
    // Render and setup
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Initialize component state
   */
  initializeState() {
    this.isLoading = false;
    this.error = null;
    this.user = null;
    this.verificationHistory = [];
    this.packages = [];
    
    // Load data
    this.loadDashboardData();
  }
  
  /**
   * When the element is added to the DOM
   */
  connectedCallback() {
    console.log('UserDashboard component connected');
    
    // Listen for authentication events
    document.addEventListener('casl-auth', this.handleAuthEvent.bind(this));
  }
  
  /**
   * When the element is removed from the DOM
   */
  disconnectedCallback() {
    // Remove event listeners
    document.removeEventListener('casl-auth', this.handleAuthEvent.bind(this));
  }
  
  /**
   * Handle authentication events
   * @param {CustomEvent} event - Authentication event
   */
  handleAuthEvent(event) {
    const { type, data } = event.detail;
    
    if (type === 'authenticated') {
      this.user = data;
      this.loadDashboardData();
    } else if (type === 'logged-out') {
      // Redirect back to authentication
      this.dispatchDashboardEvent('logout');
    }
  }
  
  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    if (!this.user) {
      const authState = await userService.getCurrentUser();
      if (!authState.isAuthenticated) {
        // Redirect to authentication if not logged in
        this.dispatchDashboardEvent('auth-required');
        return;
      }
      
      this.user = authState.user;
    }
    
    this.isLoading = true;
    this.error = null;
    this.render();
    
    try {
      // Load verification history
      await this.loadVerificationHistory();
      
      // Load available packages
      await this.loadPackages();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = error.message || t('dashboard.loadError');
    } finally {
      this.isLoading = false;
      this.render();
    }
  }
  
  /**
   * Load user's verification history
   */
  async loadVerificationHistory() {
    const headers = {
      'Content-Type': 'application/json',
      ...userService.getAuthHeaders()
    };
    
    const response = await fetch(`${API_BASE_URL}/verification-history`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(t('dashboard.historyLoadError'));
    }
    
    const result = await response.json();
    this.verificationHistory = result.verifications || [];
  }
  
  /**
   * Load available packages
   */
  async loadPackages() {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(t('dashboard.packagesLoadError'));
    }
    
    const result = await response.json();
    this.packages = result.packages || [];
  }
  
  /**
   * Render the component
   */
  render() {
    let content;
    
    if (this.isLoading) {
      content = this.renderLoading();
    } else if (this.error) {
      content = this.renderError();
    } else {
      content = this.renderDashboard();
    }
    
    this.shadowRoot.innerHTML = `
      <style>${getStyles()}</style>
      <div class="container" dir="${i18nService.getLanguageInfo(i18nService.currentLanguage)?.direction || 'ltr'}">
        ${content}
      </div>
    `;
  }
  
  /**
   * Render loading state
   */
  renderLoading() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>${t('dashboard.loading')}</p>
      </div>
    `;
  }
  
  /**
   * Render error state
   */
  renderError() {
    return `
      <div class="error-container">
        <div class="alert alert-error" role="alert">
          ${this.error}
        </div>
        <button 
          class="btn-primary" 
          onclick="this.getRootNode().host.loadDashboardData()"
        >
          ${t('dashboard.retry')}
        </button>
      </div>
    `;
  }
  
  /**
   * Render dashboard content
   */
  renderDashboard() {
    return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1>${t('dashboard.welcome', { username: this.user?.username || 'User' })}</h1>
          <button 
            class="btn-secondary" 
            onclick="this.getRootNode().host.handleLogout()"
          >
            ${t('dashboard.logout')}
          </button>
        </div>
        
        <div class="dashboard-content">
          ${this.renderVerificationHistory()}
          ${this.renderPackages()}
        </div>
        
        <div class="dashboard-actions">
          <button 
            class="btn-primary" 
            onclick="this.getRootNode().host.startNewVerification()"
          >
            ${t('dashboard.newVerification')}
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render verification history
   */
  renderVerificationHistory() {
    if (this.verificationHistory.length === 0) {
      return `
        <div class="verification-history">
          <h2>${t('dashboard.verificationHistory')}</h2>
          <div class="empty-state">
            <p>${t('dashboard.noHistory')}</p>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="verification-history">
        <h2>${t('dashboard.verificationHistory')}</h2>
        <div class="verification-cards">
          ${this.verificationHistory.map(verification => this.renderVerificationCard(verification)).join('')}
        </div>
      </div>
    `;
  }
  
  /**
   * Render a verification card
   * @param {Object} verification - Verification data
   */
  render
