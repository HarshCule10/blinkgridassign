# Database Migrations

This directory contains SQL migration scripts for the Performance-Weighted Scoring Engine database schema.

## Running Migrations

To run all migrations:

```bash
npm run migrate
```

This will execute all `.sql` files in this directory in alphabetical order.

## Verifying Schema

To verify the database schema was created correctly:

```bash
node db/verify_schema.js
```

This will display:
- All table columns and their data types
- All indexes
- All constraints (PRIMARY KEY, FOREIGN KEY, CHECK)
- Test user status

## Migration Files

### 001_create_schema.sql

Creates the core database schema for the scoring system:

**Tables:**
- `users`: Stores user profiles with accumulated points
- `score_events`: Stores individual scoring transaction records

**Constraints:**
- Users table: `total_points >= 0`
- Score_events table:
  - `performance_percentage` between 0 and 100
  - `base_points` must equal 30
  - `bonus_points` between 0 and 30
  - `total_points = base_points + bonus_points`
  - `activity_type` must be one of: CODING_EXERCISE, QUIZ, PROJECT_SUBMISSION
  - Foreign key to users table

**Indexes:**
- `idx_score_events_user_id`: For efficient user history queries
- `idx_score_events_created_at`: For time-based queries
- `idx_score_events_user_created`: Composite index for user history sorted by time

**Test Data:**
- Creates a test user with id=1 for development

## Requirements Validated

This migration implements the following requirements:

- **7.1**: score_events table with id column as primary key
- **7.2**: score_events table with user_id column
- **7.3**: score_events table with activity_type column
- **7.4**: score_events table with performance_percentage column
- **7.5**: score_events table with base_points column
- **7.6**: score_events table with bonus_points column
- **7.7**: score_events table with total_points column
- **7.8**: score_events table with low_effort column
- **7.9**: score_events table with created_at timestamp column
- **8.1**: users table with id column as primary key
- **8.2**: users table with total_points column (default 0)
- **8.3**: users table supports updating total_points

## Database Configuration

Ensure your `.env` file contains:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

The migration script will fail gracefully if DATABASE_URL is not configured.
