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
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
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

4. **Set up SSL certificates (for production)**
   ```bash
   # Using Let's Encrypt with Certbot
   certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   
   # Copy certificates to nginx/ssl/
   mkdir -p nginx/ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   ```

5. **Update nginx configuration**
   - Edit `nginx/nginx.conf` and uncomment the HTTPS server block
   - Update `server_name` with your domain

### Development Server Deployment

```bash
# On the dev server - clone dev branch directly
git clone -b dev https://github.com/Sandip-Maurya/dolce.git
cd dolce

# Or if already cloned, switch to dev branch
git checkout dev
git pull origin dev

# Deploy
./scripts/deploy-dev.sh
```

### Production Server Deployment

```bash
# On the production server - clone prod branch directly
git clone -b prod https://github.com/Sandip-Maurya/dolce.git
cd dolce

# Or if already cloned, switch to prod branch
git checkout prod
git pull origin prod

# Deploy
./scripts/deploy-prod.sh
```

### Manual Deployment (Alternative)

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DJANGO_ENV`: Set to `production` for production, `development` for dev
- `DEBUG`: `False` in production, `True` in development
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database credentials
- `CORS_ALLOWED_ORIGINS`: Frontend URL(s) for CORS

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

If port 80 or 8080 is already in use, modify the port mappings in `docker-compose.dev.yml` or `docker-compose.prod.yml`.

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

