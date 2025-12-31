# Dolce Fiore - E-commerce Platform

A full-stack e-commerce platform for handcrafted gift hampers, built with Django REST Framework and React.

## Project Structure

This is a monorepo containing both frontend and backend:

```
dolce/
├── backend/                    # Django REST Framework API
│   ├── apps/                   # Django applications
│   ├── config/                 # Django project configuration
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf              # Frontend nginx config (for built assets)
├── nginx/                      # Nginx reverse proxy configuration
│   ├── nginx.conf.template    # Production HTTPS template (with env vars)
│   ├── nginx.dev-https.conf.template  # Dev HTTPS template
│   ├── nginx.dev.conf          # Local dev HTTP config (static)
│   ├── nginx.conf              # Generated config (from template)
│   ├── conf.d/                 # Additional nginx configs
│   └── ssl/                    # SSL certificates directory
├── scripts/                    # Deployment and utility scripts
│   ├── init-nginx.sh          # Nginx template processor
│   ├── nginx-entrypoint.sh    # Nginx container entrypoint
│   ├── deploy-dev.sh          # Dev deployment script
│   ├── deploy-prod.sh         # Prod deployment script
│   └── backup-db.sh           # Database backup script
├── docker-compose.yml          # Base Docker Compose configuration
├── docker-compose.local.yml    # Local development overrides
├── docker-compose.dev.yml      # Development environment settings
├── docker-compose.dev-https.yml # Dev HTTPS/domain configuration
├── docker-compose.prod.yml     # Production environment settings
├── docker-compose.prod-https.yml # Prod HTTPS/domain configuration
├── .env.example                # Environment variables template
└── README.md
```

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                │
│  - Routes: /api/* → Backend, /admin/* → Backend         │
│  - Serves: /static/*, /media/*                          │
│  - Frontend: All other routes → Frontend                │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐         ┌──────▼─────┐
│Frontend│         │  Backend   │
│(React) │         │  (Django)  │
│        │         │            │
│ Port 80│         │  Port 8000 │
└────────┘         └──────┬─────┘
                          │
                   ┌──────▼──────┐
                   │  PostgreSQL  │
                   │  Port 5432   │
                   └─────────────┘
```

### Docker Compose Architecture

The project uses a **layered Docker Compose approach** for flexibility:

1. **Base Layer** (`docker-compose.yml`): Common services (db, backend, frontend, nginx) with default configurations
2. **Environment Layer** (`docker-compose.[local|dev|prod].yml`): Environment-specific settings (debug, workers, volumes)
3. **HTTPS Layer** (`docker-compose.[dev|prod]-https.yml`): HTTPS/domain configuration for EC2 deployments

**Benefits**:
- Reusable base configuration
- Clear separation of concerns
- Easy to add new environments
- Consistent structure across environments

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

### For All Environments
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

### For Local Development (Optional)
- **Python** 3.11+ (if running backend without Docker)
- **Node.js** 20+ (if running frontend without Docker)

### For EC2 Deployments
- **EC2 Instance** (Amazon Linux, Ubuntu, or similar)
- **Domain Name** (for dev and prod)
- **DNS Access** (to point domain to EC2 IP)
- **SSH Access** to EC2 instance

## Quick Start (Local Development)

For detailed local development setup, see the [Local Development Deployment](#1-local-development-deployment) section.

**Quick commands:**

```bash
# 1. Clone repository
git clone https://github.com/Sandip-Maurya/dolce.git
cd dolce

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Start services
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

# 4. Run migrations
docker-compose exec backend python manage.py migrate

# 5. Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# 6. Load mock data (optional)
docker-compose exec backend python manage.py load_mock_products
```

**Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api/
- Admin Panel: http://localhost:8080/admin/

## Deployment

This project supports three deployment environments: **Local**, **Development (Dev)**, and **Production (Prod)**. Each environment has specific configurations optimized for its use case.

### Docker Compose File Structure

The project uses a layered Docker Compose approach:

- **`docker-compose.yml`**: Base configuration (shared across all environments)
- **`docker-compose.local.yml`**: Local development overrides (HTTP, hot reload)
- **`docker-compose.dev.yml`**: Development environment settings (shared between local and EC2)
- **`docker-compose.dev-https.yml`**: HTTPS/domain configuration for dev EC2
- **`docker-compose.prod.yml`**: Production environment settings
- **`docker-compose.prod-https.yml`**: HTTPS/domain configuration for prod EC2

**Command Pattern**: `docker-compose -f docker-compose.yml -f [environment].yml -f [environment]-https.yml up`

---

## 1. Local Development Deployment

Local development runs on your machine with HTTP only (no SSL required). Perfect for development and testing.

### Prerequisites

- Docker and Docker Compose installed
- Git
- (Optional) Python 3.11+ and Node.js 20+ for local development without Docker

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Configure environment variables**
   
   Minimum required variables for local development:
   ```bash
   # Database
   DB_NAME=dolce_db
   DB_USER=dolce_user
   DB_PASSWORD=your_password
   DB_HOST=db
   DB_PORT=5432
   
   # Django
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DJANGO_ENV=development
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:8080
   ```
   
   **Note**: Nginx domain variables (`NGINX_DOMAIN`, etc.) are NOT needed for local development.

4. **Start the services**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. **Load mock data (optional)**
   ```bash
   docker-compose exec backend python manage.py load_mock_products
   ```

### Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8080/api/
- **Admin Panel**: http://localhost:8080/admin/
- **Database**: localhost:5432 (exposed for local tools)

### Local Development Features

- **Hot Reload**: Backend and frontend support live reloading
- **Source Code Mounting**: Code changes reflect immediately
- **Debug Mode**: Full Django debug toolbar and error pages
- **No SSL**: HTTP only for simplicity
- **Database Access**: PostgreSQL port exposed for local database tools

### Useful Local Commands

```bash
# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Access Django shell
docker-compose exec backend python manage.py shell

# Run Django management commands
docker-compose exec backend python manage.py [command]
```

---

## 2. Development Server Deployment (EC2)

Development server runs on EC2 with HTTPS and a custom domain. Used for client preview, staging, and testing before production.

### Prerequisites

- EC2 instance with Docker and Docker Compose installed
- Domain name configured (DNS pointing to EC2 instance IP)
- Ports 80 and 443 open in security group
- SSH access to EC2 instance

### One-Time Server Setup

1. **Install Docker and Docker Compose**
   ```bash
   # Amazon Linux / RHEL / CentOS
   sudo dnf update -y
   sudo dnf install docker docker-compose-plugin -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   
   # Log out and back in for group changes to take effect
   ```

2. **Configure Firewall (Security Group)**
   - Open ports 80 (HTTP) and 443 (HTTPS)
   - Open port 22 (SSH) for your IP only

3. **Set up SSL Certificates**
   ```bash
   # Install Certbot
   sudo dnf install certbot -y
   
   # Stop any running services temporarily
   # docker-compose down
   
   # Get SSL certificates from Let's Encrypt
   # Replace with your actual dev domain
   sudo certbot certonly --standalone -d dev.yourdomain.com -d www.dev.yourdomain.com
   
   # Create nginx/ssl directory
   mkdir -p nginx/ssl
   
   # Copy certificates (optional - can also mount directly from /etc/letsencrypt)
   sudo cp /etc/letsencrypt/live/dev.yourdomain.com/fullchain.pem nginx/ssl/fullchain.pem
   sudo cp /etc/letsencrypt/live/dev.yourdomain.com/privkey.pem nginx/ssl/privkey.pem
   
   # Set proper permissions
   sudo chown -R $USER:$USER nginx/ssl
   ```

4. **Set up Automatic Certificate Renewal**
   ```bash
   # Add to crontab (crontab -e)
   0 0 * * * certbot renew --quiet && docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml restart nginx
   ```

### Deployment Steps

1. **Clone the repository (dev branch)**
   ```bash
   git clone -b dev https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   ```

2. **Create and configure environment file**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

3. **Configure environment variables**
   
   Required variables for dev deployment:
   ```bash
   # Domain configuration (REQUIRED)
   NGINX_DOMAIN=dev.yourdomain.com
   NGINX_DOMAIN_WWW=www.dev.yourdomain.com
   
   # SSL certificate paths
   NGINX_SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
   NGINX_SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem
   
   # Database
   DB_NAME=dolce_db
   DB_USER=dolce_user
   DB_PASSWORD=strong_password_here
   DB_HOST=db
   DB_PORT=5432
   
   # Django
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DJANGO_ENV=development
   ALLOWED_HOSTS=dev.yourdomain.com,www.dev.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://dev.yourdomain.com,https://www.dev.yourdomain.com
   ```

4. **Deploy the application**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml up -d --build
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

### Access Points

- **Frontend**: https://dev.yourdomain.com
- **Backend API**: https://dev.yourdomain.com/api/
- **Admin Panel**: https://dev.yourdomain.com/admin/

### Development Server Features

- **HTTPS**: Full SSL/TLS encryption
- **Hot Reload**: Backend supports auto-reload (2 workers)
- **Debug Mode**: Enabled for troubleshooting
- **No Caching**: Static files served without cache headers
- **Source Mounting**: Code changes can be reflected (if volumes configured)

### Updating Development Server

```bash
# Pull latest changes
git pull origin dev

# If you see nginx/nginx.conf as modified, discard it (it's auto-generated)
git restore nginx/nginx.conf

# Rebuild and restart (nginx.conf will be regenerated automatically)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml up -d --build

# Run migrations if needed
docker-compose exec backend python manage.py migrate

# Collect static files if needed
docker-compose exec backend python manage.py collectstatic --noinput
```

**Note**: If `git status` shows `nginx/nginx.conf` as modified, this is normal. The file is auto-generated from templates and will be recreated when containers start. You can safely discard it with `git restore nginx/nginx.conf`.

### Monitoring and Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f frontend

# Check service status
docker-compose ps

# Test nginx configuration
docker-compose exec nginx nginx -t
```

---

## 3. Production Server Deployment (EC2)

Production server runs on EC2 with HTTPS, optimized for performance and security. This is your live application serving real users.

### Prerequisites

- EC2 instance with Docker and Docker Compose installed
- Production domain name configured (DNS pointing to EC2 instance IP)
- Ports 80 and 443 open in security group
- SSL certificates obtained and configured
- SSH access to EC2 instance

### One-Time Server Setup

1. **Install Docker and Docker Compose**
   ```bash
   # Amazon Linux / RHEL / CentOS
   sudo dnf update -y
   sudo dnf install docker docker-compose-plugin -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   
   # Log out and back in for group changes to take effect
   ```

2. **Configure Firewall (Security Group)**
   - Open ports 80 (HTTP) and 443 (HTTPS)
   - Open port 22 (SSH) for your IP only
   - **Do NOT** expose database port (5432) publicly

3. **Set up SSL Certificates**
   ```bash
   # Install Certbot
   sudo dnf install certbot -y
   
   # Stop any running services temporarily
   # docker-compose down
   
   # Get SSL certificates from Let's Encrypt
   # Replace with your actual production domain
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   
   # Create nginx/ssl directory
   mkdir -p nginx/ssl
   
   # Copy certificates (optional - can also mount directly from /etc/letsencrypt)
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/fullchain.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/privkey.pem
   
   # Set proper permissions
   sudo chown -R $USER:$USER nginx/ssl
   ```

4. **Set up Automatic Certificate Renewal**
   ```bash
   # Add to crontab (crontab -e)
   0 0 * * * certbot renew --quiet && docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml restart nginx
   ```

### Deployment Steps

1. **Clone the repository (prod branch)**
   ```bash
   git clone -b prod https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   ```

2. **Create and configure environment file**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

3. **Configure environment variables**
   
   Required variables for production deployment:
   ```bash
   # Domain configuration (REQUIRED)
   NGINX_DOMAIN=yourdomain.com
   NGINX_DOMAIN_WWW=www.yourdomain.com
   
   # SSL certificate paths
   NGINX_SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
   NGINX_SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem
   
   # Database
   DB_NAME=dolce_db
   DB_USER=dolce_user
   DB_PASSWORD=very_strong_password_here
   DB_HOST=db
   DB_PORT=5432
   
   # Django
   SECRET_KEY=generate-strong-secret-key-here
   DEBUG=False
   DJANGO_ENV=production
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

   **Security Notes**:
   - Use a strong, randomly generated `SECRET_KEY`
   - Use a strong database password
   - Never commit `.env` file to version control
   - `DEBUG` must be `False` in production

4. **Deploy the application**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml up -d --build
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

### Access Points

- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api/
- **Admin Panel**: https://yourdomain.com/admin/

### Production Server Features

- **HTTPS**: Full SSL/TLS encryption with HTTP to HTTPS redirect
- **Performance Optimized**: 3 Gunicorn workers, static file caching
- **Security Hardened**: Debug disabled, security headers enabled
- **No Hot Reload**: Production-ready stable configuration
- **Caching**: Static files cached for 1 year, media files for 30 days
- **Database Isolation**: Database port not exposed externally

### Updating Production Server

```bash
# Pull latest changes from prod branch
git pull origin prod

# If you see nginx/nginx.conf as modified, discard it (it's auto-generated)
git restore nginx/nginx.conf

# Rebuild and restart (zero-downtime deployment)
# nginx.conf will be regenerated automatically from templates
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml up -d --build

# Run migrations if needed
docker-compose exec backend python manage.py migrate

# Collect static files if needed
docker-compose exec backend python manage.py collectstatic --noinput

# Restart services to ensure all changes are applied
docker-compose restart
```

**Note**: If `git status` shows `nginx/nginx.conf` as modified, this is normal. The file is auto-generated from templates and will be recreated when containers start. You can safely discard it with `git restore nginx/nginx.conf`.

### Monitoring and Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f frontend

# Check service status
docker-compose ps

# Check resource usage
docker stats

# Test nginx configuration
docker-compose exec nginx nginx -t
```

### Backup Strategy

Set up automated database backups:

```bash
# Add to crontab (crontab -e)
# Daily backup at 2 AM
0 2 * * * /path/to/dolce/scripts/backup-db.sh

# Weekly backup retention (keep last 7 days)
# The backup script handles this automatically
```

### Production Checklist

Before going live, ensure:

- [ ] `DEBUG=False` in `.env`
- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database password set
- [ ] SSL certificates valid and auto-renewal configured
- [ ] DNS records pointing to EC2 instance
- [ ] Security group configured (only 80, 443, 22 open)
- [ ] Database backups configured
- [ ] All environment variables set correctly
- [ ] Static files collected
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Test all endpoints (frontend, API, admin)
- [ ] Monitor logs for errors

---

## Environment Comparison

| Feature | Local | Dev (EC2) | Prod (EC2) |
|---------|-------|-----------|------------|
| **Protocol** | HTTP | HTTPS | HTTPS |
| **Port** | 8080 | 80/443 | 80/443 |
| **Domain** | localhost | dev.yourdomain.com | yourdomain.com |
| **SSL** | No | Yes | Yes |
| **Debug** | Enabled | Enabled | Disabled |
| **Hot Reload** | Yes | Yes | No |
| **Workers** | 2 | 2 | 3 |
| **Caching** | No | No | Yes |
| **Source Mount** | Yes | Optional | No |
| **DB Port Exposed** | Yes | No | No |
| **Security Headers** | Basic | Basic | Full |

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

### Django/Backend Variables

| Variable | Description | Local | Dev | Prod |
|----------|-------------|-------|-----|------|
| `SECRET_KEY` | Django secret key | Required | Required | Required (strong) |
| `DJANGO_ENV` | Environment type | `development` | `development` | `production` |
| `DEBUG` | Debug mode | `True` | `True` | `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` | Your dev domain | Your prod domain |
| `DB_NAME` | Database name | `dolce_db` | `dolce_db` | `dolce_db` |
| `DB_USER` | Database user | `dolce_user` | `dolce_user` | `dolce_user` |
| `DB_PASSWORD` | Database password | Any | Strong | Very strong |
| `DB_HOST` | Database host | `db` | `db` | `db` |
| `DB_PORT` | Database port | `5432` | `5432` | `5432` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:8080` | `https://dev.yourdomain.com` | `https://yourdomain.com` |

### Nginx/Domain Variables (Required for dev and prod on EC2)

| Variable | Description | Default | Required For |
|----------|-------------|---------|--------------|
| `NGINX_DOMAIN` | Primary domain name | - | Dev, Prod |
| `NGINX_DOMAIN_WWW` | WWW variant | - | Dev, Prod |
| `NGINX_SSL_CERT_PATH` | SSL certificate path | `/etc/nginx/ssl/fullchain.pem` | Dev, Prod |
| `NGINX_SSL_KEY_PATH` | SSL private key path | `/etc/nginx/ssl/privkey.pem` | Dev, Prod |

**Note**: 
- For **local development**, nginx domain variables are **NOT required** (uses HTTP on localhost)
- For **dev and prod** on EC2, domain variables are **REQUIRED**

### Generating Strong Secrets

```bash
# Generate Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate random password
openssl rand -base64 32

# Or use online tools (ensure they're secure/trusted)
```

## Nginx Template System

The project uses a **template-based nginx configuration system** that automatically generates nginx configs from templates using environment variables.

### How It Works

1. **Templates**: Nginx configuration templates (`.template` files) contain placeholders like `${NGINX_DOMAIN}`
2. **Init Script**: `scripts/init-nginx.sh` processes templates and substitutes environment variables
3. **Entrypoint**: `scripts/nginx-entrypoint.sh` runs the init script before starting nginx
4. **Generated Config**: The processed config is written to `nginx/nginx.conf`

### Template Files

- **`nginx/nginx.conf.template`**: Production HTTPS template
- **`nginx/nginx.dev-https.conf.template`**: Development HTTPS template
- **`nginx/nginx.dev.conf`**: Static local development config (no template needed)

### Important: Generated Files

**`nginx/nginx.conf` is a generated file** and should NOT be committed to git. It's automatically created from templates when containers start.

- ✅ **Tracked in git**: Template files (`.template` files)
- ❌ **NOT tracked**: Generated `nginx/nginx.conf` (added to `.gitignore`)

If you see `nginx/nginx.conf` as modified in `git status`, this is normal - it's generated locally and will be regenerated on each deployment. You can safely discard it with `git restore nginx/nginx.conf`.

### Environment Variable Substitution

The init script uses `envsubst` to replace placeholders:

```bash
# Template contains:
server_name ${NGINX_DOMAIN} ${NGINX_DOMAIN_WWW};

# After processing (if NGINX_DOMAIN=kakshaonline.com):
server_name kakshaonline.com www.kakshaonline.com;
```

### Manual Template Processing

If you need to manually process a template:

```bash
# Set environment variables
export NGINX_DOMAIN=kakshaonline.com
export NGINX_DOMAIN_WWW=www.kakshaonline.com
export NGINX_SSL_CERT_PATH=/etc/nginx/ssl/fullchain.pem
export NGINX_SSL_KEY_PATH=/etc/nginx/ssl/privkey.pem

# Process template
envsubst '${NGINX_DOMAIN} ${NGINX_DOMAIN_WWW} ${NGINX_SSL_CERT_PATH} ${NGINX_SSL_KEY_PATH}' \
  < nginx/nginx.conf.template > nginx/nginx.conf
```

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

### Docker Compose Commands

```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f frontend
docker-compose logs -f db

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Restart a service
docker-compose restart backend
docker-compose restart nginx

# Restart all services
docker-compose restart

# View running containers
docker-compose ps

# Check resource usage
docker stats

# Execute command in container
docker-compose exec backend python manage.py migrate
docker-compose exec backend bash  # Access backend shell
docker-compose exec nginx sh      # Access nginx shell

# Rebuild services
docker-compose build
docker-compose build --no-cache  # Force rebuild without cache
```

### Django Management Commands

```bash
# Database migrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate --plan  # Preview migrations

# User management
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py changepassword <username>

# Static files
docker-compose exec backend python manage.py collectstatic
docker-compose exec backend python manage.py collectstatic --noinput  # Non-interactive

# Django shell and utilities
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py shell_plus  # If django-extensions installed
docker-compose exec backend python manage.py dbshell     # Database shell

# Custom management commands
docker-compose exec backend python manage.py load_mock_products
```

### Database Commands

```bash
# Access PostgreSQL shell
docker-compose exec db psql -U dolce_user -d dolce_db

# Backup database
docker-compose exec db pg_dump -U dolce_user dolce_db > backup.sql

# Restore database
docker-compose exec -T db psql -U dolce_user dolce_db < backup.sql

# Run backup script
./scripts/backup-db.sh
```

### Nginx Commands

```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# View nginx error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log

# View nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
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

### EC2 Instance Sizing

**Development Server:**
- **Minimum**: 1GB RAM, 1 vCPU, 20GB SSD
- **Recommended**: 2GB RAM, 1-2 vCPU, 30GB SSD
- **Cost**: ~$5-10/month

**Production Server:**
- **Minimum**: 2GB RAM, 2 vCPU, 30GB SSD
- **Recommended**: 4GB RAM, 2-4 vCPU, 50GB SSD
- **Cost**: ~$15-40/month

### Cloud Providers

- **AWS EC2**: Flexible, pay-as-you-go, integrated with other AWS services
- **DigitalOcean**: Simple pricing, good documentation, $5/month droplets
- **Linode**: Competitive pricing, good performance
- **Vultr**: Low-cost options, global locations
- **AWS Lightsail**: Simplified EC2, fixed pricing

### Security Recommendations

1. **Firewall Configuration**:
   - Only open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Restrict SSH (port 22) to your IP only
   - Never expose database port (5432) publicly

2. **SSH Security**:
   - Use SSH keys instead of passwords
   - Disable root login
   - Change default SSH port (optional)

3. **Regular Updates**:
   ```bash
   # Update system packages regularly
   sudo dnf update -y  # Amazon Linux / RHEL
   sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
   ```

4. **Backup Strategy**:
   - Daily database backups
   - Weekly full system snapshots
   - Test restore procedures regularly

## Security Best Practices

### Environment Variables
- **Never commit `.env` files** to version control
- Use `.env.example` as a template (without sensitive values)
- Rotate secrets regularly in production
- Use different secrets for dev and prod environments

### Application Security
- **Always set `DEBUG=False`** in production
- Use strong, randomly generated `SECRET_KEY` (minimum 50 characters)
- Use strong database passwords (minimum 16 characters, mixed case, numbers, symbols)
- Keep Django and all dependencies updated
- Regularly review and update `ALLOWED_HOSTS`

### SSL/TLS
- **Always use HTTPS** in production and dev (EC2)
- Set up automatic SSL certificate renewal
- Use strong SSL/TLS configurations (TLS 1.2+)
- Enable HTTP to HTTPS redirect

### Database Security
- Use strong database passwords
- Never expose database port publicly
- Regularly backup database
- Encrypt database backups if containing sensitive data
- Use connection pooling and limit connections

### Server Security
- Keep operating system updated
- Use firewall to restrict ports
- Use SSH keys instead of passwords
- Disable unnecessary services
- Monitor logs for suspicious activity
- Set up intrusion detection (optional)

### Code Security
- Review dependencies for vulnerabilities: `pip-audit` or `safety check`
- Use Django security middleware
- Implement rate limiting for API endpoints
- Sanitize user inputs
- Use parameterized queries (Django ORM handles this)

## Quick Reference

### Common Workflows

#### Starting Fresh (Local)
```bash
git clone https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

#### Deploying to Dev (EC2)
```bash
git clone -b dev https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env with dev domain and SSL paths
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.dev-https.yml up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

#### Deploying to Prod (EC2)
```bash
git clone -b prod https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env with prod domain, SSL paths, DEBUG=False
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

#### Updating Application
```bash
# Pull latest changes
git pull origin [branch]

# Rebuild and restart
docker-compose -f docker-compose.yml -f docker-compose.[env].yml -f docker-compose.[env]-https.yml up -d --build

# Run migrations if needed
docker-compose exec backend python manage.py migrate

# Collect static files if needed
docker-compose exec backend python manage.py collectstatic --noinput
```

#### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100
```

#### Database Backup
```bash
# Manual backup
./scripts/backup-db.sh

# Or direct command
docker-compose exec db pg_dump -U dolce_user dolce_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Command Cheat Sheet

| Task | Command |
|------|---------|
| Start services | `docker-compose -f docker-compose.yml -f docker-compose.[env].yml up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f [service]` |
| Restart service | `docker-compose restart [service]` |
| Run migrations | `docker-compose exec backend python manage.py migrate` |
| Create superuser | `docker-compose exec backend python manage.py createsuperuser` |
| Collect static | `docker-compose exec backend python manage.py collectstatic --noinput` |
| Django shell | `docker-compose exec backend python manage.py shell` |
| Test nginx | `docker-compose exec nginx nginx -t` |
| View containers | `docker-compose ps` |
| Resource usage | `docker stats` |

## Frequently Asked Questions (FAQ)

### General

**Q: Can I use the same EC2 instance for both dev and prod?**  
A: Technically yes, but it's **not recommended**. Use separate instances for better isolation, security, and to avoid conflicts.

**Q: Do I need different domains for dev and prod?**  
A: Yes, you should use different domains (e.g., `dev.yourdomain.com` and `yourdomain.com`) or subdomains to clearly separate environments.

**Q: Can I run local development without Docker?**  
A: Yes, you can run backend with Python and frontend with Node.js directly, but Docker is recommended for consistency with deployment environments.

### Docker & Deployment

**Q: Why do I need multiple docker-compose files?**  
A: The layered approach allows you to:
- Share common configuration (base file)
- Override environment-specific settings (dev/prod files)
- Add HTTPS configuration only when needed (https files)
- Maintain consistency across environments

**Q: How do I update the application?**  
A: Pull the latest code, rebuild containers, run migrations if needed, and restart services. See [Updating Application](#updating-application) section.

**Q: Why does `git status` show `nginx/nginx.conf` as modified?**  
A: `nginx/nginx.conf` is a generated file created from templates. It's not tracked in git (added to `.gitignore`). If you see it as modified, discard it with `git restore nginx/nginx.conf` - it will be automatically regenerated when containers start.

**Q: What's the difference between `docker-compose up` and `docker-compose up --build`?**  
A: `--build` forces rebuilding of images even if they exist. Use it when code changes or Dockerfiles are modified.

### SSL & Domains

**Q: How do I renew SSL certificates?**  
A: Set up automatic renewal with a cron job (see SSL setup sections). Certbot will automatically renew certificates before expiration.

**Q: Can I use self-signed certificates?**  
A: For local development, yes. For dev/prod on EC2, use Let's Encrypt (free) or commercial certificates for better security and browser trust.

**Q: What if my domain DNS isn't pointing to EC2 yet?**  
A: You can't get SSL certificates until DNS is configured. Set up DNS first, wait for propagation, then get certificates.

### Database

**Q: How do I backup the database?**  
A: Use the provided backup script: `./scripts/backup-db.sh` or manually: `docker-compose exec db pg_dump -U dolce_user dolce_db > backup.sql`

**Q: How do I restore from a backup?**  
A: `docker-compose exec -T db psql -U dolce_user dolce_db < backup.sql`

**Q: Can I access the database from outside Docker?**  
A: In local development, yes (port 5432 is exposed). In dev/prod, the port is not exposed for security. Use `docker-compose exec db psql` instead.

### Troubleshooting

**Q: Nginx shows "502 Bad Gateway"**  
A: Check if backend is running: `docker-compose ps`. Check backend logs: `docker-compose logs backend`. Ensure backend is listening on port 8000.

**Q: Static files not loading**  
A: Run `docker-compose exec backend python manage.py collectstatic --noinput`. Check volume mounts in docker-compose files.

**Q: Can't connect to database**  
A: Ensure database container is running and healthy: `docker-compose ps`. Check database credentials in `.env`. Verify `DB_HOST=db` in environment.

**Q: Domain not working / DNS issues**  
A: Verify DNS records point to EC2 IP. Check with `dig yourdomain.com` or `nslookup yourdomain.com`. Wait for DNS propagation (can take up to 48 hours).

## License

[Add your license here]

## Support

For questions or issues, please contact the development team or open an issue on GitHub.

