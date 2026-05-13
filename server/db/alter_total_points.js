/**
 * Migration script to alter users.total_points from INTEGER to NUMERIC(10,2)
 * This allows the column to store decimal values for accurate point accumulation
 */

require('dotenv').config();
const { query } = require('./client');

async function alterTotalPointsColumn() {
  try {
    console.log('Altering users.total_points column type...');
    
    await query('ALTER TABLE users ALTER COLUMN total_points TYPE NUMERIC(10,2)');
    
    console.log('✓ Successfully altered users.total_points to NUMERIC(10,2)');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error altering column:', error.message);
    process.exit(1);
  }
}

alterTotalPointsColumn();
