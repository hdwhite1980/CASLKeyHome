// src/components/common/Alerts.js

/**
 * Renders alert messages
 * @param {boolean} showRestoredMessage - Whether to show restored data message
 * @param {string|null} apiError - API error message if any
 * @returns {string} HTML string for alerts
 */
export function renderAlerts(showRestoredMessage, apiError) {
  let alertsHtml = '';
  
  // Show saved data message
  if (showRestoredMessage) {
    alertsHtml += `
      <div class="alert alert-info" role="alert">
        <span>Your previous form data has been restored.</span>
        <button onclick="this.getRootNode().host.clearSavedData()" aria-label="Clear saved data">Clear</button>
      </div>
    `;
  }
  
  // Show API error
  if (apiError) {
    alertsHtml += `
      <div class="alert alert-error" role="alert">
        <span>${apiError}</span>
        <button onclick="this.getRootNode().host.clearApiError()" aria-label="Dismiss error">×</button>
      </div>
    `;
  }
  
  return alertsHtml;
}

/**
 * Renders a tooltip with help text
 * @param {string} text - The tooltip text
 * @returns {string} HTML string for tooltip
 */
export function renderTooltip(text) {
  return `
    <span class="tooltip">
      <span class="tooltip-icon" aria-hidden="true">?</span>
      <span class="tooltip-text" role="tooltip">${text}</span>
      <span class="sr-only">${text}</span>
    </span>
  `;
}

/**
 * Renders a notification about background check
 * @param {boolean} showBackgroundCheckConsent - Whether to show background check consent
 * @returns {string} HTML string for background check notification
 */
export function renderBackgroundCheckNotification(showBackgroundCheckConsent) {
  if (!showBackgroundCheckConsent) return '';
  
  return `
    <div class="alert alert-info" role="alert">
      <div>
        <strong>Background Check Information</strong>
        <p>
          Background checks are only used to verify your identity and include only:
          <ul>
            <li>National Criminal Database (recent, relevant crimes only)</li>
            <li>Sex Offender Registry</li>
            <li>Global Watchlist (OFAC/Sanctions)</li>
          </ul>
          <p>
            We never share specific personal information with hosts - only a "meets standards" verification.
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a trust preview to show what hosts will see
 * @param {Object} trustPreview - Trust preview data
 * @returns {string} HTML string for trust preview
 */
export function renderTrustPreview(trustPreview) {
  if (!trustPreview) return '';
  
  const { trustLevel, scoreRange, flags } = trustPreview;
  
  let badgeColor = '#4CAF50'; // Default green
  let badgeText = 'Verified';
  
  if (trustLevel === 'review') {
    badgeColor = '#FFC107'; // Warning yellow
    badgeText = 'Context Needed';
  } else if (trustLevel === 'manual_review') {
    badgeColor = '#9E9E9E'; // Gray
    badgeText = 'Review Pending';
  } else if (trustLevel === 'not_eligible') {
    badgeColor = '#757575'; // Dark gray
    badgeText = 'Not Eligible';
  }
  
  // Build flags text
  const flagsList = [];
  if (flags) {
    if (flags.localBooking) flagsList.push('Local booking');
    if (flags.highGuestCount) flagsList.push('6+ guests');
    if (flags.noSTRHistory) flagsList.push('First-time STR user');
    if (flags.lastMinuteBooking) flagsList.push('Last-minute booking');
  }
  
  const flagsText = flagsList.length > 0 
    ? `Flags: ${flagsList.join(', ')}` 
    : 'No flags';
  
  return `
    <div class="trust-preview" role="region" aria-label="Trust Preview">
      <h3>Trust Preview (what hosts will see)</h3>
      <div>
        <span class="preview-badge" style="background-color: ${badgeColor};">${badgeText}</span>
        <span>Score range: ${scoreRange}</span>
      </div>
      <p>${flagsText}</p>
      <p><small>Hosts will never see your personal details, only a verification status.</small></p>
    </div>
  `;
}
