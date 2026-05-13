# Performance-Weighted Scoring Engine

A full-stack application that calculates and awards points to users based on their performance in coding exercises, quizzes, and project submissions. The system implements server-side scoring logic to prevent gaming and provides immediate feedback with detailed point breakdowns.

## Features

- **Server-Side Scoring**: All calculations happen on the backend to prevent manipulation
- **Performance-Based Rewards**: 30 base points + up to 30 bonus points based on performance
- **Quality Threshold**: Low-effort submissions (< 20% performance) receive warnings
- **Transparent Feedback**: Clear breakdown of base points, bonus points, and total earned
- **Audit Trail**: Complete history of all scoring events in the database
- **Modern UI**: React-based interface with real-time performance slider

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Database**: PostgreSQL
- **Database Client**: pg (node-postgres)
- **Environment**: dotenv

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 4.x
- **Styling**: CSS

## Project Structure

```
blinkgrid_assignment/
├── server/                 # Backend API
│   ├── db/                # Database layer
│   │   ├── migrations/    # SQL migration files
│   │   ├── client.js      # PostgreSQL connection pool
│   │   ├── migrate.js     # Migration runner
│   │   ├── seed.js        # Test data seeder
│   │   └── README.md      # Database documentation
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── validators/        # Input validation
│   ├── index.js           # Express server entry point
│   ├── package.json       # Backend dependencies
│   ├── .env               # Environment variables (not in git)
│   └── .env.example       # Environment template
├── client/                # Frontend application
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── config/       # Configuration
│   │   └── types/        # TypeScript types
│   ├── package.json      # Frontend dependencies
│   ├── .env.example      # Environment template
│   └── vite.config.ts    # Vite configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (local or hosted)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blinkgrid_assignment
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port (optional, default: 3000) | `3000` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

#### Run Database Migrations

```bash
npm run migrate
```

This creates the database schema (users and score_events tables).

#### Seed Test Data (Optional)

```bash
npm run seed
```

This creates 5 test users with varying point totals.

#### Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`.

### 3. Frontend Setup

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Edit `.env` with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

#### Start the Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`.

### 4. Verify Setup

1. Open `http://localhost:5173` in your browser
2. Adjust the performance slider (0-100%)
3. Click "Submit Results"
4. View the point breakdown and any warnings

## API Documentation

### POST /api/score/award

Awards points based on user performance.

**Request Body:**

```json
{
  "user_id": 1,
  "activity_type": "CODING_EXERCISE",
  "performance_percentage": 75
}
```

**Activity Types:**
- `CODING_EXERCISE`
- `QUIZ`
- `PROJECT_SUBMISSION`

**Response (200 OK):**

```json
{
  "base_points": 30,
  "bonus_points": 22.5,
  "total_points": 52.5,
  "low_effort": false
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input (missing fields, out of range values)
- `404 Not Found`: User does not exist
- `500 Internal Server Error`: Server error

## Scoring Algorithm

The scoring system awards points based on performance:

```
base_points = 30 (always)

if performance_percentage < 20:
    bonus_points = 0
    low_effort = true
else:
    bonus_points = min(performance_percentage × 0.3, 30)
    low_effort = false

total_points = base_points + bonus_points
```

**Examples:**

| Performance | Base | Bonus | Total | Low Effort |
|-------------|------|-------|-------|------------|
| 0% | 30 | 0 | 30 | Yes |
| 19% | 30 | 0 | 30 | Yes |
| 20% | 30 | 6 | 36 | No |
| 50% | 30 | 15 | 45 | No |
| 100% | 30 | 30 | 60 | No |

## Testing

### Backend Tests

```bash
cd server
npm test
```

Runs unit tests for:
- Score calculator
- Input validator
- Score service
- API routes

### Frontend Tests

```bash
cd client
npm test
```

Runs component tests for:
- ExerciseCompleteScreen
- ScoreBreakdown
- LowEffortWarning
- API client

## Database Management

### View Schema

```bash
cd server
npm run verify-schema
```

### Reset Database

To reset the database and start fresh:

```bash
# Drop all tables (use with caution!)
psql -U username -d database_name -c "DROP TABLE IF EXISTS score_events, users CASCADE;"

# Re-run migrations
npm run migrate

# Re-seed test data
npm run seed
```

## Deployment

### Backend Deployment

1. Set environment variables on your hosting platform:
   - `DATABASE_URL`
   - `PORT` (if required)
   - `CORS_ORIGIN` (your frontend URL)
   - `NODE_ENV=production`

2. Run migrations:
   ```bash
   npm run migrate
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Update `VITE_API_BASE_URL` in `.env` to your backend URL

2. Build the production bundle:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

## Troubleshooting

### Database Connection Errors

**Error**: "DATABASE_URL is not set"
- **Solution**: Create a `.env` file in the `server` directory with `DATABASE_URL`

**Error**: "Connection refused"
- **Solution**: Verify PostgreSQL is running and credentials are correct

### CORS Errors

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Solution**: Update `CORS_ORIGIN` in server `.env` to match your frontend URL

### Migration Errors

**Error**: "relation already exists"
- **Solution**: Tables already exist. Drop them or skip migration.

**Error**: "permission denied"
- **Solution**: Ensure database user has CREATE TABLE permissions

## Environment Variables Reference

### Server (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 3000 | Server port |
| `CORS_ORIGIN` | No | * | Allowed frontend origin |
| `NODE_ENV` | No | development | Environment mode |

### Client (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | - | Backend API URL |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Database Setup Guide](server/db/README.md)
3. Open an issue on GitHub

## Acknowledgments

Built as part of the BlinkGrid assignment to demonstrate full-stack development skills with a focus on:
- Server-side security
- Clean architecture
- User experience
- Database design
- API design
