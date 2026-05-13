/**
 * Validates score request parameters
 * @param {Object} body - Request body containing user_id, activity_type, and performance_percentage
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateScoreRequest(body) {
  const errors = [];
  const validActivityTypes = ['CODING_EXERCISE', 'QUIZ', 'PROJECT_SUBMISSION'];

  // Validate user_id
  if (!body.user_id) {
    errors.push('user_id is required and must be a positive integer');
  } else if (typeof body.user_id !== 'number' || body.user_id <= 0 || !Number.isInteger(body.user_id)) {
    errors.push('user_id is required and must be a positive integer');
  }

  // Validate activity_type
  if (!body.activity_type) {
    errors.push('activity_type must be one of: CODING_EXERCISE, QUIZ, PROJECT_SUBMISSION');
  } else if (!validActivityTypes.includes(body.activity_type)) {
    errors.push('activity_type must be one of: CODING_EXERCISE, QUIZ, PROJECT_SUBMISSION');
  }

  // Validate performance_percentage
  if (body.performance_percentage === undefined || body.performance_percentage === null) {
    errors.push('performance_percentage must be a number between 0 and 100');
  } else if (typeof body.performance_percentage !== 'number' || isNaN(body.performance_percentage)) {
    errors.push('performance_percentage must be a number between 0 and 100');
  } else if (body.performance_percentage < 0 || body.performance_percentage > 100) {
    errors.push('performance_percentage must be a number between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateScoreRequest
};
