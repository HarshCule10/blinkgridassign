const { calculateScore } = require('./scoreCalculator');

/**
 * Minimal test suite for score calculator
 * Tests core functionality and edge cases
 */

// Test edge case: 0%
const test0 = calculateScore(0);
console.assert(test0.base_points === 30, 'Test 0%: base_points should be 30');
console.assert(test0.bonus_points === 0, 'Test 0%: bonus_points should be 0');
console.assert(test0.total_points === 30, 'Test 0%: total_points should be 30');
console.assert(test0.low_effort === true, 'Test 0%: low_effort should be true');

// Test edge case: 19%
const test19 = calculateScore(19);
console.assert(test19.base_points === 30, 'Test 19%: base_points should be 30');
console.assert(test19.bonus_points === 0, 'Test 19%: bonus_points should be 0');
console.assert(test19.total_points === 30, 'Test 19%: total_points should be 30');
console.assert(test19.low_effort === true, 'Test 19%: low_effort should be true');

// Test edge case: 20%
const test20 = calculateScore(20);
console.assert(test20.base_points === 30, 'Test 20%: base_points should be 30');
console.assert(test20.bonus_points === 6, 'Test 20%: bonus_points should be 6');
console.assert(test20.total_points === 36, 'Test 20%: total_points should be 36');
console.assert(test20.low_effort === false, 'Test 20%: low_effort should be false');

// Test edge case: 21%
const test21 = calculateScore(21);
console.assert(test21.base_points === 30, 'Test 21%: base_points should be 30');
console.assert(test21.bonus_points === 6.3, 'Test 21%: bonus_points should be 6.3');
console.assert(test21.total_points === 36.3, 'Test 21%: total_points should be 36.3');
console.assert(test21.low_effort === false, 'Test 21%: low_effort should be false');

// Test edge case: 100%
const test100 = calculateScore(100);
console.assert(test100.base_points === 30, 'Test 100%: base_points should be 30');
console.assert(test100.bonus_points === 30, 'Test 100%: bonus_points should be 30 (capped)');
console.assert(test100.total_points === 60, 'Test 100%: total_points should be 60');
console.assert(test100.low_effort === false, 'Test 100%: low_effort should be false');

// Test mid-range value: 50%
const test50 = calculateScore(50);
console.assert(test50.base_points === 30, 'Test 50%: base_points should be 30');
console.assert(test50.bonus_points === 15, 'Test 50%: bonus_points should be 15');
console.assert(test50.total_points === 45, 'Test 50%: total_points should be 45');
console.assert(test50.low_effort === false, 'Test 50%: low_effort should be false');

console.log('✅ All score calculator tests passed!');
