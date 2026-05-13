/**
 * ExerciseCompleteScreen Component
 * 
 * Main UI component for submitting exercise performance and viewing score results
 */

import { useState } from 'react';
import { submitScore } from '../api/scoreApi';
import {
  ActivityType,
  ScoreResponse,
  NetworkError,
  ValidationError,
  NotFoundError,
  ServerError,
} from '../types/score';
import './ExerciseCompleteScreen.css';

interface ExerciseCompleteScreenProps {
  userId: number;
  activityType: ActivityType;
}

export function ExerciseCompleteScreen({ userId, activityType }: ExerciseCompleteScreenProps) {
  const [performancePercentage, setPerformancePercentage] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerformancePercentage(Number(event.target.value));
  };

  const handleSubmit = async () => {
    // Clear previous results and errors
    setError(null);
    setScoreResult(null);
    setIsSubmitting(true);

    try {
      const result = await submitScore({
        user_id: userId,
        activity_type: activityType,
        performance_percentage: performancePercentage,
      });

      setScoreResult(result);
    } catch (err) {
      if (err instanceof NetworkError) {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else if (err instanceof ValidationError) {
        setError(err.message);
      } else if (err instanceof NotFoundError) {
        setError('User not found. Please contact support if this problem persists.');
      } else if (err instanceof ServerError) {
        setError('Server error. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="exercise-complete-screen">
      <div className="exercise-complete-container">
        <h1 className="title">Exercise Complete</h1>
        <p className="subtitle">Submit your performance to earn points</p>

        <div className="performance-section">
          <label htmlFor="performance-slider" className="performance-label">
            Performance: {performancePercentage}%
          </label>
          <input
            id="performance-slider"
            type="range"
            min="0"
            max="100"
            value={performancePercentage}
            onChange={handleSliderChange}
            className="performance-slider"
            disabled={isSubmitting}
          />
          <div className="slider-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Results'}
        </button>

        {/* Score Breakdown Display */}
        {scoreResult && (
          <div className="score-breakdown">
            <h2 className="score-title">Points Earned</h2>
            <div className="score-details">
              <span className="score-item">
                <strong>Base:</strong> {scoreResult.base_points.toFixed(0)} points
              </span>
              <span className="score-separator">·</span>
              <span className="score-item">
                <strong>Bonus:</strong> {scoreResult.bonus_points.toFixed(1)} points
              </span>
              <span className="score-separator">·</span>
              <span className="score-item total">
                <strong>Total earned:</strong> {scoreResult.total_points.toFixed(1)} points
              </span>
            </div>

            {/* Low Effort Warning */}
            {scoreResult.low_effort && (
              <div className="low-effort-warning">
                <svg
                  className="warning-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                    fill="currentColor"
                  />
                </svg>
                <p className="warning-text">
                  We noticed this submission was rushed. Consider giving it another try.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <svg
              className="error-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                fill="currentColor"
              />
            </svg>
            <p className="error-text">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
