// src/services/scoreCalculator.js
import { TRUST_LEVELS, TRUST_LEVEL_DISPLAY } from '../utils/constants.js';

/**
 * Calculate a trust score based on the user's form data and verification info
 * @param {Object} formData - Form data with user's answers
 * @param {Object} userIdentification - User identification data
 * @returns {Object} Result with score and deductions/bonuses
 */
export function calculateScore(formData, userIdentification) {
  // Start with 100 points
  let totalScore = 100;
  const scoreAdjustments = [];
  
  // --- Apply deductions based on stay purpose ---
  if (formData.stayPurpose === 'Special Occasion') {
    totalScore -= 5;
    scoreAdjustments.push({ reason: 'Special occasion/birthday', points: -5 });
  }
  
  // --- Apply deductions based on guest count ---
  if (formData.totalGuests > 5) {
    totalScore -= 3;
    scoreAdjustments.push({ reason: '6+ guests', points: -3 });
  }
  
  // --- Apply deductions for non-overnight guests ---
  if (formData.nonOvernightGuests) {
    totalScore -= 2;
    scoreAdjustments.push({ reason: 'Additional (non-overnight) visitors', points: -2 });
  }
  
  // --- Apply deductions for traveling near home ---
  if (formData.travelingNearHome) {
    totalScore -= 3;
    scoreAdjustments.push({ reason: 'Booking within 20 miles of home', points: -3 });
  }
  
  // --- Apply deductions for first-time STR guests ---
  if (!formData.usedSTRBefore) {
    totalScore -= 5;
    scoreAdjustments.push({ reason: 'First-time STR guest', points: -5 });
  }
  
  // --- Apply deductions for last-minute bookings ---
  const daysUntilCheckIn = getDaysUntilCheckIn(formData.checkInDate);
  if (daysUntilCheckIn !== null && daysUntilCheckIn <= 2) {
    totalScore -= 3;
    scoreAdjustments.push({ reason: 'Booking within 48 hours of check-in', points: -3 });
  }
  
  // --- Apply bonus for children under 12 ---
  if (formData.childrenUnder12) {
    totalScore += 1;
    scoreAdjustments.push({ reason: 'Group includes minors under 12', points: +1 });
  }
  
  // --- Apply bonus for longer stays ---
  const stayLength = getStayLength(formData.checkInDate, formData.checkOutDate);
  if (stayLength > 7) {
    totalScore += 2;
    scoreAdjustments.push({ reason: 'Booking for over 7 nights', points: +2 });
  }
  
  // --- Apply bonus for verified platform profiles ---
  if (userIdentification.platformData) {
    if (userIdentification.platformData.reviewCount > 5) {
      totalScore += 3;
      scoreAdjustments.push({ reason: 'Well-reviewed on platform', points: +3 });
    } else if (userIdentification.platformData.reviewCount > 0) {
      totalScore += 1;
      scoreAdjustments.push({ reason: 'Has platform reviews', points: +1 });
    }
  }
  
  // --- Apply bonus for background check ---
  if (userIdentification.idVerificationData?.verified) {
    totalScore += 5;
    scoreAdjustments.push({ reason: 'Verified background check', points: +5 });
  }
  
  // --- Apply bonus for previous STR stays with links ---
  if (formData.usedSTRBefore && formData.previousStayLinks.trim()) {
    totalScore += 3;
    scoreAdjustments.push({ reason: 'Previous stays provided with links', points: +3 });
  }
  
  // Set final score (min 0, max 100)
  const finalScore = Math.max(0, Math.min(100, totalScore));
  
  return { 
    score: finalScore, 
    adjustments: scoreAdjustments 
  };
}

/**
 * Calculate number of days until check-in
 * @param {string} checkInDate - Check-in date string
 * @returns {number|null} Number of days until check-in or null if no date
 */
function getDaysUntilCheckIn(checkInDate) {
  if (!checkInDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(checkInDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const diffTime = checkIn.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate length of stay in nights
 * @param {string} checkInDate - Check-in date string
 * @param {string} checkOutDate - Check-out date string
 * @returns {number|null} Length of stay in nights or null if dates invalid
 */
function getStayLength(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return null;
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return null;
  
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get the trust level based on score
 * @param {number} score - The trust score (0-100)
 * @returns {string} Trust level identifier
 */
export function getTrustLevel(score) {
  if (score >= 85) return TRUST_LEVELS.VERIFIED;
  if (score >= 70) return TRUST_LEVELS.REVIEW;
  if (score >= 50) return TRUST_LEVELS.MANUAL_REVIEW;
  return TRUST_LEVELS.NOT_ELIGIBLE;
}

/**
 * Get a display message for a trust level
 * @param {string} trustLevel - Trust level identifier
 * @returns {string} User-friendly message
 */
export function getResultMessage(trustLevel) {
  switch (trustLevel) {
    case TRUST_LEVELS.VERIFIED:
      return "You're officially CASL Key Verified! Your trust badge is valid for 12 months and can be shared with any CASL Key host. Keep your badge active by booking responsibly.";
    
    case TRUST_LEVELS.REVIEW:
