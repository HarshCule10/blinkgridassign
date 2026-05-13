require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { query } = require('./client');

/**
 * Verify database schema
 * Checks if tables, indexes, and constraints were created successfully
 */
async function verifySchema() {
  try {
    console.log('Verifying database schema...\n');

    // Check users table
    const usersTable = await query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('✓ Users table columns:');
    usersTable.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.column_default ? ` (default: ${col.column_default})` : ''}`);
    });

    // Check score_events table
    const scoreEventsTable = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'score_events'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n✓ Score_events table columns:');
    scoreEventsTable.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Check indexes
    const indexes = await query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename IN ('users', 'score_events')
      AND schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    
    console.log('\n✓ Indexes:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });

    // Check constraints
    const constraints = await query(`
      SELECT conname, contype, conrelid::regclass AS table_name
      FROM pg_constraint
      WHERE conrelid IN ('users'::regclass, 'score_events'::regclass)
      ORDER BY table_name, conname;
    `);
    
    console.log('\n✓ Constraints:');
    constraints.rows.forEach(con => {
      const type = {
        'p': 'PRIMARY KEY',
        'f': 'FOREIGN KEY',
        'c': 'CHECK',
        'u': 'UNIQUE'
      }[con.contype] || con.contype;
      console.log(`  - ${con.table_name}.${con.conname} (${type})`);
    });

    // Check test user
    const testUser = await query('SELECT * FROM users WHERE id = 1');
    console.log('\n✓ Test user:', testUser.rows.length > 0 ? 'Created (id=1)' : 'Not found');

    console.log('\n✓ Schema verification complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Schema verification failed:', error.message);
    process.exit(1);
  }
}

verifySchema();
