# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional)
3. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Steps to Deploy Frontend

1. **Prepare Your Project**
   ```bash
   # Ensure you're in the project root
   cd MarketResearch
   
   # Install dependencies
   npm install
   
   # Build the project locally to test
   npm run build
   ```

2. **Deploy to Vercel**

   **Option 1: Using Vercel Dashboard (Recommended)**
   1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   2. Click "New Project"
   3. Import your Git repository
   4. Configure project:
      - Framework Preset: Next.js
      - Root Directory: `./`
      - Build Command: `npm run build`
      - Output Directory: `.next`
   5. Add Environment Variables:
      ```
      NEXT_PUBLIC_API_URL=YOUR_BACKEND_API_URL
      NEXT_PUBLIC_WS_URL=YOUR_BACKEND_WS_URL
      ```
   6. Click "Deploy"

   **Option 2: Using Vercel CLI**
   ```bash
   # Login to Vercel
   vercel login

   # Deploy
   vercel
   ```

### Environment Variables
Set these in your Vercel project settings:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_WS_URL`: Your backend WebSocket URL

## Backend Deployment

Since the backend uses Python/FastAPI, you have several options for deployment:

### Option 1: Deploy to Railway

1. Create a [Railway](https://railway.app) account
2. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

3. Initialize and deploy:
   ```bash
   # Login to Railway
   railway login

   # Initialize project
   railway init

   # Deploy
   railway up
   ```

4. Set environment variables in Railway Dashboard:
   ```
   OPENAI_API_KEY=your_openai_key
   SERPER_API_KEY=your_serper_key
   CACHE_TTL=3600
   DEBUG_MODE=False
   ```

### Option 2: Deploy to Heroku

1. Create a `Procfile`:
   ```
   web: uvicorn src.api.main:app --host 0.0.0.0 --port $PORT
   ```

2. Deploy:
   ```bash
   # Login to Heroku
   heroku login

   # Create app
   heroku create your-app-name

   # Set environment variables
   heroku config:set OPENAI_API_KEY=your_openai_key
   heroku config:set SERPER_API_KEY=your_serper_key

   # Deploy
   git push heroku main
   ```

### Option 3: Deploy to DigitalOcean App Platform

1. Create a [DigitalOcean](https://www.digitalocean.com) account
2. Create a new App
3. Connect your repository
4. Configure:
   - Type: Python
   - Run Command: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

## Post-Deployment Steps

1. **Update Frontend Configuration**
   - Get your backend URL
   - Update Vercel environment variables with the backend URL
   - Redeploy frontend if necessary

2. **Test the Deployment**
   - Test the frontend URL
   - Test API endpoints
   - Monitor error logs

3. **Set Up Monitoring**
   - Set up Sentry for error tracking
   - Configure logging
   - Set up uptime monitoring

## Security Considerations

1. **API Security**
   - Ensure API keys are securely stored
   - Set up rate limiting
   - Configure CORS properly

2. **Environment Variables**
   - Never commit `.env` files
   - Use different values for development and production

3. **Monitoring**
   - Set up error tracking
   - Monitor API usage
   - Set up alerts for issues

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in `vercel.json`
   - Verify backend CORS settings
   - Check API URL configuration

2. **Build Errors**
   - Check build logs
   - Verify dependencies
   - Check Node.js version

3. **API Connection Issues**
   - Verify environment variables
   - Check API endpoint configuration
   - Verify WebSocket connection

### Getting Help

1. Check deployment logs in Vercel dashboard
2. Review backend server logs
3. Consult documentation:
   - [Vercel Documentation](https://vercel.com/docs)
   - [FastAPI Documentation](https://fastapi.tiangolo.com/deployment/)
   - [Railway Documentation](https://docs.railway.app/)

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update API keys periodically

2. **Backup**
   - Set up regular database backups
   - Back up configuration
   - Document all custom settings

3. **Monitoring**
   - Check error rates
   - Monitor performance
   - Track API usage 