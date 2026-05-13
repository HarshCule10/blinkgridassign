# Components Directory

This directory contains React components for the Performance-Weighted Scoring Engine.

## Implemented Components

### ExerciseCompleteScreen

Main UI component for performance submission and score display.

**Props:**
- `userId` (number): The ID of the user submitting the performance
- `activityType` (ActivityType): The type of activity being scored (CODING_EXERCISE, QUIZ, or PROJECT_SUBMISSION)

**Features:**
- Performance slider (0-100%)
- Submit button with loading state
- Integrated score breakdown display (base points, bonus points, total points)
- Integrated low effort warning (when performance < 20%)
- Error handling with user-friendly messages
- Responsive design

**Usage:**
```tsx
import { ExerciseCompleteScreen } from './components/ExerciseCompleteScreen';

<ExerciseCompleteScreen 
  userId={1} 
  activityType="CODING_EXERCISE" 
/>
```

## Planned Components

- **ScoreBreakdown**: Separate component to display the breakdown of earned points (currently integrated in ExerciseCompleteScreen)
- **LowEffortWarning**: Separate component to display warning for low-effort submissions (currently integrated in ExerciseCompleteScreen)

## Component Structure

Each component should:
- Be implemented in TypeScript with proper type definitions
- Include appropriate props interfaces
- Handle state management for user interactions
- Follow React best practices and hooks patterns
