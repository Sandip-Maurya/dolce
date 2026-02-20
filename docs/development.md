# Development

## Local setup (Docker, recommended)

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

3. **Minimum required variables for local development**
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
   Nginx domain variables (`NGINX_DOMAIN`, etc.) are NOT needed for local development.

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

### Access points

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8080/api/
- **Admin panel:** http://localhost:8080/admin/
- **Database:** localhost:5432 (exposed for local tools)

### Local development features

- **Hot reload:** Backend and frontend support live reloading
- **Source code mounting:** Code changes reflect immediately
- **Debug mode:** Full Django debug toolbar and error pages
- **No SSL:** HTTP only for simplicity
- **Database access:** PostgreSQL port exposed for local database tools

---

## Running without Docker

### Backend (Python)

Prerequisites: Python 3.11+, [uv](https://docs.astral.sh/uv/) package manager.

```bash
cd backend
uv sync
# Set SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, DB_* in .env or environment
uv run python manage.py migrate
uv run python manage.py createsuperuser   # optional
uv run python manage.py load_mock_products # optional
uv run python manage.py runserver
```

API at http://localhost:8000. Swagger UI: http://localhost:8000/api/docs/

### Frontend (Next.js)

```bash
cd frontend-next
npm install
npm run dev
```

Frontend at http://localhost:3000. Set `NEXT_PUBLIC_API_URL` (or equivalent) to point to the backend if needed.

---

## Branch workflow

See [architecture.md](architecture.md#branch-strategy) for main → stg → prod. Promote via PR; then on the server use the matching compose file (stg or prod) to pull and up.

---

## Useful commands

### Docker Compose

```bash
# View logs
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend-next
docker compose -f docker-compose.dev.yml logs -f nginx
docker compose -f docker-compose.dev.yml logs -f db

# Stop / restart
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml down -v   # ⚠️ deletes database
docker compose -f docker-compose.dev.yml restart backend

# Execute in container
docker compose -f docker-compose.dev.yml exec backend python manage.py shell
docker compose -f docker-compose.dev.yml exec backend bash
docker compose -f docker-compose.dev.yml exec nginx sh
docker compose -f docker-compose.dev.yml ps
```

### Django

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput
docker compose -f docker-compose.dev.yml exec backend python manage.py load_mock_products
```

### Database

```bash
docker compose -f docker-compose.dev.yml exec db psql -U dolce_user -d dolce_db
docker compose -f docker-compose.dev.yml exec db pg_dump -U dolce_user dolce_db > backup.sql
```

### Nginx

```bash
docker compose -f docker-compose.dev.yml exec nginx nginx -t
docker compose -f docker-compose.dev.yml exec nginx nginx -s reload
```
