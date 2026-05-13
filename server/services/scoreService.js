const { query, pool } = require('../db/client');
const { calculateScore } = require('./scoreCalculator');

/**
 * Custom error for user not found scenarios
 */
class UserNotFoundError extends Error {
  constructor(userId) {
    super(`User with id ${userId} not found`);
    this.name = 'UserNotFoundError';
    this.userId = userId;
  }
}

/**
 * Awards score to a user based on performance
 * Handles database transaction for score event creation and user points update
 * @param {number} user_id - User identifier
 * @param {string} activity_type - Type of activity (CODING_EXERCISE, QUIZ, PROJECT_SUBMISSION)
 * @param {number} performance_percentage - Performance value between 0 and 100
 * @returns {Promise<Object>} - Score breakdown { base_points, bonus_points, total_points, low_effort }
 * @throws {UserNotFoundError} - If user does not exist
 * @throws {Error} - For database errors
 */
async function awardScore(user_id, activity_type, performance_percentage) {
  const poolInstance = pool();
  const client = await poolInstance.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');

    // Verify user exists
    const userResult = await client.query(
      'SELECT id, total_points FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      throw new UserNotFoundError(user_id);
    }

    const currentTotalPoints = parseFloat(userResult.rows[0].total_points) || 0;

    // Calculate score
    const scoreResult = calculateScore(performance_percentage);

    // Insert score event
    await client.query(
      `INSERT INTO score_events 
       (user_id, activity_type, performance_percentage, base_points, bonus_points, total_points, low_effort) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user_id,
        activity_type,
        performance_percentage,
        scoreResult.base_points,
        scoreResult.bonus_points,
        scoreResult.total_points,
        scoreResult.low_effort
      ]
    );

    // Update user's total points
    const newTotalPoints = currentTotalPoints + scoreResult.total_points;
    await client.query(
      'UPDATE users SET total_points = $1 WHERE id = $2',
      [newTotalPoints, user_id]
    );

    // Commit transaction
    await client.query('COMMIT');

    return scoreResult;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

module.exports = {
  awardScore,
  UserNotFoundError
};
