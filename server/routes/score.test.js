/**
 * Integration tests for Score Route Handler
 * Tests the POST /api/score/award endpoint
 */

require('dotenv').config();

const request = require('supertest');
const app = require('../index');
const { query, pool } = require('../db/client');

describe('POST /api/score/award', () => {
  const testUserId = 1;

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

  describe('Successful requests', () => {
    test('should return 200 with score breakdown for valid request', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 75
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 22.5);
      expect(response.body).toHaveProperty('total_points', 52.5);
      expect(response.body).toHaveProperty('low_effort', false);
    });

    test('should handle low effort submission (performance < 20)', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'QUIZ',
          performance_percentage: 15
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 0);
      expect(response.body).toHaveProperty('total_points', 30);
      expect(response.body).toHaveProperty('low_effort', true);
    });

    test('should handle perfect score (performance = 100)', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'PROJECT_SUBMISSION',
          performance_percentage: 100
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 30);
      expect(response.body).toHaveProperty('total_points', 60);
      expect(response.body).toHaveProperty('low_effort', false);
    });
  });

  describe('Validation errors (400)', () => {
    test('should return 400 when user_id is missing', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 75
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user_id');
      expect(response.body).toHaveProperty('status', 400);
    });

    test('should return 400 when activity_type is invalid', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'INVALID_TYPE',
          performance_percentage: 75
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('activity_type');
      expect(response.body).toHaveProperty('status', 400);
    });

    test('should return 400 when performance_percentage is out of range', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 150
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('performance_percentage');
      expect(response.body).toHaveProperty('status', 400);
    });

    test('should return 400 when performance_percentage is negative', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: -10
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('performance_percentage');
      expect(response.body).toHaveProperty('status', 400);
    });

    test('should return 400 when multiple fields are invalid', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          activity_type: 'INVALID_TYPE',
          performance_percentage: 150
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('status', 400);
    });
  });

  describe('Not found errors (404)', () => {
    test('should return 404 when user does not exist', async () => {
      const nonExistentUserId = 999999;

      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: nonExistentUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 75
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain(`User with id ${nonExistentUserId} not found`);
      expect(response.body).toHaveProperty('status', 404);
    });
  });

  describe('Edge cases', () => {
    test('should handle performance = 0', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 0
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 0);
      expect(response.body).toHaveProperty('total_points', 30);
      expect(response.body).toHaveProperty('low_effort', true);
    });

    test('should handle performance = 20 (threshold)', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 20
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 6);
      expect(response.body).toHaveProperty('total_points', 36);
      expect(response.body).toHaveProperty('low_effort', false);
    });

    test('should handle performance = 19 (just below threshold)', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 19
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body).toHaveProperty('bonus_points', 0);
      expect(response.body).toHaveProperty('total_points', 30);
      expect(response.body).toHaveProperty('low_effort', true);
    });

    test('should handle decimal performance values', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 33.33
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_points', 30);
      expect(response.body.bonus_points).toBeCloseTo(9.999, 2);
      expect(response.body.total_points).toBeCloseTo(39.999, 2);
      expect(response.body).toHaveProperty('low_effort', false);
    });
  });

  describe('Different activity types', () => {
    test('should handle CODING_EXERCISE activity type', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'CODING_EXERCISE',
          performance_percentage: 50
        })
        .expect(200);

      expect(response.body).toHaveProperty('total_points', 45);
    });

    test('should handle QUIZ activity type', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'QUIZ',
          performance_percentage: 50
        })
        .expect(200);

      expect(response.body).toHaveProperty('total_points', 45);
    });

    test('should handle PROJECT_SUBMISSION activity type', async () => {
      const response = await request(app)
        .post('/api/score/award')
        .send({
          user_id: testUserId,
          activity_type: 'PROJECT_SUBMISSION',
          performance_percentage: 50
        })
        .expect(200);

      expect(response.body).toHaveProperty('total_points', 45);
    });
  });
});
