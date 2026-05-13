# Database Setup Guide

This directory contains database migrations, seed data, and utility scripts for the Performance-Weighted Scoring Engine.

## Prerequisites

- PostgreSQL database (local or hosted)
- Node.js installed
- Database connection string (DATABASE_URL)

## Environment Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

See `server/.env.example` for a template.

## Database Scripts

### 1. Run Migrations

Creates the database schema (users and score_events tables):

```bash
cd server
npm run migrate
```

This will:
- Create the `users` table with id, total_points, and created_at columns
- Create the `score_events` table with all scoring event fields
- Add foreign key constraints and data integrity checks
- Create indexes for efficient queries
- Insert a test user with id=1

### 2. Seed Test Data

Populates the database with test users:

```bash
cd server
npm run seed
```

This will create 5 test users:
- User 1: New user (0 points)
- User 2: Beginner (150 points)
- User 3: Intermediate (500 points)
- User 4: Advanced (1000 points)
- User 5: New user (0 points)

### 3. Verify Schema

Checks that the database schema is correctly set up:

```bash
cd server
npm run verify-schema
```

## Database Schema

### users Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| total_points | NUMERIC(10,2) | NOT NULL, DEFAULT 0, >= 0 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### score_events Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
| activity_type | VARCHAR(50) | NOT NULL, IN ('CODING_EXERCISE', 'QUIZ', 'PROJECT_SUBMISSION') |
| performance_percentage | NUMERIC(5,2) | NOT NULL, 0-100 |
| base_points | INTEGER | NOT NULL, = 30 |
| bonus_points | NUMERIC(5,2) | NOT NULL, 0-30 |
| total_points | NUMERIC(5,2) | NOT NULL, = base_points + bonus_points |
| low_effort | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_score_events_user_id` on user_id
- `idx_score_events_created_at` on created_at
- `idx_score_events_user_created` on (user_id, created_at DESC)

## Troubleshooting

### Connection Errors

If you see "Connection refused" or "ECONNREFUSED":
1. Verify PostgreSQL is running
2. Check DATABASE_URL is correct in `.env`
3. Ensure database exists and credentials are valid

### Migration Errors

If migrations fail:
1. Check PostgreSQL logs for detailed error messages
2. Verify you have CREATE TABLE permissions
3. Try dropping existing tables if re-running migrations

### Missing DATABASE_URL

If you see "DATABASE_URL is not set":
1. Create a `.env` file in the `server` directory
2. Copy contents from `.env.example`
3. Update with your actual database credentials

## Manual Database Setup

If you prefer to run SQL manually:

```sql
-- Connect to your PostgreSQL database
psql -U username -d database_name

-- Run the migration file
\i server/db/migrations/001_create_schema.sql
```

## Files

- `migrations/001_create_schema.sql` - Database schema definition
- `migrate.js` - Migration runner script
- `seed.js` - Test data seeding script
- `verify_schema.js` - Schema verification utility
- `client.js` - PostgreSQL connection pool
- `README.md` - This file
