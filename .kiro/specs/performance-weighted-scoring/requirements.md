# Requirements Document

## Introduction

The Performance-Weighted Scoring Engine is a backend and frontend system designed to award points to users based on their actual performance in coding exercises, quizzes, and project submissions. The system prevents gaming by implementing server-side scoring logic that awards bonus points only when performance meets quality thresholds. Users receive immediate feedback on their earned points with clear breakdowns and warnings for low-effort submissions.

## Glossary

- **Scoring_Engine**: The server-side component that calculates points based on performance metrics
- **Score_Event**: A record of a single scoring transaction including user, activity type, performance, and points awarded
- **Performance_Percentage**: A numeric value from 0 to 100 representing the quality of a user's submission
- **Base_Points**: The minimum points awarded for any submission (30 points)
- **Bonus_Points**: Additional points awarded based on performance percentage, calculated as performance_percentage × 0.3, capped at 30 points
- **Low_Effort_Flag**: A boolean indicator set to true when performance_percentage is below 20%
- **Activity_Type**: The category of user activity being scored (CODING_EXERCISE, QUIZ, or PROJECT_SUBMISSION)
- **Exercise_Complete_Screen**: The frontend interface that displays scoring results and allows performance submission
- **Users_Table**: Database table storing user information including total accumulated points
- **Score_Events_Table**: Database table storing individual scoring transaction records
- **API_Endpoint**: The server route that accepts scoring requests and returns calculated results

## Requirements

### Requirement 1: Score Award Endpoint

**User Story:** As a backend system, I want to accept scoring requests via API, so that client applications can submit user performance data for point calculation.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL expose a POST endpoint at /api/score/award
2. WHEN a request is received, THE Scoring_Engine SHALL validate that user_id is present
3. WHEN a request is received, THE Scoring_Engine SHALL validate that activity_type is one of CODING_EXERCISE, QUIZ, or PROJECT_SUBMISSION
4. WHEN a request is received, THE Scoring_Engine SHALL validate that performance_percentage is a number between 0 and 100 inclusive
5. IF validation fails, THEN THE Scoring_Engine SHALL return a 400 status code with a descriptive error message

### Requirement 2: Server-Side Score Calculation

**User Story:** As a platform administrator, I want scoring logic to execute only on the server, so that users cannot manipulate their point awards.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL calculate Base_Points as exactly 30 for all submissions
2. WHEN performance_percentage is 20 or greater, THE Scoring_Engine SHALL calculate Bonus_Points as performance_percentage multiplied by 0.3
3. WHEN performance_percentage is less than 20, THE Scoring_Engine SHALL set Bonus_Points to 0
4. THE Scoring_Engine SHALL cap Bonus_Points at a maximum of 30
5. THE Scoring_Engine SHALL calculate total points as Base_Points plus Bonus_Points
6. WHEN performance_percentage is less than 20, THE Scoring_Engine SHALL set Low_Effort_Flag to true
7. WHEN performance_percentage is 20 or greater, THE Scoring_Engine SHALL set Low_Effort_Flag to false

### Requirement 3: Edge Case Handling

**User Story:** As a developer, I want the scoring engine to handle boundary conditions correctly, so that edge cases produce predictable results.

#### Acceptance Criteria

1. WHEN performance_percentage is exactly 0, THE Scoring_Engine SHALL award 30 Base_Points, 0 Bonus_Points, and set Low_Effort_Flag to true
2. WHEN performance_percentage is exactly 20, THE Scoring_Engine SHALL award 30 Base_Points, 6 Bonus_Points, and set Low_Effort_Flag to false
3. WHEN performance_percentage is exactly 100, THE Scoring_Engine SHALL award 30 Base_Points and 30 Bonus_Points (capped)
4. WHEN performance_percentage is 19, THE Scoring_Engine SHALL award 30 Base_Points, 0 Bonus_Points, and set Low_Effort_Flag to true
5. WHEN performance_percentage is 21, THE Scoring_Engine SHALL award 30 Base_Points, 6.3 Bonus_Points, and set Low_Effort_Flag to false

### Requirement 4: Score Event Persistence

**User Story:** As a platform administrator, I want each scoring event recorded in the database, so that I can audit point awards and analyze user behavior.

#### Acceptance Criteria

1. WHEN a score is calculated, THE Scoring_Engine SHALL insert a record into Score_Events_Table
2. THE Scoring_Engine SHALL store user_id in the Score_Event record
3. THE Scoring_Engine SHALL store activity_type in the Score_Event record
4. THE Scoring_Engine SHALL store performance_percentage in the Score_Event record
5. THE Scoring_Engine SHALL store Base_Points in the Score_Event record
6. THE Scoring_Engine SHALL store Bonus_Points in the Score_Event record
7. THE Scoring_Engine SHALL store total points in the Score_Event record
8. THE Scoring_Engine SHALL store Low_Effort_Flag in the Score_Event record
9. THE Scoring_Engine SHALL store a timestamp in the Score_Event record

### Requirement 5: User Points Accumulation

**User Story:** As a user, I want my total points to increase with each submission, so that I can track my overall progress on the platform.

#### Acceptance Criteria

1. WHEN a Score_Event is created, THE Scoring_Engine SHALL retrieve the current total points from Users_Table for the user_id
2. WHEN a Score_Event is created, THE Scoring_Engine SHALL add the awarded total points to the user's existing total
3. WHEN a Score_Event is created, THE Scoring_Engine SHALL update the Users_Table with the new total points for the user_id
4. IF the user_id does not exist in Users_Table, THEN THE Scoring_Engine SHALL return a 404 status code with an error message

### Requirement 6: Score Breakdown Response

**User Story:** As a client application, I want to receive a detailed breakdown of awarded points, so that I can display transparent scoring information to users.

#### Acceptance Criteria

1. WHEN scoring is successful, THE Scoring_Engine SHALL return a 200 status code
2. THE Scoring_Engine SHALL return Base_Points in the response
3. THE Scoring_Engine SHALL return Bonus_Points in the response
4. THE Scoring_Engine SHALL return total points in the response
5. THE Scoring_Engine SHALL return Low_Effort_Flag in the response
6. THE Scoring_Engine SHALL return the response in JSON format

### Requirement 7: Database Schema for Score Events

**User Story:** As a database administrator, I want a properly structured score_events table, so that scoring data is stored consistently and efficiently.

#### Acceptance Criteria

1. THE Score_Events_Table SHALL include an id column as the primary key
2. THE Score_Events_Table SHALL include a user_id column
3. THE Score_Events_Table SHALL include an activity_type column
4. THE Score_Events_Table SHALL include a performance_percentage column
5. THE Score_Events_Table SHALL include a base_points column
6. THE Score_Events_Table SHALL include a bonus_points column
7. THE Score_Events_Table SHALL include a total_points column
8. THE Score_Events_Table SHALL include a low_effort column
9. THE Score_Events_Table SHALL include a created_at column with timestamp

### Requirement 8: Database Schema for Users

**User Story:** As a database administrator, I want a users table that tracks total points, so that user progress can be maintained across sessions.

#### Acceptance Criteria

1. THE Users_Table SHALL include an id column as the primary key
2. THE Users_Table SHALL include a total_points column with a default value of 0
3. THE Users_Table SHALL support updating the total_points column

### Requirement 9: Exercise Complete Screen Interface

**User Story:** As a user, I want an intuitive interface to submit my exercise results, so that I can easily see how my performance translates to points.

#### Acceptance Criteria

1. THE Exercise_Complete_Screen SHALL display a slider control for selecting performance_percentage from 0 to 100
2. THE Exercise_Complete_Screen SHALL display the current slider value
3. THE Exercise_Complete_Screen SHALL display a Submit Results button
4. WHEN the Submit Results button is clicked, THE Exercise_Complete_Screen SHALL send a POST request to /api/score/award
5. THE Exercise_Complete_Screen SHALL include user_id in the API request
6. THE Exercise_Complete_Screen SHALL include activity_type in the API request
7. THE Exercise_Complete_Screen SHALL include the selected performance_percentage in the API request

### Requirement 10: Score Breakdown Display

**User Story:** As a user, I want to see a clear breakdown of my earned points, so that I understand how my score was calculated.

#### Acceptance Criteria

1. WHEN the API response is received, THE Exercise_Complete_Screen SHALL display Base_Points with the label "Base"
2. WHEN the API response is received, THE Exercise_Complete_Screen SHALL display Bonus_Points with the label "Bonus"
3. WHEN the API response is received, THE Exercise_Complete_Screen SHALL display total points with the label "Total earned"
4. THE Exercise_Complete_Screen SHALL format the display as "Base: X points · Bonus: Y points · Total earned: Z points"
5. THE Exercise_Complete_Screen SHALL display the breakdown in a visually prominent manner

### Requirement 11: Low Effort Warning Display

**User Story:** As a user, I want to receive feedback when my submission appears rushed, so that I can improve my effort and learning outcomes.

#### Acceptance Criteria

1. WHEN Low_Effort_Flag is true in the API response, THE Exercise_Complete_Screen SHALL display a warning message
2. THE Exercise_Complete_Screen SHALL display the warning text "We noticed this submission was rushed. Consider giving it another try."
3. THE Exercise_Complete_Screen SHALL style the warning message subtly to avoid harsh criticism
4. WHEN Low_Effort_Flag is false in the API response, THE Exercise_Complete_Screen SHALL NOT display a warning message

### Requirement 12: Frontend Error Handling

**User Story:** As a user, I want to see helpful error messages when submission fails, so that I can understand what went wrong and retry.

#### Acceptance Criteria

1. IF the API request fails with a network error, THEN THE Exercise_Complete_Screen SHALL display an error message indicating connection failure
2. IF the API request returns a 400 status code, THEN THE Exercise_Complete_Screen SHALL display the error message from the API response
3. IF the API request returns a 404 status code, THEN THE Exercise_Complete_Screen SHALL display an error message indicating the user was not found
4. IF the API request returns a 500 status code, THEN THE Exercise_Complete_Screen SHALL display a generic server error message

### Requirement 13: User Interface Quality

**User Story:** As a user, I want a polished and professional interface, so that I have confidence in the platform's quality.

#### Acceptance Criteria

1. THE Exercise_Complete_Screen SHALL use a modern, clean visual design
2. THE Exercise_Complete_Screen SHALL provide clear visual feedback during API request processing
3. THE Exercise_Complete_Screen SHALL use appropriate spacing, typography, and color contrast
4. THE Exercise_Complete_Screen SHALL be responsive and functional on different screen sizes
5. THE Exercise_Complete_Screen SHALL organize components in a logical, easy-to-scan layout

### Requirement 14: Codebase Organization

**User Story:** As a developer, I want a well-organized codebase, so that the system is maintainable and extensible.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL separate routing logic from business logic
2. THE Scoring_Engine SHALL separate database operations into dedicated modules
3. THE Exercise_Complete_Screen SHALL separate API communication logic from UI components
4. THE Exercise_Complete_Screen SHALL use TypeScript types for API request and response structures
5. THE codebase SHALL include clear file and folder naming conventions

### Requirement 15: Environment Configuration

**User Story:** As a developer, I want database credentials managed through environment variables, so that sensitive information is not hardcoded.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL read database connection details from the DATABASE_URL environment variable
2. THE Exercise_Complete_Screen SHALL read the API base URL from an environment variable or configuration file
3. THE Scoring_Engine SHALL fail gracefully with a descriptive error if DATABASE_URL is not set

### Requirement 16: CORS Configuration

**User Story:** As a frontend application, I want the API to accept requests from my origin, so that browser security policies do not block my requests.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL enable CORS for cross-origin requests
2. THE Scoring_Engine SHALL accept requests from the frontend application's origin
3. THE Scoring_Engine SHALL handle preflight OPTIONS requests correctly

### Requirement 17: Deployment Readiness

**User Story:** As a DevOps engineer, I want both server and client to be deployment-ready, so that I can deploy to production without additional configuration.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL include a start script in package.json
2. THE Exercise_Complete_Screen SHALL include a build script in package.json
3. THE Scoring_Engine SHALL handle production environment variables
4. THE Exercise_Complete_Screen SHALL build static assets for production deployment
5. THE codebase SHALL include a .gitignore file that excludes node_modules and .env files
