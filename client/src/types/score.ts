/**
 * Type definitions for the Performance-Weighted Scoring Engine
 */

/**
 * Activity types that can be scored
 */
export type ActivityType = 'CODING_EXERCISE' | 'QUIZ' | 'PROJECT_SUBMISSION';

/**
 * Request payload for submitting a score
 */
export interface ScoreRequest {
  user_id: number;
  activity_type: ActivityType;
  performance_percentage: number;
}

/**
 * Response from the scoring API
 */
export interface ScoreResponse {
  base_points: number;
  bonus_points: number;
  total_points: number;
  low_effort: boolean;
}

/**
 * Error types for API communication
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}
