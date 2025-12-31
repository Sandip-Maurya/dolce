# Deployment Guide for kakshaonline.com

This branch (`kakshaonline`) is configured specifically for deployment to kakshaonline.com domain.

## Configuration Changes

### 1. Nginx Configuration (`nginx/nginx.conf`)
- Configured for `kakshaonline.com` and `www.kakshaonline.com`
- HTTP to HTTPS redirect enabled
- HTTPS server block configured with SSL certificates
- SSL certificates mounted from host Let's Encrypt directory

### 2. Docker Compose (`docker-compose.yml`)
- SSL certificates mounted from `/etc/letsencrypt/live/kakshaonline.com/`
- Certbot SSL configuration files mounted
- Nginx container configured to use host SSL certificates

### 3. Environment Variables (`.env` file)

Create a `.env` file in the project root with the following configuration:

```bash
# Django Configuration
SECRET_KEY=your-secret-key-here-change-in-production
DJANGO_ENV=production
DEBUG=False

# Domain Configuration for kakshaonline.com
ALLOWED_HOSTS=kakshaonline.com,www.kakshaonline.com
CORS_ALLOWED_ORIGINS=https://kakshaonline.com,https://www.kakshaonline.com

# Security Settings
SECURE_SSL_REDIRECT=True

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=dolce_db
DB_USER=dolce_user
DB_PASSWORD=changeme-change-in-production

# Logging
LOG_LEVEL=INFO

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@kakshaonline.com
```

## Deployment Steps on EC2

### 1. Stop Old Nginx Service
```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### 2. Verify SSL Certificates
```bash
# Check certificates exist
ls -la /etc/letsencrypt/live/kakshaonline.com/

# Ensure proper permissions
sudo chmod 644 /etc/letsencrypt/live/kakshaonline.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/kakshaonline.com/privkey.pem
sudo chmod 644 /etc/letsencrypt/options-ssl-nginx.conf
sudo chmod 644 /etc/letsencrypt/ssl-dhparams.pem
```

### 3. Check Port Availability
```bash
# Verify ports 80 and 443 are free
sudo netstat -tulpn | grep -E ':(80|443)'
```

### 4. Deploy with Docker Compose
```bash
# Navigate to project directory
cd /path/to/dolce

# Make sure you're on the kakshaonline branch
git checkout kakshaonline

# Create .env file (see above)
cp .env.example .env  # or create manually
nano .env  # Edit with your values

# Start services
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### 5. Verify Deployment
- Visit `https://kakshaonline.com` - Should load frontend
- Visit `https://kakshaonline.com/api/` - Should connect to backend
- Visit `https://kakshaonline.com/admin/` - Should load Django admin

## SSL Certificate Renewal

Since certificates are mounted from the host, Certbot renewal will work normally. However, you may want to restart the nginx container after renewal:

```bash
# After certbot renewal
docker-compose restart nginx
```

Or set up a renewal hook in `/etc/letsencrypt/renewal/kakshaonline.com.conf`:
```
post_hook = docker-compose -f /path/to/dolce/docker-compose.yml restart nginx
```

## Troubleshooting

### Port Already in Use
If ports 80/443 are still in use:
```bash
sudo lsof -i :80
sudo lsof -i :443
# Stop the process or change docker-compose port mapping
```

### SSL Certificate Errors
- Verify certificates are readable: `sudo ls -la /etc/letsencrypt/live/kakshaonline.com/`
- Check nginx logs: `docker-compose logs nginx`
- Verify volume mounts in docker-compose.yml

### CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in `.env` includes your domain with `https://` prefix
- Restart backend container: `docker-compose restart backend`

