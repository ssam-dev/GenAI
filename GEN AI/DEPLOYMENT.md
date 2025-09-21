# ArtisanCraft Deployment Guide

This guide will help you deploy the ArtisanCraft e-commerce platform to production.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB database (local or cloud)
- Domain name (optional)
- SSL certificate (recommended)

### 1. Environment Setup

#### Backend Environment
Create `server/.env` with production values:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artisan-marketplace
JWT_SECRET=your-super-secure-jwt-secret-key-here
CLIENT_URL=https://yourdomain.com

# Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend Environment
Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 2. Database Setup

#### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP addresses
5. Get your connection string
6. Update `MONGODB_URI` in your environment file

#### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/artisan-marketplace`

### 3. Build and Deploy

#### Option A: Vercel + Railway/Render

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/.next`
4. Add environment variables in Vercel dashboard

**Backend (Railway/Render):**
1. Connect your GitHub repository
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables

#### Option B: DigitalOcean App Platform

1. Create a new app
2. Connect your GitHub repository
3. Configure build settings:
   - Frontend: `client/` directory, build command: `npm run build`
   - Backend: `server/` directory, build command: `npm install`
4. Add environment variables
5. Deploy

#### Option C: AWS EC2

1. Launch an EC2 instance (Ubuntu 20.04+)
2. Install Node.js and MongoDB
3. Clone your repository
4. Install dependencies
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

### 4. Production Configuration

#### PM2 Configuration
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'artisan-backend',
      script: 'server/index.js',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/artisancraft`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Security Considerations

#### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Rotate secrets regularly
- Use environment-specific configurations

#### Database Security
- Enable MongoDB authentication
- Use strong passwords
- Whitelist only necessary IP addresses
- Enable SSL/TLS connections

#### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use CORS properly

### 6. Monitoring and Logging

#### Application Monitoring
- Set up error tracking (Sentry, Bugsnag)
- Monitor performance metrics
- Set up uptime monitoring
- Configure log aggregation

#### Database Monitoring
- Monitor database performance
- Set up backup schedules
- Monitor disk usage
- Track query performance

### 7. Backup Strategy

#### Database Backups
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/artisan-marketplace" --out=backup/

# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/artisan-marketplace" backup/
```

#### File Backups
- Backup uploaded images
- Store backups in multiple locations
- Test restore procedures regularly

### 8. Performance Optimization

#### Frontend Optimization
- Enable Next.js production optimizations
- Use CDN for static assets
- Implement image optimization
- Enable gzip compression

#### Backend Optimization
- Use PM2 cluster mode
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling

### 9. SSL Certificate

#### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 10. Domain Configuration

#### DNS Settings
- Point A record to your server IP
- Add CNAME for www subdomain
- Configure MX records for email (if needed)

#### Subdomain Setup
- `api.yourdomain.com` for backend API
- `www.yourdomain.com` for frontend
- `admin.yourdomain.com` for admin panel (optional)

### 11. Testing Production

#### Health Checks
- Test all API endpoints
- Verify database connections
- Check file uploads
- Test authentication flows

#### Performance Testing
- Load test with tools like Artillery
- Monitor response times
- Check memory usage
- Test concurrent users

### 12. Maintenance

#### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Node.js version
- Backup before updates

#### Monitoring
- Set up alerts for errors
- Monitor server resources
- Track user metrics
- Review logs regularly

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
- Check MongoDB URI format
- Verify network connectivity
- Check authentication credentials
- Review firewall settings

#### Build Failures
- Check Node.js version compatibility
- Clear npm cache
- Delete node_modules and reinstall
- Check for missing dependencies

#### Performance Issues
- Monitor server resources
- Check database query performance
- Review application logs
- Optimize images and assets

### Support

For additional help:
- Check the README.md file
- Review application logs
- Contact the development team
- Create an issue in the repository

## 📊 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and accessible
- [ ] SSL certificate installed
- [ ] Domain pointing to server
- [ ] All API endpoints working
- [ ] File uploads working
- [ ] Authentication working
- [ ] Email notifications working
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Performance optimized
- [ ] Security measures in place

---

**Congratulations!** Your ArtisanCraft platform is now live and ready to serve customers and artisans worldwide! 🎉
