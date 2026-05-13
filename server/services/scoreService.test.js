/**
 * Integration tests for Score Service
 * Tests the awardScore function with database operations
 */

// Load environment variables before importing modules
require('dotenv').config();

const { awardScore, UserNotFoundError } = require('./scoreService');
const { query, pool } = require('../db/client');

describe('Score Service Integration Tests', () => {
  const testUserId = 1; // Use the test user created by migration

  beforeEach(async () => {
    // Reset test user's points before each test
    await query('DELETE FROM score_events WHERE user_id = $1', [testUserId]);
    await query('UPDATE users SET total_points = 0 WHERE id = $1', [testUserId]);
  });

  afterAll(async () => {
    // Clean up test data
    await query('DELETE FROM score_events WHERE user_id = $1', [testUserId]);
    await query('UPDATE users SET total_points = 0 WHERE id = $1', [testUserId]);
    // Close database connection
    const poolInstance = pool();
    if (poolInstance) {
      await poolInstance.end();
    }
  });

  describe('awardScore', () => {
    test('should award score and update user total_points', async () => {
      const result = await awardScore(testUserId, 'CODING_EXERCISE', 75);

      // Verify returned score breakdown
      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(22.5); // 75 * 0.3
      expect(result.total_points).toBe(52.5);
      expect(result.low_effort).toBe(false);

      // Verify score_event was created
      const eventResult = await query(
        'SELECT * FROM score_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testUserId]
      );
      expect(eventResult.rows.length).toBe(1);
      expect(eventResult.rows[0].activity_type).toBe('CODING_EXERCISE');
      expect(parseFloat(eventResult.rows[0].performance_percentage)).toBe(75);
      expect(eventResult.rows[0].base_points).toBe(30);
      expect(parseFloat(eventResult.rows[0].bonus_points)).toBe(22.5);
      expect(parseFloat(eventResult.rows[0].total_points)).toBe(52.5);
      expect(eventResult.rows[0].low_effort).toBe(false);

      // Verify user total_points was updated
      const userResult = await query(
        'SELECT total_points FROM users WHERE id = $1',
        [testUserId]
      );
      expect(parseFloat(userResult.rows[0].total_points)).toBe(52.5);
    });

    test('should accumulate points across multiple scoring events', async () => {
      // First scoring event
      await awardScore(testUserId, 'QUIZ', 50);

      // Second scoring event
      const result = await awardScore(testUserId, 'PROJECT_SUBMISSION', 100);

      // Verify second event result
      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(30); // Capped at 30
      expect(result.total_points).toBe(60);

      // Verify total_points accumulated correctly
      // First event: 50% = 30 + 15 = 45
      // Second event: 100% = 30 + 30 = 60
      // Total: 45 + 60 = 105
      const userResult = await query(
        'SELECT total_points FROM users WHERE id = $1',
        [testUserId]
      );
      expect(parseFloat(userResult.rows[0].total_points)).toBe(105);
    });

    test('should set low_effort flag for performance < 20', async () => {
      const result = await awardScore(testUserId, 'CODING_EXERCISE', 15);

      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(0);
      expect(result.total_points).toBe(30);
      expect(result.low_effort).toBe(true);

      // Verify in database
      const eventResult = await query(
        'SELECT * FROM score_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testUserId]
      );
      expect(eventResult.rows[0].low_effort).toBe(true);
    });

    test('should throw UserNotFoundError for non-existent user', async () => {
      const nonExistentUserId = 999999;

      await expect(
        awardScore(nonExistentUserId, 'CODING_EXERCISE', 50)
      ).rejects.toThrow(UserNotFoundError);

      await expect(
        awardScore(nonExistentUserId, 'CODING_EXERCISE', 50)
      ).rejects.toThrow(`User with id ${nonExistentUserId} not found`);
    });

    test('should rollback transaction on error', async () => {
      // Get current total_points
      const beforeResult = await query(
        'SELECT total_points FROM users WHERE id = $1',
        [testUserId]
      );
      const pointsBefore = beforeResult.rows[0].total_points;

      // Try to award score with invalid activity_type (will fail CHECK constraint)
      await expect(
        awardScore(testUserId, 'INVALID_TYPE', 50)
      ).rejects.toThrow();

      // Verify total_points unchanged (transaction rolled back)
      const afterResult = await query(
        'SELECT total_points FROM users WHERE id = $1',
        [testUserId]
      );
      expect(afterResult.rows[0].total_points).toBe(pointsBefore);
    });

    test('should handle edge case: performance = 0', async () => {
      const result = await awardScore(testUserId, 'CODING_EXERCISE', 0);

      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(0);
      expect(result.total_points).toBe(30);
      expect(result.low_effort).toBe(true);
    });

    test('should handle edge case: performance = 20', async () => {
      const result = await awardScore(testUserId, 'CODING_EXERCISE', 20);

      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(6); // 20 * 0.3
      expect(result.total_points).toBe(36);
      expect(result.low_effort).toBe(false);
    });

    test('should handle edge case: performance = 100', async () => {
      const result = await awardScore(testUserId, 'CODING_EXERCISE', 100);

      expect(result.base_points).toBe(30);
      expect(result.bonus_points).toBe(30); // Capped at 30
      expect(result.total_points).toBe(60);
      expect(result.low_effort).toBe(false);
    });
  });
});
