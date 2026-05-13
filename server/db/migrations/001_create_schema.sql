-- Migration: Create database schema for performance-weighted scoring system
-- Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 8.3

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  total_points NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_total_points_non_negative CHECK (total_points >= 0)
);

-- Create score_events table
CREATE TABLE IF NOT EXISTS score_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  performance_percentage NUMERIC(5,2) NOT NULL,
  base_points INTEGER NOT NULL,
  bonus_points NUMERIC(5,2) NOT NULL,
  total_points NUMERIC(5,2) NOT NULL,
  low_effort BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_score_events_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id)
    ON DELETE CASCADE,
  
  -- Data integrity constraints
  CONSTRAINT score_events_performance_range 
    CHECK (performance_percentage >= 0 AND performance_percentage <= 100),
  
  CONSTRAINT score_events_base_points_fixed 
    CHECK (base_points = 30),
  
  CONSTRAINT score_events_bonus_points_range 
    CHECK (bonus_points >= 0 AND bonus_points <= 30),
  
  CONSTRAINT score_events_total_points_sum 
    CHECK (total_points = base_points + bonus_points),
  
  CONSTRAINT score_events_activity_type_enum 
    CHECK (activity_type IN ('CODING_EXERCISE', 'QUIZ', 'PROJECT_SUBMISSION'))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_score_events_user_id 
  ON score_events(user_id);

CREATE INDEX IF NOT EXISTS idx_score_events_created_at 
  ON score_events(created_at);

-- Create composite index for user history queries
CREATE INDEX IF NOT EXISTS idx_score_events_user_created 
  ON score_events(user_id, created_at DESC);

-- Insert test user for development
INSERT INTO users (id, total_points) 
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully';
  RAISE NOTICE 'Tables: users, score_events';
  RAISE NOTICE 'Indexes: idx_score_events_user_id, idx_score_events_created_at, idx_score_events_user_created';
  RAISE NOTICE 'Test user created with id=1';
END $$;
