# Architecture

## Application architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                │
│  - Routes: /api/* → Backend, /admin/* → Backend         │
│  - Serves: /static/*, /media/*                          │
│  - Frontend: All other routes → frontend-next           │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐   ┌──────▼─────┐
│ frontend-next│   │  Backend   │
│ (Next.js)    │   │  (Django)  │
│ Port 3000    │   │  Port 8000 │
└──────────────┘   └──────┬─────┘
                          │
                   ┌──────▼──────┐
                   │  PostgreSQL  │
                   │  Port 5432   │
                   └─────────────┘
```

## Technology stack

### Backend

- Django 5.0+
- Django REST Framework
- PostgreSQL
- Gunicorn
- Python 3.11+

### Frontend

- Next.js (React)
- TypeScript
- Tailwind CSS
- Zustand (state management)

### Infrastructure

- Docker & Docker Compose
- Nginx (reverse proxy)
- PostgreSQL (database)

## Backend structure

```
backend/
├── apps/
│   ├── users/       # User authentication
│   ├── products/    # Product catalog
│   ├── cart/        # Shopping cart
│   ├── orders/      # Order management
│   ├── payments/    # Payment processing
│   └── content/     # Content management (home page, About Us)
├── config/          # Django project settings
├── manage.py
└── requirements.txt
```

## Docker Compose

One **self-contained** compose file per environment (no base stacking):

- **`docker-compose.dev.yml`** — Dev on local machine. HTTP, port 8080. Usage: `docker compose -f docker-compose.dev.yml up -d`
- **`docker-compose.stg.yml`** — Staging on Lightsail (kakshaonline.com). CloudFront terminates SSL; Nginx HTTP internal routing. Usage: `docker compose -f docker-compose.stg.yml pull && docker compose -f docker-compose.stg.yml up -d`
- **`docker-compose.prod.yml`** — Production on Lightsail (dolcefiore.in). Same architecture as stg. Usage: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`

## Branch strategy

Three-branch workflow: **main** → **stg** → **prod**. Stg and prod are protected; promotion via PR only.

### 1. main branch (default)

- Primary development branch. Work happens here (local/dev).
- No automatic deployments. Clone and run `docker compose -f docker-compose.dev.yml up -d` for local dev.

### 2. stg branch (staging)

- Staging environment (kakshaonline.com on Lightsail).
- Promoted from `main` via PR (or merge) when ready for testing.
- Pushes trigger GHCR image build with tag `:stg` and **automatic CD**: the pipeline SSHs to Lightsail and runs `git pull`, `docker compose pull`, and `up -d`. No manual deploy needed.

### 3. prod branch (production)

- Production (dolcefiore.in on Lightsail).
- Promoted from `stg` via PR after approval.
- Pushes trigger GHCR image build with tag `:prod`. Deploy with `docker compose -f docker-compose.prod.yml pull && up -d`.

### Branch promotion

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
