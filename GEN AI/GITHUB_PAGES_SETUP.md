# GitHub Pages Deployment Guide

## Automatic Deployment Setup

Your Next.js application is now configured for automatic deployment to GitHub Pages using GitHub Actions.

### What's Been Configured:

1. **Next.js Configuration** (`client/next.config.js`):
   - Static export enabled
   - GitHub Pages basePath configured
   - Image optimization disabled for static export
   - Asset prefix set for subdirectory hosting

2. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatic build on push to main branch
   - Deploys to GitHub Pages automatically
   - Handles the `gh-pages` branch creation

### To Enable GitHub Pages:

1. Go to your repository: https://github.com/ssam-dev/GenAI
2. Click **Settings** → **Pages**
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **"gh-pages"** branch and **"/ (root)"** folder
5. Click **Save**

### Your Application URLs:

- **GitHub Pages**: https://ssam-dev.github.io/GenAI/
- **Voice Assistant**: https://ssam-dev.github.io/GenAI/voice-assistant/
- **Dashboard**: https://ssam-dev.github.io/GenAI/dashboard/

### Manual Build (if needed):

```bash
cd "GEN AI/client"
npm run build
```

The built files will be in the `dist` folder.

### Important Notes:

- The application will be static (no server-side functionality)
- API calls will need to be updated to point to your backend hosting
- Voice registration will work but won't save to database without backend
- All client-side features (UI, routing, voice recognition) will work perfectly

### For Full Functionality:

Deploy your backend (`server` folder) to:
- Heroku, Railway, or Render (Node.js hosting)
- Update API URLs in the frontend to point to your backend hosting