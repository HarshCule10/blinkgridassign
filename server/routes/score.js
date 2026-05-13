const express = require('express');
const router = express.Router();
const { validateScoreRequest } = require('../validators/scoreValidator');
const { awardScore, UserNotFoundError } = require('../services/scoreService');

// POST /api/score/award
// Awards points to a user based on performance
router.post('/award', async (req, res) => {
  try {
    // Extract request parameters
    const { user_id, activity_type, performance_percentage } = req.body;

    // Validate input
    const validation = validateScoreRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.errors.join(', '),
        status: 400 
      });
    }

    // Award score through service layer
    const scoreResult = await awardScore(user_id, activity_type, performance_percentage);

    // Return success response with score breakdown
    return res.status(200).json({
      base_points: scoreResult.base_points,
      bonus_points: scoreResult.bonus_points,
      total_points: scoreResult.total_points,
      low_effort: scoreResult.low_effort
    });

  } catch (error) {
    // Handle user not found error
    if (error instanceof UserNotFoundError) {
      return res.status(404).json({ 
        error: error.message,
        status: 404 
      });
    }

    // Handle all other errors
    console.error('Error in score award:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request',
      status: 500 
    });
  }
});

module.exports = router;
