# Implementation Plan: Performance-Weighted Scoring Engine

## Overview

This implementation plan breaks down the Performance-Weighted Scoring Engine into discrete coding tasks following the 6-phase development workflow outlined in the design document. The system consists of a Node.js/Express backend with PostgreSQL database and a React/TypeScript frontend. All scoring logic is server-side to prevent manipulation, with a performance-weighted algorithm that awards 30 base points plus up to 30 bonus points based on performance percentage.

## Tasks

- [x] 1. Set up backend project structure and core modules
  - Create directory structure: `server/routes/`, `server/services/`, `server/validators/`, `server/db/`
  - Set up Express server with basic configuration in `server/index.js`
  - Configure environment variable loading with dotenv
  - Configure CORS middleware for cross-origin requests
  - Create placeholder route files for organization
  - _Requirements: 14.1, 14.2, 15.1, 15.3, 16.1, 16.2, 16.3, 17.1, 17.3_

- [x] 2. Implement score calculation logic
  - [x] 2.1 Create score calculator module
    - Implement `calculateScore(performance_percentage)` function in `server/services/scoreCalculator.js`
    - Calculate base_points (always 30)
    - Calculate bonus_points (0 if performance < 20, else min(performance × 0.3, 30))
    - Calculate total_points (base + bonus)
    - Set low_effort flag (true if performance < 20)
    - Return object with base_points, bonus_points, total_points, low_effort
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.2 Write property test for score calculation correctness
    - **Property 1: Score Calculation Correctness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5**
    - Install fast-check testing library
    - Generate random performance values (0-100)
    - Verify base_points always equals 30
    - Verify bonus_points calculation based on performance threshold
    - Verify total_points = base_points + bonus_points
    - Verify bonus_points range [0, 30] and total_points range [30, 60]
    - Run 100 iterations

  - [ ]* 2.3 Write property test for low effort flag correctness
    - **Property 2: Low Effort Flag Correctness**
    - **Validates: Requirements 2.6, 2.7, 3.1, 3.2, 3.4, 3.5**
    - Generate random performance values (0-100)
    - Verify low_effort = true when performance < 20
    - Verify low_effort = false when performance >= 20
    - Run 100 iterations

  - [ ]* 2.4 Write unit tests for score calculator edge cases
    - Test performance = 0: base=30, bonus=0, total=30, low_effort=true
    - Test performance = 19: base=30, bonus=0, total=30, low_effort=true
    - Test performance = 20: base=30, bonus=6, total=36, low_effort=false
    - Test performance = 21: base=30, bonus=6.3, total=36.3, low_effort=false
    - Test performance = 100: base=30, bonus=30, total=60, low_effort=false
    - Test decimal precision (e.g., performance = 33.33)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Implement input validation
  - [x] 3.1 Create input validator module
    - Implement `validateScoreRequest(body)` function in `server/validators/scoreValidator.js`
    - Validate user_id is present and is a positive integer
    - Validate activity_type is one of: CODING_EXERCISE, QUIZ, PROJECT_SUBMISSION
    - Validate performance_percentage is a number between 0 and 100 (inclusive)
    - Return object with `valid` boolean and `errors` array
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write property test for input validation correctness
    - **Property 3: Input Validation Correctness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
    - Generate random request objects with valid and invalid fields
    - Verify requests with missing user_id are rejected
    - Verify requests with invalid activity_type are rejected
    - Verify requests with out-of-range performance_percentage are rejected
    - Verify valid requests pass validation
    - Verify rejected requests include descriptive error messages
    - Run 100 iterations

  - [ ]* 3.3 Write unit tests for input validator
    - Test missing user_id returns validation error
    - Test invalid activity_type values (empty string, wrong enum, null)
    - Test performance_percentage boundaries (0, 100, -1, 101, NaN, null)
    - Test valid inputs pass validation
    - Verify error messages are descriptive
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 4. Checkpoint - Ensure core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Set up database layer
  - [x] 5.1 Create database schema
    - Write SQL migration script for `users` table with id, total_points, created_at
    - Write SQL migration script for `score_events` table with all required columns
    - Add CHECK constraints for data integrity (performance range, points ranges)
    - Add foreign key constraint from score_events.user_id to users.id
    - Add indexes on user_id and created_at in score_events table
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 8.3_

  - [x] 5.2 Create database client module
    - Implement connection pool in `server/db/client.js` using pg library
    - Read DATABASE_URL from environment variables
    - Export `query(text, params)` function for parameterized queries
    - Implement graceful error handling for connection failures
    - _Requirements: 14.2, 15.1, 15.3_

  - [ ]* 5.3 Write integration tests for database operations
    - Test connection pool initialization
    - Test parameterized query execution
    - Test error handling for connection failures
    - Test graceful handling of missing DATABASE_URL
    - _Requirements: 15.1, 15.3_

- [x] 6. Implement score service with database persistence
  - [x] 6.1 Create score service module
    - Implement `awardScore(user_id, activity_type, performance_percentage)` in `server/services/scoreService.js`
    - Begin database transaction
    - Verify user exists in users table (throw 404 error if not)
    - Call score calculator to get point breakdown
    - Insert score_event record with all calculated values
    - Update user's total_points (current + new total)
    - Commit transaction
    - Return calculated score breakdown
    - Implement rollback on any error
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.2 Write property test for points accumulation correctness
    - **Property 4: Points Accumulation Correctness**
    - **Validates: Requirements 5.2**
    - Generate random initial points and multiple performance values
    - Verify new_total_points = initial_total_points + awarded_total_points
    - Verify accumulation is commutative (order doesn't affect final total)
    - Run 100 iterations

  - [ ]* 6.3 Write integration tests for score service
    - Test successful score_event creation with all fields
    - Test user total_points update after scoring
    - Test transaction rollback on error
    - Test foreign key constraint (invalid user_id returns 404)
    - Test concurrent scoring events for same user
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement API route handler
  - [x] 7.1 Create score route handler
    - Implement POST /api/score/award endpoint in `server/routes/score.js`
    - Extract user_id, activity_type, performance_percentage from request body
    - Call input validator and return 400 with errors if validation fails
    - Call score service to award points
    - Handle UserNotFoundError and return 404 with error message
    - Handle other errors and return 500 with generic message
    - Return 200 with score breakdown (base_points, bonus_points, total_points, low_effort)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 7.2 Wire route handler to Express app
    - Import score routes in `server/index.js`
    - Mount routes at /api/score path
    - Add error handling middleware for unhandled errors
    - _Requirements: 1.1, 14.1_

  - [ ]* 7.3 Write API integration tests
    - Test successful request returns 200 with correct structure
    - Test validation errors return 400 with error messages
    - Test user not found returns 404
    - Test service errors return 500
    - Test CORS headers on cross-origin requests
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 16.1, 16.2, 16.3_

- [x] 8. Checkpoint - Ensure backend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Set up frontend project structure
  - [x] 9.1 Create frontend component structure
    - Create directory structure: `client/src/components/`, `client/src/api/`, `client/src/types/`
    - Define TypeScript types in `client/src/types/score.ts` for ScoreRequest, ScoreResponse, ActivityType
    - Set up environment configuration for API base URL
    - _Requirements: 14.3, 14.4, 15.2, 17.2, 17.4_

- [x] 10. Implement API client
  - [x] 10.1 Create score API client module
    - Implement `submitScore(request: ScoreRequest)` function in `client/src/api/scoreApi.ts`
    - Make POST request to /api/score/award endpoint
    - Parse JSON response into ScoreResponse type
    - Implement error handling for network errors (throw NetworkError)
    - Implement error handling for 400 errors (throw ValidationError with message)
    - Implement error handling for 404 errors (throw NotFoundError)
    - Implement error handling for 500 errors (throw ServerError)
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 12.1, 12.2, 12.3, 12.4, 14.3_

  - [ ]* 10.2 Write unit tests for API client
    - Test request payload structure
    - Test response parsing
    - Test error handling for different status codes (400, 404, 500)
    - Test network error handling
    - Use mocked fetch for all tests
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 11. Implement ExerciseCompleteScreen component
  - [x] 11.1 Create main UI component
    - Implement ExerciseCompleteScreen component in `client/src/components/ExerciseCompleteScreen.tsx`
    - Add component props: userId (number), activityType (ActivityType)
    - Add component state: performancePercentage, isSubmitting, scoreResult, error
    - Render performance slider (range input 0-100)
    - Display current slider value (e.g., "Performance: 75%")
    - Render Submit Results button (disabled during submission)
    - Handle slider onChange to update performancePercentage state
    - Handle button onClick to call API client with user_id, activity_type, performance_percentage
    - Set isSubmitting to true during API request
    - Update scoreResult state on successful response
    - Update error state on failed response
    - Set isSubmitting to false after request completes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 13.2_

  - [ ]* 11.2 Write unit tests for ExerciseCompleteScreen
    - Test slider renders with correct range (0-100)
    - Test submit button renders and is clickable
    - Test button is disabled during submission
    - Test slider onChange updates displayed value
    - Test button onClick triggers API call with correct parameters
    - Use React Testing Library and mocked API client
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 13.2_

- [x] 12. Implement score breakdown display
  - [x] 12.1 Create ScoreBreakdown component
    - Implement ScoreBreakdown component in `client/src/components/ScoreBreakdown.tsx`
    - Add props: basePoints (number), bonusPoints (number), totalPoints (number)
    - Display format: "Base: X points · Bonus: Y points · Total earned: Z points"
    - Apply visually prominent styling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 12.2 Integrate ScoreBreakdown into ExerciseCompleteScreen
    - Conditionally render ScoreBreakdown when scoreResult is not null
    - Pass base_points, bonus_points, total_points from scoreResult to ScoreBreakdown
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 12.3 Write unit tests for ScoreBreakdown
    - Test component renders with correct format
    - Test all three values are displayed
    - Test component doesn't render when scoreResult is null
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13. Implement low effort warning display
  - [x] 13.1 Create LowEffortWarning component
    - Implement LowEffortWarning component in `client/src/components/LowEffortWarning.tsx`
    - Add props: visible (boolean)
    - Display text: "We noticed this submission was rushed. Consider giving it another try."
    - Apply subtle warning styling (amber/yellow color, not harsh red)
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 13.2 Integrate LowEffortWarning into ExerciseCompleteScreen
    - Conditionally render LowEffortWarning when scoreResult.low_effort is true
    - Hide warning when scoreResult.low_effort is false
    - _Requirements: 11.1, 11.4_

  - [ ]* 13.3 Write unit tests for LowEffortWarning
    - Test component renders when visible is true
    - Test component doesn't render when visible is false
    - Test correct warning text is displayed
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 14. Implement error handling UI
  - [x] 14.1 Add error display to ExerciseCompleteScreen
    - Conditionally render error message when error state is not null
    - Display network error message: "Unable to connect to server. Please check your connection and try again."
    - Display validation error message from API response (400 status)
    - Display not found error message: "User not found. Please contact support if this problem persists."
    - Display server error message: "Server error. Please try again later."
    - Add retry button for network and server errors
    - Clear error state when retry button is clicked
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 14.2 Write unit tests for error handling
    - Test network error message displays correctly
    - Test validation error message displays correctly
    - Test not found error message displays correctly
    - Test server error message displays correctly
    - Test retry button appears for appropriate errors
    - Test retry button clears error and allows resubmission
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 15. Add styling and polish to frontend
  - [x] 15.1 Apply modern, clean visual design
    - Create CSS module or styled components for ExerciseCompleteScreen
    - Apply appropriate spacing, typography, and color contrast
    - Ensure responsive layout for different screen sizes
    - Organize components in logical, easy-to-scan layout
    - Add loading indicator (spinner or progress message) during API request
    - Style slider with clear visual feedback
    - Style buttons with hover and disabled states
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Checkpoint - Ensure frontend integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Final integration and deployment preparation
  - [ ] 17.1 Create database migration script
    - Create executable script to run database schema creation
    - Add instructions for running migrations
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.2, 8.3_

  - [ ] 17.2 Create seed data script
    - Create script to insert test users into database
    - Add sample user records for testing
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 17.3 Update .gitignore files
    - Ensure node_modules is excluded in both server and client
    - Ensure .env files are excluded
    - Ensure build artifacts are excluded
    - _Requirements: 17.5_

  - [ ] 17.4 Verify environment configuration
    - Create .env.example file with required variables (DATABASE_URL, PORT, CORS_ORIGIN)
    - Document environment variables in README
    - Test that server fails gracefully when DATABASE_URL is missing
    - _Requirements: 15.1, 15.2, 15.3, 17.3_

  - [ ] 17.5 Test end-to-end flow
    - Start backend server
    - Start frontend development server
    - Test complete user flow: adjust slider → submit → see results
    - Test low-effort warning appears for performance < 20
    - Test error handling with invalid inputs
    - Verify CORS works between frontend and backend
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ]* 17.6 Write end-to-end integration tests
    - Test complete scoring flow from frontend to database
    - Test error responses propagate correctly to UI
    - Test loading states during API requests
    - Consider using Cypress or Playwright for E2E tests
    - _Requirements: 1.1, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4_

- [ ] 18. Final checkpoint - Verify all requirements met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows the 6-phase development workflow from the design document
- All 17 requirements are covered across implementation tasks
- Property-based tests validate the 4 correctness properties defined in the design
- Checkpoints ensure incremental validation at key milestones
- The backend uses JavaScript (Node.js + Express) and the frontend uses TypeScript (React)
- Server-side scoring logic prevents client-side manipulation
- Database transactions ensure data consistency during scoring events

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3"] },
    { "id": 3, "tasks": ["5.1", "5.2"] },
    { "id": 4, "tasks": ["5.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["7.2"] },
    { "id": 7, "tasks": ["7.3", "9.1"] },
    { "id": 8, "tasks": ["10.1"] },
    { "id": 9, "tasks": ["10.2", "11.1"] },
    { "id": 10, "tasks": ["11.2", "12.1"] },
    { "id": 11, "tasks": ["12.2"] },
    { "id": 12, "tasks": ["12.3", "13.1"] },
    { "id": 13, "tasks": ["13.2"] },
    { "id": 14, "tasks": ["13.3", "14.1"] },
    { "id": 15, "tasks": ["14.2", "15.1"] },
    { "id": 16, "tasks": ["17.1", "17.2", "17.3", "17.4"] },
    { "id": 17, "tasks": ["17.5", "17.6"] }
  ]
}
```
