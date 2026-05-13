/**
 * API client for score submission
 */

import { API_ENDPOINTS } from '../config/environment';
import {
  ScoreRequest,
  ScoreResponse,
  NetworkError,
  ValidationError,
  NotFoundError,
  ServerError,
} from '../types/score';

/**
 * Submit a score to the backend API
 * @param request - Score request payload
 * @returns Promise resolving to score response
 * @throws NetworkError, ValidationError, NotFoundError, ServerError
 */
export async function submitScore(request: ScoreRequest): Promise<ScoreResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.AWARD_SCORE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Handle different status codes
    if (response.ok) {
      const data = await response.json();
      return data as ScoreResponse;
    }

    // Parse error response
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use default message
    }

    // Throw appropriate error based on status code
    switch (response.status) {
      case 400:
        throw new ValidationError(errorMessage);
      case 404:
        throw new NotFoundError(errorMessage);
      case 500:
        throw new ServerError(errorMessage);
      default:
        throw new ServerError(`Unexpected error: ${response.status}`);
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to server. Please check your connection.');
    }

    // Re-throw custom errors
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ServerError ||
      error instanceof NetworkError
    ) {
      throw error;
    }

    // Handle unexpected errors
    throw new NetworkError('An unexpected error occurred');
  }
}
