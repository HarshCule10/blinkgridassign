require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { query, pool } = require('./client');

/**
 * Seed database with test data
 * Creates sample users for testing the scoring system
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Check if users already exist
    const existingUsers = await query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);

    if (userCount > 0) {
      console.log(`Database already contains ${userCount} user(s)`);
      console.log('Do you want to add more test users? (Existing users will not be affected)');
    }

    // Insert test users
    const testUsers = [
      { id: 1, total_points: 0 },
      { id: 2, total_points: 150 },
      { id: 3, total_points: 500 },
      { id: 4, total_points: 1000 },
      { id: 5, total_points: 0 }
    ];

    console.log(`Inserting ${testUsers.length} test users...`);

    for (const user of testUsers) {
      try {
        await query(
          `INSERT INTO users (id, total_points) 
           VALUES ($1, $2) 
           ON CONFLICT (id) DO UPDATE 
           SET total_points = EXCLUDED.total_points`,
          [user.id, user.total_points]
        );
        console.log(`✓ User ${user.id} created/updated (total_points: ${user.total_points})`);
      } catch (error) {
        console.error(`✗ Failed to create user ${user.id}:`, error.message);
      }
    }

    // Display summary
    const finalCount = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(finalCount.rows[0].count);

    console.log(`\n✓ Database seeding completed successfully`);
    console.log(`Total users in database: ${totalUsers}`);
    console.log('\nTest users available:');
    console.log('  - User 1: New user (0 points)');
    console.log('  - User 2: Beginner (150 points)');
    console.log('  - User 3: Intermediate (500 points)');
    console.log('  - User 4: Advanced (1000 points)');
    console.log('  - User 5: New user (0 points)');

  } catch (error) {
    console.error('\n✗ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(0);
  }
}

// Run seeding if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
