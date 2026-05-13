# Deployment Guide

This guide provides step-by-step instructions for deploying the Performance-Weighted Scoring Engine to production.

## Pre-Deployment Checklist

### Environment Configuration

- [x] Server `.env` file configured with all required variables
- [x] Client `.env` file configured with backend URL
- [x] Database migration script tested and working
- [x] Seed data script tested and working
- [x] `.gitignore` files properly exclude sensitive files
- [x] Environment variable documentation complete

### Required Environment Variables

#### Server Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | ⚠️ Optional | Server port (default: 3000) | `3000` |
| `CORS_ORIGIN` | ⚠️ Optional | Allowed frontend origin | `https://yourapp.com` |
| `NODE_ENV` | ⚠️ Optional | Environment mode | `production` |

#### Client Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | Backend API URL | `https://api.yourapp.com` |

## Database Setup

### 1. Create PostgreSQL Database

Choose one of the following options:

#### Option A: Supabase (Recommended for Quick Setup)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

#### Option B: AWS RDS
1. Create PostgreSQL instance in AWS RDS
2. Configure security groups to allow connections
3. Note connection details

#### Option C: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb scoring_db`
3. Connection string: `postgresql://localhost:5432/scoring_db`

### 2. Configure Database Connection

Update server `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 3. Run Migrations

```bash
cd server
npm run migrate
```

Expected output:
```
✓ Database connected successfully
✓ Migration 001_create_schema.sql completed successfully
✓ All migrations completed successfully
```

### 4. Seed Test Data (Optional)

```bash
npm run seed
```

This creates 5 test users with IDs 1-5.

### 5. Verify Schema

```bash
npm run verify-schema
```

Expected output:
```
✓ Users table columns: id, total_points, created_at
✓ Score_events table columns: id, user_id, activity_type, ...
✓ Indexes: idx_score_events_user_id, idx_score_events_created_at, ...
✓ Constraints: Foreign keys, CHECK constraints
✓ Test user: Created (id=1)
✓ Schema verification complete!
```

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set DATABASE_URL="postgresql://..."
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN="https://your-frontend.com"
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

5. **Run Migrations**
   ```bash
   heroku run npm run migrate
   ```

### Option 2: Railway

1. **Create Account** at [railway.app](https://railway.app)

2. **Create New Project**
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `server`

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

4. **Set Environment Variables**
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend.com`

5. **Deploy**
   - Railway automatically deploys on git push

6. **Run Migrations**
   - Use Railway CLI or run in dashboard

### Option 3: DigitalOcean App Platform

1. **Create Account** at [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Select "Create App"
   - Connect GitHub repository
   - Select `server` directory

3. **Add Database**
   - Add PostgreSQL database component
   - Note connection string

4. **Configure Environment**
   - Add `DATABASE_URL`
   - Add `CORS_ORIGIN`
   - Add `NODE_ENV=production`

5. **Deploy**
   - DigitalOcean builds and deploys automatically

6. **Run Migrations**
   - Use console or SSH to run `npm run migrate`

### Option 4: AWS EC2 (Advanced)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Configure security group (port 3000)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql-client
   ```

4. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd blinkgrid_assignment/server
   npm install
   ```

5. **Configure Environment**
   ```bash
   nano .env
   # Add DATABASE_URL, PORT, CORS_ORIGIN
   ```

6. **Run Migrations**
   ```bash
   npm run migrate
   ```

7. **Start Server with PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name scoring-api
   pm2 startup
   pm2 save
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment**
   - Create `.env.production` in `client` directory:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

3. **Deploy**
   ```bash
   cd client
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to project settings
   - Add `VITE_API_BASE_URL`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Production Bundle**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add `VITE_API_BASE_URL`

### Option 3: AWS S3 + CloudFront

1. **Build Production Bundle**
   ```bash
   cd client
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Set index document to `index.html`

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

4. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Configure custom domain (optional)

5. **Update Environment Variables**
   - Rebuild with production `VITE_API_BASE_URL`
   - Re-upload to S3

## Post-Deployment Verification

### 1. Test Backend API

```bash
curl -X POST https://your-backend-url.com/api/score/award \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "activity_type": "CODING_EXERCISE",
    "performance_percentage": 75
  }'
```

Expected response:
```json
{
  "base_points": 30,
  "bonus_points": 22.5,
  "total_points": 52.5,
  "low_effort": false
}
```

### 2. Test Frontend

1. Open frontend URL in browser
2. Adjust performance slider
3. Click "Submit Results"
4. Verify score breakdown displays
5. Test with performance < 20% to see warning

### 3. Check CORS

1. Open browser console
2. Submit score from frontend
3. Verify no CORS errors

### 4. Monitor Logs

**Backend:**
- Check server logs for errors
- Verify database connections
- Monitor API response times

**Frontend:**
- Check browser console for errors
- Verify API calls succeed
- Test on different browsers

## Troubleshooting

### CORS Errors

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Update `CORS_ORIGIN` in backend `.env`
2. Restart backend server
3. Clear browser cache

### Database Connection Errors

**Problem:** "Connection refused" or "ECONNREFUSED"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Verify firewall/security group allows connections
4. Test connection with `psql`:
   ```bash
   psql "postgresql://user:pass@host:5432/db"
   ```

### Migration Errors

**Problem:** "relation already exists"

**Solution:**
- Tables already exist, skip migration or drop tables first

**Problem:** "permission denied"

**Solution:**
- Ensure database user has CREATE TABLE permissions

### Frontend Build Errors

**Problem:** "VITE_API_BASE_URL is not defined"

**Solution:**
1. Create `.env` file in `client` directory
2. Add `VITE_API_BASE_URL=https://your-backend-url.com`
3. Rebuild: `npm run build`

### 404 Errors on Frontend Routes

**Problem:** Refreshing page returns 404

**Solution:**
- Configure hosting platform to redirect all routes to `index.html`
- **Vercel:** Add `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Netlify:** Add `_redirects` file:
  ```
  /*    /index.html   200
  ```

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] `.env` files in `.gitignore`
- [ ] Database credentials secure
- [ ] CORS restricted to frontend origin (not `*`)
- [ ] HTTPS enabled for production
- [ ] Database connection uses SSL
- [ ] API rate limiting configured (optional)
- [ ] Error messages don't expose sensitive info

## Monitoring and Maintenance

### Recommended Tools

- **Error Tracking:** Sentry, Rollbar
- **Logging:** LogRocket, Papertrail
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Performance:** New Relic, DataDog

### Regular Maintenance

1. **Monitor Database Size**
   - `score_events` table grows with each submission
   - Consider archiving old records

2. **Check Logs**
   - Review error logs weekly
   - Monitor slow queries

3. **Update Dependencies**
   - Run `npm audit` monthly
   - Update packages with security fixes

4. **Backup Database**
   - Configure automated backups
   - Test restore process

## Rollback Procedure

If deployment fails:

1. **Backend Rollback**
   ```bash
   git revert HEAD
   git push
   # Or use platform-specific rollback (Heroku, Railway, etc.)
   ```

2. **Frontend Rollback**
   - Redeploy previous version
   - Or use platform rollback feature

3. **Database Rollback**
   - Restore from backup
   - Re-run previous migration if needed

## Support

For deployment issues:
1. Check this guide's troubleshooting section
2. Review platform-specific documentation
3. Check application logs
4. Open GitHub issue with error details

## Additional Resources

- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Node.js Deployment](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Last Updated:** 2026-05-13
**Version:** 1.0.0
