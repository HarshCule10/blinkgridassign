const { Pool } = require('pg');

/**
 * Database Client Module
 * 
 * Provides connection pooling and query execution for PostgreSQL database.
 * Implements requirements 14.2, 15.1, and 15.3:
 * - Separates database operations into dedicated module (14.2)
 * - Reads DATABASE_URL from environment variables (15.1)
 * - Fails gracefully with descriptive error if DATABASE_URL not set (15.3)
 */

let pool = null;
let isInitialized = false;

/**
 * Initialize the database connection pool
 * This is called lazily on first query to ensure environment variables are loaded
 */
function initializePool() {
  if (isInitialized) {
    return;
  }

  // Validate DATABASE_URL is configured (Requirement 15.3)
  if (!process.env.DATABASE_URL) {
    const errorMessage = 'FATAL ERROR: DATABASE_URL environment variable is not set. Please configure DATABASE_URL in your .env file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Configure connection pool (Requirement 15.1)
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Enable SSL for cloud databases (Supabase, AWS RDS, etc.)
    // Disable SSL verification for development/self-signed certificates
    ssl: process.env.DATABASE_URL.includes('supabase.co') || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
    // Connection pool settings for optimal performance
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
  };

  // Create connection pool
  pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
  });

  isInitialized = true;

  // Test connection on startup with retry logic
  testConnection().catch(err => {
    console.error('Database initialization failed:', err.message);
    // Don't exit process - let the application handle the error
  });
}

let connectionAttempts = 0;
const maxConnectionAttempts = 3;

async function testConnection() {
  if (!pool) {
    initializePool();
  }

  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✓ Database connected successfully at', result.rows[0].current_time);
    return true;
  } catch (error) {
    connectionAttempts++;
    console.error(`✗ Database connection attempt ${connectionAttempts}/${maxConnectionAttempts} failed:`, error.message);
    
    if (connectionAttempts < maxConnectionAttempts) {
      console.log(`Retrying in ${connectionAttempts * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, connectionAttempts * 2000));
      return testConnection();
    } else {
      console.error('FATAL: Could not establish database connection after', maxConnectionAttempts, 'attempts');
      throw error;
    }
  }
}

/**
 * Execute a parameterized SQL query
 * 
 * @param {string} text - SQL query text with $1, $2, etc. placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<QueryResult>} - Query result object
 * @throws {Error} - Database query error
 * 
 * Example:
 *   const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
async function query(text, params) {
  // Lazy initialization - ensure pool is created before first query
  if (!pool) {
    initializePool();
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query execution (sanitize in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { 
        text: text.substring(0, 100), // Truncate long queries
        duration: `${duration}ms`, 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('Query execution error:', {
      message: error.message,
      query: text.substring(0, 100),
      code: error.code
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transaction support
 * 
 * @returns {Promise<PoolClient>} - Database client
 * 
 * Example:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     await client.query('INSERT INTO ...');
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
async function getClient() {
  if (!pool) {
    initializePool();
  }
  return pool.connect();
}

// Graceful shutdown handlers
const shutdown = async () => {
  if (!pool) {
    return;
  }
  
  console.log('Shutting down database connection pool...');
  try {
    await pool.end();
    console.log('✓ Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  query,
  getClient,
  pool: () => {
    if (!pool) {
      initializePool();
    }
    return pool;
  }
};
