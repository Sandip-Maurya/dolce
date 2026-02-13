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
│   ├── nginx.dev.conf          # Dev (local) HTTP config
│   ├── nginx.origin.conf       # Stg/prod behind CloudFront (HTTP, forwards X-Forwarded-Proto)
│   ├── conf.d/                 # Additional nginx configs
│   └── ...
├── scripts/
│   ├── backup-db.sh           # Database backup (use COMPOSE_FILE; see script header)
│   └── ...
├── docker-compose.dev.yml      # Dev (local machine). Single file.
├── docker-compose.stg.yml      # Staging (Lightsail, kakshaonline.com). Single file.
├── docker-compose.prod.yml     # Production (Lightsail, dolcefiore.in). Single file.
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

### Docker Compose

One **self-contained** compose file per environment (no base stacking):

- **`docker-compose.dev.yml`** — Dev on local machine. HTTP, port 8080. Usage: `docker compose -f docker-compose.dev.yml up -d`
- **`docker-compose.stg.yml`** — Staging on Lightsail (kakshaonline.com). CloudFront terminates SSL; Nginx HTTP internal routing. Usage: `docker compose -f docker-compose.stg.yml pull && docker compose -f docker-compose.stg.yml up -d`
- **`docker-compose.prod.yml`** — Production on Lightsail (dolcefiore.in). Same architecture as stg. Usage: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`

## Branch Strategy

Three-branch workflow: **main** → **stg** → **prod**. Stg and prod are protected; promotion via PR only.

### 1. **main** branch (Default)
- Primary development branch. Work happens here (local/dev).
- No automatic deployments. Clone and run `docker compose -f docker-compose.dev.yml up -d` for local dev.

### 2. **stg** branch (Staging)
- Staging environment (kakshaonline.com on Lightsail).
- Promoted from `main` via PR when ready for testing.
- Pushes trigger GHCR image build with tag `:stg`. Deploy with `docker compose -f docker-compose.stg.yml pull && up -d`.

### 3. **prod** branch (Production)
- Production (dolcefiore.in on Lightsail).
- Promoted from `stg` via PR after approval.
- Pushes trigger GHCR image build with tag `:prod`. Deploy with `docker compose -f docker-compose.prod.yml pull && up -d`.

### Branch Promotion

```bash
# Promote main → stg (via PR, or locally)
git checkout stg
git merge main
git push origin stg

# Promote stg → prod (via PR, after approval)
git checkout prod
git merge stg
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

# 3. Start services (one file per env)
docker compose -f docker-compose.dev.yml up -d --build

# 4. Run migrations
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate

# 5. Create superuser (optional)
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# 6. Load mock data (optional)
docker compose -f docker-compose.dev.yml exec backend python manage.py load_mock_products
```

**Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api/
- Admin Panel: http://localhost:8080/admin/

## Deployment

This project supports three deployment environments: **Local**, **Development (Dev)**, and **Production (Prod)**. Each environment has specific configurations optimized for its use case.

### Docker Compose (one file per env)

- **`docker-compose.dev.yml`**: Dev (local). `docker compose -f docker-compose.dev.yml up -d`
- **`docker-compose.stg.yml`**: Staging (Lightsail, kakshaonline.com). CloudFront terminates SSL; Nginx HTTP internal routing. `docker compose -f docker-compose.stg.yml pull && up -d`
- **`docker-compose.prod.yml`**: Production (Lightsail, dolcefiore.in). Same as stg. `docker compose -f docker-compose.prod.yml pull && up -d`

No deploy scripts; run the compose commands above directly. Media on stg/prod: `/media/*` served via CloudFront → S3 (`USE_S3`, `AWS_S3_CUSTOM_DOMAIN`).

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
   docker compose -f docker-compose.dev.yml up -d --build
   ```

5. **Run database migrations**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
   ```

7. **Load mock data (optional)**
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python manage.py load_mock_products
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
docker compose -f docker-compose.dev.yml logs -f

# Restart a service
docker compose -f docker-compose.dev.yml restart backend

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database)
docker compose -f docker-compose.dev.yml down -v

# Access Django shell
docker compose -f docker-compose.dev.yml exec backend python manage.py shell

# Run Django management commands
docker compose -f docker-compose.dev.yml exec backend python manage.py [command]
```

---

## 2. Staging Deployment (Lightsail, kakshaonline.com)

Staging runs on Lightsail. **CloudFront terminates SSL**; Nginx on the instance is HTTP-only (internal routing). See `DEPLOYMENT_CLOUDFRONT_LIGHTSAIL.md` or `DEPLOYMENT_EC2_S3.md` for CloudFront and DNS setup.

### Prerequisites

- Lightsail (or EC2) instance with Docker and Docker Compose
- Domain (kakshaonline.com) pointing to **CloudFront** (not directly to Lightsail)
- CloudFront origin for app = Lightsail:80 (Nginx)
- Port 80 open on instance; port 22 for SSH

### Deployment Steps

1. **Clone the repository (stg branch)**
   ```bash
   git clone -b stg https://github.com/Sandip-Maurya/dolce.git
   cd dolce
   ```

2. **Create and configure .env** (ALLOWED_HOSTS, CORS, DB, SECRET_KEY, USE_S3, AWS_S3_CUSTOM_DOMAIN for media via CloudFront)

3. **Deploy**
   ```bash
   docker compose -f docker-compose.stg.yml pull
   docker compose -f docker-compose.stg.yml up -d
   ```

4. **Migrations and static**
   ```bash
   docker compose -f docker-compose.stg.yml exec backend python manage.py migrate
   docker compose -f docker-compose.stg.yml exec backend python manage.py collectstatic --noinput
   ```

### Updating Staging

```bash
git pull origin stg
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
# Run migrate/collectstatic if needed
```

### Monitoring

```bash
docker compose -f docker-compose.stg.yml logs -f
docker compose -f docker-compose.stg.yml ps
docker compose -f docker-compose.stg.yml exec nginx nginx -t
```

---

## 3. Production Deployment (Lightsail, dolcefiore.in)

Production runs on Lightsail. **CloudFront terminates SSL**; Nginx on the instance is HTTP-only (internal routing). See `DEPLOYMENT_CLOUDFRONT_LIGHTSAIL.md` or `DEPLOYMENT_EC2_S3.md`.

### Prerequisites

- Lightsail (or EC2) instance; Docker and Docker Compose
- Domain (dolcefiore.in) pointing to **CloudFront**
- CloudFront origin for app = Lightsail:80; port 80 and 22 open

### Deployment Steps

1. **Clone the repository (prod branch)**  
   `git clone -b prod https://github.com/Sandip-Maurya/dolce.git && cd dolce`

2. **Create and configure .env** (ALLOWED_HOSTS, CORS, DB, SECRET_KEY, DEBUG=False, USE_S3, AWS_S3_CUSTOM_DOMAIN)

3. **Deploy**  
   `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`

4. **Migrations and static**  
   `docker compose -f docker-compose.prod.yml exec backend python manage.py migrate`  
   `docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput`

### Updating Production

```bash
git pull origin prod
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Monitoring

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Backup Strategy

Set up automated database backups:

```bash
# Add to crontab (crontab -e)
# Daily backup at 2 AM (use COMPOSE_FILE for prod: COMPOSE_FILE=docker-compose.prod.yml)
0 2 * * * cd /path/to/dolce && ./scripts/backup-db.sh

# Weekly backup retention (keep last 7 days)
# The backup script handles this automatically
```

### Production Checklist

Before going live, ensure:

- [ ] `DEBUG=False` in `.env`
- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database password set
- [ ] DNS pointing to CloudFront (SSL at CloudFront)
- [ ] Instance firewall: 80, 22 open (CloudFront → origin 80)
- [ ] Database backups configured
- [ ] All environment variables set correctly
- [ ] Static files collected
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Test all endpoints (frontend, API, admin)
- [ ] Monitor logs for errors

---

## Environment Comparison

| Feature | Local (dev) | Stg (Lightsail) | Prod (Lightsail) |
|---------|-------------|-----------------|-------------------|
| **Compose file** | docker-compose.dev.yml | docker-compose.stg.yml | docker-compose.prod.yml |
| **Protocol** | HTTP | HTTPS (CloudFront) | HTTPS (CloudFront) |
| **Port** | 8080 | 80 (Nginx) | 80 (Nginx) |
| **Domain** | localhost | kakshaonline.com | dolcefiore.in |
| **SSL** | No | CloudFront | CloudFront |
| **Debug** | Enabled | Disabled | Disabled |
| **Hot Reload** | Yes | No | No |
| **DB Port Exposed** | Yes | No | No |

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

### Django/Backend Variables

| Variable | Description | Local (dev) | Stg | Prod |
|----------|-------------|-------------|-----|------|
| `SECRET_KEY` | Django secret key | Required | Required | Required (strong) |
| `DJANGO_ENV` | Environment type | `development` | `production` | `production` |
| `DEBUG` | Debug mode | `True` | `False` | `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` | kakshaonline.com, www | dolcefiore.in, www |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:8080` | https://kakshaonline.com | https://dolcefiore.in |
| `USE_S3` / `AWS_S3_CUSTOM_DOMAIN` | Media via CloudFront | Optional | Yes (stg) | Yes (prod) |

**Note**: Stg/prod use CloudFront for SSL; Nginx on Lightsail is HTTP-only. No certbot on instance.

### Generating Strong Secrets

```bash
# Generate Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate random password
openssl rand -base64 32

# Or use online tools (ensure they're secure/trusted)
```

## Nginx Config

- **`nginx/nginx.dev.conf`**: Used by dev (docker-compose.dev.yml). HTTP only, port 8080.
- **`nginx/nginx.origin.conf`**: Used by stg and prod (docker-compose.stg.yml, docker-compose.prod.yml). HTTP only; forwards `X-Forwarded-Proto` so the app sees HTTPS when behind CloudFront.

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
docker compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f nginx
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f db

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database)
docker compose -f docker-compose.dev.yml down -v

# Restart a service
docker compose -f docker-compose.dev.yml restart backend
docker compose -f docker-compose.dev.yml restart nginx

# Restart all services
docker compose -f docker-compose.dev.yml restart

# View running containers
docker compose -f docker-compose.dev.yml ps

# Check resource usage
docker stats

# Execute command in container
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend bash  # Access backend shell
docker compose -f docker-compose.dev.yml exec nginx sh      # Access nginx shell

# Rebuild services
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml build --no-cache  # Force rebuild without cache
```

### Django Management Commands

```bash
# Database migrations
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate --plan  # Preview migrations

# User management
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
docker compose -f docker-compose.dev.yml exec backend python manage.py changepassword <username>

# Static files
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput  # Non-interactive

# Django shell and utilities
docker compose -f docker-compose.dev.yml exec backend python manage.py shell
docker compose -f docker-compose.dev.yml exec backend python manage.py shell_plus  # If django-extensions installed
docker compose -f docker-compose.dev.yml exec backend python manage.py dbshell     # Database shell

# Custom management commands
docker compose -f docker-compose.dev.yml exec backend python manage.py load_mock_products
```

### Database Commands

```bash
# Access PostgreSQL shell
docker compose -f docker-compose.dev.yml exec db psql -U dolce_user -d dolce_db

# Backup database
docker compose -f docker-compose.dev.yml exec db pg_dump -U dolce_user dolce_db > backup.sql

# Restore database
docker compose -f docker-compose.dev.yml exec -T db psql -U dolce_user dolce_db < backup.sql

# Run backup script
./scripts/backup-db.sh
```

### Nginx Commands

```bash
# Test nginx configuration
docker compose -f docker-compose.dev.yml exec nginx nginx -t

# Reload nginx configuration
docker compose -f docker-compose.dev.yml exec nginx nginx -s reload

# View nginx error logs
docker compose -f docker-compose.dev.yml exec nginx tail -f /var/log/nginx/error.log

# View nginx access logs
docker compose -f docker-compose.dev.yml exec nginx tail -f /var/log/nginx/access.log
```

## Project Documentation

- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend documentation

## Troubleshooting

### Port already in use

If port 80, 443, or 8080 is already in use:
- **Local (dev)**: Port 8080 is in docker-compose.dev.yml (8080:80)
- **Dev/Prod**: Ensure ports 80 and 443 are available on your EC2 instance. You may need to stop other services using these ports.

### Database connection errors

- Ensure the database container is running: `docker compose -f docker-compose.dev.yml ps`
- Check database credentials in `.env`
- Verify `DB_HOST` is set to `db` for Docker setup

### Static files not loading

- Run `docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic`
- Check that volumes are mounted correctly in your compose file (e.g. docker-compose.dev.yml)

### CORS errors

- Verify `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL
- Check that the frontend URL matches exactly (including protocol and port)
- For HTTPS deployments, ensure the URL uses `https://` not `http://`

### Nginx not serving app / Domain not working

- Verify `NGINX_DOMAIN` and `NGINX_DOMAIN_WWW` are set in `.env` for dev/prod
- Check that SSL certificates exist at the specified paths
- Verify DNS records point to your EC2 instance IP
- Check nginx logs: `docker compose -f docker-compose.dev.yml logs nginx`
- Test nginx configuration: `docker compose -f docker-compose.dev.yml exec nginx nginx -t`

### SSL certificate issues

- Ensure certificates are valid and not expired: `sudo certbot certificates`
- For Let's Encrypt renewal, set up a cron job:
  ```bash
  # Add to crontab (crontab -e)
  # Stg/prod: SSL is at CloudFront; no certbot on instance. No cron needed for nginx restart.
  ```
- Verify certificate paths in `.env` match actual certificate locations
- **Certificate path errors**: If nginx logs show "cannot load certificate" errors:
  ```bash
  # Check where your certificates are located
  sudo ls -la /etc/letsencrypt/live/yourdomain.com/
  
  # Update .env to point to Let's Encrypt certificates (if using them)
  NGINX_SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
  NGINX_SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
  ```

### Docker exec errors

If you get "current working directory is outside of container mount namespace root" when running commands:

```bash
# Use -T flag to disable pseudo-TTY
docker compose exec -T backend python manage.py migrate

# Or explicitly set working directory
docker compose exec -w /app backend python manage.py migrate

# Or use docker compose run (creates new container)
docker compose run --rm backend python manage.py migrate
```

### Nginx container configuration errors

**Issue: "cannot create subdirectories" or "mount: not a directory"**

This happens when `nginx/nginx.conf` doesn't exist but Docker tries to mount it:
```bash
# For HTTPS deployments, create the file (will be populated by init script)
touch nginx/nginx.conf

# If it exists as a directory from a previous error, remove it first
rm -rf nginx/nginx.conf
touch nginx/nginx.conf
```

**Issue: "no 'events' section in configuration"**

This means nginx.conf is empty. For HTTPS deployments, ensure you're using the correct compose files:
```bash
# HTTP dev (uses static config, no template processing)
docker compose -f docker-compose.dev.yml up -d

# HTTPS dev (uses templates, requires init script)
docker compose -f docker-compose.stg.yml up -d
```

Use a single compose file per env: docker-compose.dev.yml, docker-compose.stg.yml, or docker-compose.prod.yml.

**Issue: Nginx container keeps restarting**

Check nginx logs for specific errors:
```bash
docker compose logs nginx --tail=50
```

Common causes:
- SSL certificates not found (see SSL certificate issues above)
- Empty or malformed nginx.conf file
- Template processing failed (check if `NGINX_DOMAIN` is set in `.env`)

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
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

#### Deploying to Dev (EC2)
```bash
git clone -b dev https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env with dev domain and SSL paths
docker compose -f docker-compose.stg.yml pull && docker compose -f docker-compose.stg.yml up -d
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput
```

#### Deploying to Prod (EC2)
```bash
git clone -b prod https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env with prod domain, SSL paths, DEBUG=False
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput
```

#### Updating Application
```bash
# Pull latest changes
git pull origin [branch]

# Rebuild and restart
docker compose -f docker-compose.stg.yml or docker-compose.prod.yml (see above)

# Run migrations if needed
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Collect static files if needed
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput
```

#### Viewing Logs
```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f nginx

# Last 100 lines
docker compose -f docker-compose.dev.yml logs --tail=100
```

#### Database Backup
```bash
# Manual backup
./scripts/backup-db.sh

# Or direct command
docker compose -f docker-compose.dev.yml exec db pg_dump -U dolce_user dolce_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Command Cheat Sheet

| Task | Command |
|------|---------|
| Start services | `docker compose -f docker-compose.dev.yml up -d` (or .stg.yml / .prod.yml) |
| Stop services | `docker compose -f docker-compose.dev.yml down` |
| View logs | `docker compose -f docker-compose.dev.yml logs -f [service]` |
| Restart service | `docker compose -f docker-compose.dev.yml restart [service]` |
| Run migrations | `docker compose -f docker-compose.dev.yml exec backend python manage.py migrate` |
| Create superuser | `docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser` |
| Collect static | `docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput` |
| Django shell | `docker compose -f docker-compose.dev.yml exec backend python manage.py shell` |
| Test nginx | `docker compose -f docker-compose.dev.yml exec nginx nginx -t` |
| View containers | `docker compose -f docker-compose.dev.yml ps` |
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

**Q: Why one compose file per environment?**  
A: One self-contained file per env (dev, stg, prod) avoids stacking multiple `-f` flags and keeps which stack runs where clear. Each file has the full service definitions for that environment.
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
A: Use the provided backup script: `./scripts/backup-db.sh` or manually: `docker compose -f docker-compose.dev.yml exec db pg_dump -U dolce_user dolce_db > backup.sql`

**Q: How do I restore from a backup?**  
A: `docker compose -f docker-compose.dev.yml exec -T db psql -U dolce_user dolce_db < backup.sql`

**Q: Can I access the database from outside Docker?**  
A: In local development, yes (port 5432 is exposed). In dev/prod, the port is not exposed for security. Use `docker compose -f docker-compose.dev.yml exec db psql` instead.

### Troubleshooting

**Q: Nginx shows "502 Bad Gateway"**  
A: Check if backend is running: `docker compose -f docker-compose.dev.yml ps`. Check backend logs: `docker-compose logs backend`. Ensure backend is listening on port 8000.

**Q: Static files not loading**  
A: Run `docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput`. Check volume mounts in docker-compose files.

**Q: Can't connect to database**  
A: Ensure database container is running and healthy: `docker compose -f docker-compose.dev.yml ps`. Check database credentials in `.env`. Verify `DB_HOST=db` in environment.

**Q: Domain not working / DNS issues**  
A: Verify DNS records point to EC2 IP. Check with `dig yourdomain.com` or `nslookup yourdomain.com`. Wait for DNS propagation (can take up to 48 hours).

**Q: Docker exec fails with "current working directory is outside of container mount namespace root"**  
A: Use the `-T` flag: `docker compose exec -T backend python manage.py migrate`. See [Docker exec errors](#docker-exec-errors) in Troubleshooting.

**Q: Nginx container shows "no 'events' section in configuration" or keeps restarting**  
A: Stg/prod use CloudFront for SSL and a single compose file (docker-compose.stg.yml or docker-compose.prod.yml). Nginx on the instance uses nginx.origin.conf (HTTP only). See [Nginx container configuration errors](#nginx-container-configuration-errors) if needed.

**Q: Nginx shows "cannot load certificate" errors**  
A: Verify SSL certificate paths in `.env` match actual certificate locations. For Let's Encrypt certificates, use: `NGINX_SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem`. See [SSL certificate issues](#ssl-certificate-issues) in Troubleshooting.

## License

[Add your license here]

## Support

For questions or issues, please contact the development team or open an issue on GitHub.

