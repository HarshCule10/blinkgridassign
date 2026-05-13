/**
 * Environment configuration for the frontend application
 */

/**
 * API base URL - defaults to localhost:3000 for development
 * Can be overridden via VITE_API_BASE_URL environment variable
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Full API endpoint URLs
 */
export const API_ENDPOINTS = {
  AWARD_SCORE: `${API_BASE_URL}/api/score/award`,
} as const;
