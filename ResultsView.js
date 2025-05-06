// src/components/ResultsView.js
import { TRUST_LEVEL_DISPLAY } from '../utils/constants.js';

/**
 * Renders the verification results view
 * @param {Object} userIdentification - User identification data
 * @param {string} trustLevel - Trust level identifier
 * @param {number} score - Calculated trust score
 * @param {string} message - Result message
 * @param {Array} adjustments - Score adjustments (bonuses/deductions)
 * @returns {string} HTML string for results view
 */
export function renderResults(userIdentification, trustLevel, score, message, adjustments) {
  // Get display data for the trust level
  const trustLevelData = TRUST_LEVEL_DISPLAY[trustLevel] || {
    badgeColor: '#4CAF50',
    icon: '✅',
    label: 'Verified'
  };

  return `
    <h1 style="text-align: center; margin-bottom: 20px;">CASL Key Verification Result</h1>
    
    <div class="result-card">
      <div style="margin-bottom: 20px;">
        <h2>CASL Key ID: ${userIdentification.caslKeyId || 'Not Assigned'}</h2>
      </div>
      
      <div class="trust-badge" style="background-color: ${trustLevelData.badgeColor}">
        ${trustLevelData.icon} ${trustLevelData.label}
      </div>
      
      <div class="score-display">
        <span class="score-number">${score}</span>
        <span class="score-max">/100</span>
      </div>
      
      <p class="result-message">
        ${message}
      </p>
      
      <div class="adjustments-list">
        <h3>Score Factors</h3>
        
        ${adjustments && adjustments.length > 0 ? `
          <div>
            ${adjustments.map(adj => `
              <div class="adjustment-item">
                <span>${adj.reason}</span>
                <span class="adjustment-points ${adj.points > 0 ? 'adjustment-positive' : 'adjustment-negative'}">
                  ${adj.points > 0 ? '+' : ''}${adj.points}
                </span>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="color: #666">No score adjustments applied.</p>
        `}
      </div>
      
      <div style="margin-top: 30px;">
        <h3>Trust Badge Information</h3>
        <p>
          Your trust badge is valid for 12 months. Future hosts will see your verification status, 
          but never your personal details.
        </p>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px">
        <button onclick="this.getRootNode().host.handleReset()" aria-label="Start over">
          Start Over
        </button>
      </div>
    </div>
  `;
}
