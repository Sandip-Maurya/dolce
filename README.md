# Dolce Fiore - E-commerce Platform

A full-stack e-commerce platform for handcrafted gift hampers, built with Django REST Framework and React.

## Project Structure

This is a monorepo containing both frontend and backend:

```
dolce/
├── backend/              # Django REST Framework API
│   ├── apps/            # Django applications
│   ├── config/          # Django project configuration
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # React + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── nginx/               # Nginx reverse proxy configuration
│   ├── nginx.conf       # Production configuration
│   └── nginx.dev.conf   # Development configuration
├── scripts/             # Deployment scripts
│   ├── deploy-dev.sh
│   ├── deploy-prod.sh
│   └── backup-db.sh
├── docker-compose.yml   # Base Docker Compose configuration
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example         # Environment variables template
└── README.md
```

## Branch Strategy

This project uses a three-branch workflow:

### 1. **main** branch (Default Branch)
- Primary development branch
- Default branch on GitHub (for cloning and new contributors)
- Work happens here
- No automatic deployments
- **Note**: For deployments, always explicitly clone the target branch (`dev` or `prod`)

### 2. **dev** branch
- Staging environment
- Promoted from `main` when ready for testing
- Auto-deploys to development server
- Used for client preview and testing

### 3. **prod** branch
- Production environment
- Promoted from `dev` after client approval
- Auto-deploys to production server
- Protected branch (manual promotion only)

### Branch Promotion

```bash
# Promote main → dev
git checkout dev
git merge main
git push origin dev

# Promote dev → prod (after client approval)
git checkout prod
git merge dev
git push origin prod
```

## Technology Stack

### Backend
- Django 5.0+
- Django REST Framework
- PostgreSQL
- Gunicorn
- Python 3.11+

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- PostgreSQL (database)

## Prerequisites

- Docker and Docker Compose
- Git
- (For local development) Python 3.11+, Node.js 20+

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/Sandip-Maurya/dolce.git
cd dolce
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start services with Docker

```bash
# For local development (HTTP only, localhost:8080)
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

### 4. Run migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Create superuser (optional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 6. Load mock products (if needed)

```bash
docker-compose exec backend python manage.py load_mock_products
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api/
- Admin Panel: http://localhost:8080/admin/

## Deployment

### Server Setup (One-time)

1. **Install Docker and Docker Compose on your server**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose plugin
   apt-get update
   apt-get install docker-compose-plugin
   ```

2. **Clone the repository**
   ```bash
   # For development server - clone dev branch
   git clone -b dev https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   
   # For production server - clone prod branch
   git clone -b prod https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   
   # For local development - clone main branch (default)
   git clone https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Set up SSL certificates (for dev and prod environments)**
   
   For both dev and prod environments on EC2, you'll need SSL certificates:
   
   ```bash
   # Install Certbot (if not already installed)
   sudo dnf update -y
   sudo dnf install certbot
   
   # Stop nginx temporarily to get certificates (if nginx is running)
   # docker-compose down
   
   # Get certificates using Let's Encrypt
   # Replace with your actual domain names
   sudo certbot certonly --standalone -d kakshaonline.com -d www.kakshaonline.com  # For dev
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com          # For prod
   
   # Create nginx/ssl directory and copy certificates (optional - can also mount directly)
   mkdir -p nginx/ssl
   # For dev
   sudo cp /etc/letsencrypt/live/kakshaonline.com/fullchain.pem nginx/ssl/fullchain.pem
   sudo cp /etc/letsencrypt/live/kakshaonline.com/privkey.pem nginx/ssl/privkey.pem
   # For prod (on prod server)
   # sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/fullchain.pem
   # sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/privkey.pem
   
   # Set proper permissions
   sudo chown -R $USER:$USER nginx/ssl
   ```

5. **Configure environment variables for domain and SSL**
   
   Add the following to your `.env` file:
   ```bash
   # Domain configuration (required for dev and prod)
   NGINX_DOMAIN=kakshaonline.com
   NGINX_DOMAIN_WWW=www.kakshaonline.com
   
   # SSL certificate paths (optional - defaults shown)
   NGINX_SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
   NGINX_SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem
   
   # Or use Let's Encrypt paths directly:
   # NGINX_SSL_CERT_PATH=/etc/letsencrypt/live/kakshaonline.com/fullchain.pem
   # NGINX_SSL_KEY_PATH=/etc/letsencrypt/live/kakshaonline.com/privkey.pem
   ```
   
   **Note**: For local development, these variables are not needed as it uses HTTP on localhost.

### Development Server Deployment (EC2 with HTTPS)

```bash
# On the dev server - clone dev branch directly
git clone -b dev https://github.com/Sandip-Maurya/dolce.git
cd dolce

# Or if already cloned, switch to dev branch
git checkout dev
git pull origin dev

# Configure environment variables in .env
# Set NGINX_DOMAIN and NGINX_DOMAIN_WWW to your dev domain

# Deploy with HTTPS support
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml up -d --build

# Or use deployment script (if updated)
# ./scripts/deploy-dev.sh
```

### Production Server Deployment (EC2 with HTTPS)

```bash
# On the production server - clone prod branch directly
git clone -b prod https://github.com/Sandip-Maurya/dolce.git
cd dolce

# Or if already cloned, switch to prod branch
git checkout prod
git pull origin prod

# Configure environment variables in .env
# Set NGINX_DOMAIN and NGINX_DOMAIN_WWW to your production domain

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or use deployment script (if updated)
# ./scripts/deploy-prod.sh
```

### Manual Deployment Commands

```bash
# Local development (HTTP only, localhost:8080)
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

# Development on EC2 (HTTPS with domain)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml up -d --build

# Production on EC2 (HTTPS with domain)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

### Django/Backend Variables
- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DJANGO_ENV`: Set to `production` for production, `development` for dev
- `DEBUG`: `False` in production, `True` in development
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts (include your domain)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database credentials
- `CORS_ALLOWED_ORIGINS`: Frontend URL(s) for CORS (e.g., `https://kakshaonline.com`)

### Nginx/Domain Variables (Required for dev and prod on EC2)
- `NGINX_DOMAIN`: Primary domain name (e.g., `kakshaonline.com` or `dev.kakshaonline.com`)
- `NGINX_DOMAIN_WWW`: WWW variant (e.g., `www.kakshaonline.com` or `www.dev.kakshaonline.com`)
- `NGINX_SSL_CERT_PATH`: Path to SSL certificate (default: `/etc/nginx/ssl/fullchain.pem`)
- `NGINX_SSL_KEY_PATH`: Path to SSL private key (default: `/etc/nginx/ssl/privkey.pem`)

**Note**: For local development, nginx domain variables are not required as it uses HTTP on localhost.

## Database Backups

Create a manual backup:

```bash
./scripts/backup-db.sh
```

Backups are stored in `./backups/` directory. The script automatically keeps the last 7 days of backups.

For automated backups, set up a cron job:

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/dolce/scripts/backup-db.sh
```

## Useful Commands

### Docker Compose

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend python manage.py migrate
```

### Django Management

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Django shell
docker-compose exec backend python manage.py shell
```

## Project Documentation

- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend documentation

## Troubleshooting

### Port already in use

If port 80, 443, or 8080 is already in use:
- **Local**: Modify port mapping in `docker-compose.local.yml` (default: 8080:80)
- **Dev/Prod**: Ensure ports 80 and 443 are available on your EC2 instance. You may need to stop other services using these ports.

### Database connection errors

- Ensure the database container is running: `docker-compose ps`
- Check database credentials in `.env`
- Verify `DB_HOST` is set to `db` for Docker setup

### Static files not loading

- Run `docker-compose exec backend python manage.py collectstatic`
- Check that volumes are mounted correctly in `docker-compose.yml`

### CORS errors

- Verify `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL
- Check that the frontend URL matches exactly (including protocol and port)
- For HTTPS deployments, ensure the URL uses `https://` not `http://`

### Nginx not serving app / Domain not working

- Verify `NGINX_DOMAIN` and `NGINX_DOMAIN_WWW` are set in `.env` for dev/prod
- Check that SSL certificates exist at the specified paths
- Verify DNS records point to your EC2 instance IP
- Check nginx logs: `docker-compose logs nginx`
- Test nginx configuration: `docker-compose exec nginx nginx -t`

### SSL certificate issues

- Ensure certificates are valid and not expired: `sudo certbot certificates`
- For Let's Encrypt renewal, set up a cron job:
  ```bash
  # Add to crontab (crontab -e)
  0 0 * * * certbot renew --quiet && docker-compose restart nginx
  ```
- Verify certificate paths in `.env` match actual certificate locations

## Server Recommendations

For a solo developer setup:

- **Minimum**: 1GB RAM, 1 CPU, 25GB SSD
- **Recommended**: 2GB RAM, 1-2 CPU, 50GB SSD

Cloud providers: DigitalOcean, Linode, Vultr, AWS Lightsail

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for `SECRET_KEY` and database
- Enable HTTPS in production
- Keep dependencies updated
- Regularly backup the database
- Use firewall rules to restrict access to necessary ports only

## License

[Add your license here]

## Support

For questions or issues, please contact the development team.

