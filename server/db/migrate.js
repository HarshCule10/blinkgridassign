require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./client');

/**
 * Run database migrations
 * Executes SQL migration files in order
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error('Migrations directory not found:', migrationsDir);
      process.exit(1);
    }

    // Get all SQL files in migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${files.length} migration file(s)`);

    // Execute each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`\nExecuting migration: ${file}`);
      
      try {
        await query(sql);
        console.log(`✓ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`✗ Migration ${file} failed:`, error.message);
        throw error;
      }
    }

    console.log('\n✓ All migrations completed successfully');
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(0);
  }
}

// Run migrations if executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
