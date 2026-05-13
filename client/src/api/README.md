# API Directory

This directory contains API client modules for communicating with the backend.

## Implemented Modules

### scoreApi.ts

API client for score submission.

**Functions:**
- `submitScore(request: ScoreRequest): Promise<ScoreResponse>` - Submits a score to the backend API

**Error Handling:**
- Throws `NetworkError` for connection failures
- Throws `ValidationError` for 400 status codes
- Throws `NotFoundError` for 404 status codes
- Throws `ServerError` for 500 status codes

**Usage:**
```typescript
import { submitScore } from '../api/scoreApi';

const result = await submitScore({
  user_id: 1,
  activity_type: 'CODING_EXERCISE',
  performance_percentage: 75
});
```

## API Client Structure

Each API client should:
- Use TypeScript types from `src/types/score.ts`
- Handle HTTP requests using fetch API
- Implement proper error handling for different status codes
- Throw appropriate custom errors (NetworkError, ValidationError, NotFoundError, ServerError)
- Use environment configuration from `src/config/environment.ts`
