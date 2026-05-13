# Database Schema Summary

## Overview

The database schema for the Performance-Weighted Scoring Engine has been successfully created with all required tables, constraints, and indexes.

## Tables Created

### 1. users

Stores user profiles with accumulated points.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | auto-increment |
| total_points | INTEGER | NOT NULL, >= 0 | 0 |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP |

**Constraints:**
- `users_total_points_non_negative`: Ensures total_points >= 0

### 2. score_events

Stores individual scoring transaction records with full audit trail.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | SERIAL | PRIMARY KEY | auto-increment |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | - |
| activity_type | VARCHAR(50) | NOT NULL, ENUM | - |
| performance_percentage | NUMERIC(5,2) | NOT NULL, 0-100 | - |
| base_points | INTEGER | NOT NULL, = 30 | - |
| bonus_points | NUMERIC(5,2) | NOT NULL, 0-30 | - |
| total_points | NUMERIC(5,2) | NOT NULL, = base + bonus | - |
| low_effort | BOOLEAN | NOT NULL | - |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP |

**Constraints:**
- `fk_score_events_user_id`: Foreign key to users(id) with CASCADE delete
- `score_events_performance_range`: performance_percentage >= 0 AND <= 100
- `score_events_base_points_fixed`: base_points = 30
- `score_events_bonus_points_range`: bonus_points >= 0 AND <= 30
- `score_events_total_points_sum`: total_points = base_points + bonus_points
- `score_events_activity_type_enum`: activity_type IN ('CODING_EXERCISE', 'QUIZ', 'PROJECT_SUBMISSION')

## Indexes

### Performance Optimization Indexes

1. **idx_score_events_user_id**
   - Column: user_id
   - Purpose: Efficient user history queries
   - Use case: Fetching all scoring events for a specific user

2. **idx_score_events_created_at**
   - Column: created_at
   - Purpose: Time-based queries and analytics
   - Use case: Fetching recent scoring events, date range queries

3. **idx_score_events_user_created**
   - Columns: user_id, created_at DESC
   - Purpose: Composite index for user history sorted by time
   - Use case: Fetching a user's scoring history in chronological order

## Data Integrity Features

### Referential Integrity
- Foreign key constraint ensures all score_events reference valid users
- CASCADE delete removes score_events when a user is deleted

### Business Logic Enforcement
- Base points are always exactly 30 (enforced at database level)
- Bonus points cannot exceed 30 (enforced at database level)
- Total points must equal base + bonus (enforced at database level)
- Performance percentage must be in valid range 0-100
- Activity type must be one of three valid values

### Data Quality
- All critical fields are NOT NULL
- Timestamps are automatically set on record creation
- Total points cannot be negative

## Test Data

A test user is created during migration:
- **User ID**: 1
- **Total Points**: 0
- **Purpose**: Development and testing

## Requirements Mapping

This schema implements the following requirements from the specification:

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| 7.1 | score_events id column | SERIAL PRIMARY KEY |
| 7.2 | score_events user_id column | INTEGER NOT NULL with FK |
| 7.3 | score_events activity_type column | VARCHAR(50) with CHECK |
| 7.4 | score_events performance_percentage | NUMERIC(5,2) with CHECK |
| 7.5 | score_events base_points column | INTEGER with CHECK = 30 |
| 7.6 | score_events bonus_points column | NUMERIC(5,2) with CHECK |
| 7.7 | score_events total_points column | NUMERIC(5,2) with CHECK |
| 7.8 | score_events low_effort column | BOOLEAN NOT NULL |
| 7.9 | score_events created_at column | TIMESTAMP with default |
| 8.1 | users id column | SERIAL PRIMARY KEY |
| 8.2 | users total_points with default 0 | INTEGER DEFAULT 0 |
| 8.3 | users total_points updatable | No restrictions on updates |

## Usage Examples

### Insert a score event
```sql
INSERT INTO score_events (
  user_id, activity_type, performance_percentage,
  base_points, bonus_points, total_points, low_effort
) VALUES (
  1, 'CODING_EXERCISE', 75.00,
  30, 22.50, 52.50, false
);
```

### Update user total points
```sql
UPDATE users 
SET total_points = total_points + 52.50 
WHERE id = 1;
```

### Query user's scoring history
```sql
SELECT * FROM score_events 
WHERE user_id = 1 
ORDER BY created_at DESC 
LIMIT 10;
```

### Analytics query
```sql
SELECT 
  activity_type,
  COUNT(*) as total_submissions,
  AVG(performance_percentage) as avg_performance,
  SUM(total_points) as total_points_awarded
FROM score_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY activity_type;
```

## Migration Commands

### Run migrations
```bash
npm run migrate
```

### Verify schema
```bash
npm run verify-schema
```

## Notes

- The schema uses PostgreSQL-specific features (SERIAL, CHECK constraints)
- All constraints are named for easy identification and maintenance
- Indexes are optimized for the most common query patterns
- The schema enforces business rules at the database level for maximum data integrity
