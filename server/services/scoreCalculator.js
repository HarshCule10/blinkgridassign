/**
 * Calculates score based on performance percentage
 * Pure function with no side effects
 * @param {number} performance_percentage - Performance value between 0 and 100
 * @returns {Object} - { base_points, bonus_points, total_points, low_effort }
 */
function calculateScore(performance_percentage) {
  const base_points = 30;
  let bonus_points = 0;
  let low_effort = false;

  // Check if performance is below threshold
  if (performance_percentage < 20) {
    bonus_points = 0;
    low_effort = true;
  } else {
    // Calculate bonus points: performance * 0.3, capped at 30
    bonus_points = Math.min(performance_percentage * 0.3, 30);
    low_effort = false;
  }

  const total_points = base_points + bonus_points;

  return {
    base_points,
    bonus_points,
    total_points,
    low_effort
  };
}

module.exports = {
  calculateScore
};
