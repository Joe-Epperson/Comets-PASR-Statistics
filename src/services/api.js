/**
 * API Service for Comets PASR Statistics
 * Centralized API calls for reports and analytics
 */

const API_BASE = 'http://localhost:3001';

/**
 * Get action count for a specific match (validation)
 * @param {string} match - Full match string
 * @returns {Promise<{match: string, count: number, breakdown: {passes: number, shots: number, dribbles: number}}>}
 */
export async function getActionCount(match) {
  const response = await fetch(`${API_BASE}/api/actions/count?match=${encodeURIComponent(match)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch action count');
  }
  return response.json();
}

/**
 * Generate a fresh report preview (does not save)
 * @param {string} match - Full match string
 * @param {string[]} players - Array of 16 player strings
 * @returns {Promise<{match: string, totals: object, playerStats: array, seasonAverages: object}>}
 */
export async function getReportPreview(match, players) {
  const params = new URLSearchParams();
  params.append('match', match);
  players.forEach(player => params.append('players[]', player));

  const response = await fetch(`${API_BASE}/api/reports/preview?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to generate report preview');
  }
  return response.json();
}

/**
 * Save/finalize a match report
 * @param {object} reportData - Complete report data including match, score, roster, totals, playerStats
 * @returns {Promise<{success: boolean, updated: boolean, insertedId?: string}>}
 */
export async function saveMatchReport(reportData) {
  const response = await fetch(`${API_BASE}/api/reports/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  if (!response.ok) {
    throw new Error('Failed to save match report');
  }
  return response.json();
}

/**
 * Get a finalized match report
 * @param {string} match - Full match string
 * @returns {Promise<object|null>} - Report document or null if not found
 */
export async function getMatchReport(match) {
  const response = await fetch(`${API_BASE}/api/reports/match/${encodeURIComponent(match)}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch match report');
  }
  return response.json();
}

/**
 * Get all finalized match reports
 * @returns {Promise<array>} - Array of report documents
 */
export async function getAllReports() {
  const response = await fetch(`${API_BASE}/api/reports`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
}

/**
 * Get season statistics (aggregated from all finalized reports)
 * @returns {Promise<{matchCount: number, team: object, players: object}>}
 */
export async function getSeasonStats() {
  const response = await fetch(`${API_BASE}/api/stats/season`);
  if (!response.ok) {
    throw new Error('Failed to fetch season stats');
  }
  return response.json();
}

/**
 * Parse opponent name from match string
 * @param {string} match - Full match string (e.g., "Match 1: KC Comets at St. Louis Ambush (Friday, November 28th 2025)")
 * @returns {string} - Opponent name (e.g., "St. Louis Ambush")
 */
export function parseOpponent(match) {
  const atMatch = match.match(/KC Comets at (.+?) \(/);
  const vsMatch = match.match(/KC Comets vs (.+?) \(/);
  return atMatch?.[1] || vsMatch?.[1] || 'Unknown';
}

/**
 * Parse location (home/away) from match string
 * @param {string} match - Full match string
 * @returns {'home'|'away'}
 */
export function parseLocation(match) {
  return match.includes(' at ') ? 'away' : 'home';
}

/**
 * Parse date from match string
 * @param {string} match - Full match string
 * @returns {string} - Date string (e.g., "Friday, November 28th 2025")
 */
export function parseDate(match) {
  const dateMatch = match.match(/\((.+?)\)$/);
  return dateMatch?.[1] || '';
}

/**
 * Parse match number from match string
 * @param {string} match - Full match string
 * @returns {number} - Match number
 */
export function parseMatchNumber(match) {
  const numMatch = match.match(/^Match (\d+):/);
  return numMatch ? parseInt(numMatch[1], 10) : 0;
}

/**
 * Get color class based on success rate
 * @param {number} rate - Success rate percentage (0-100)
 * @returns {string} - CSS class name
 */
export function getSuccessRateColorClass(rate) {
  if (rate >= 90) return 'rate-excellent';
  if (rate >= 80) return 'rate-good';
  if (rate >= 70) return 'rate-average';
  if (rate >= 60) return 'rate-below-average';
  if (rate >= 50) return 'rate-poor';
  return 'rate-critical';
}

/**
 * Get comparison color class
 * @param {number} comparison - Difference from season average
 * @returns {string} - CSS class name
 */
export function getComparisonColorClass(comparison) {
  if (comparison > 0) return 'compare-positive';
  if (comparison < 0) return 'compare-negative';
  return 'compare-neutral';
}

/**
 * Format comparison as display string
 * @param {number} comparison - Difference from season average
 * @returns {string} - Formatted string (e.g., "+5.2%" or "-3.1%")
 */
export function formatComparison(comparison) {
  const sign = comparison > 0 ? '+' : '';
  return `${sign}${comparison.toFixed(1)}%`;
}
