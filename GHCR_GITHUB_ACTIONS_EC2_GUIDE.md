# GHCR + GitHub Actions Deployment Guide

This guide explains how to deploy Dolce Fiore to EC2 using pre-built Docker images from GitHub Container Registry (GHCR), built automatically via GitHub Actions.

## Overview

Instead of building Docker images on your EC2 instance (which can be slow or fail due to limited resources), this approach:

1. **Builds images in GitHub Actions** when you push to the `stg` or `prod` branch
2. **Pushes images to GHCR** (tags `:stg` and `:prod`; no auth needed on instance)
3. **On Lightsail/EC2**: `docker compose -f docker-compose.stg.yml pull && up -d` (or `docker-compose.prod.yml`)

This solves the "Next.js build hangs on EC2" problem and makes deployments faster and more reliable.

---

## Prerequisites

### GitHub Repository

- Repository must be on GitHub (this guide assumes `Sandip-Maurya/dolce`)
- GitHub Actions must be enabled (enabled by default for public repos)
- The workflow uses `GITHUB_TOKEN` automatically (no secrets needed for public images)

### EC2 Instance

- Docker and Docker Compose installed
- Git access to your repository
- `.env` file configured with your production settings
- SSL certificates set up (if using HTTPS)

---

## How It Works

### Image Naming and Tags

Images are built and tagged as:

- **Backend**: `ghcr.io/sandip-maurya/dolce-backend:stg`, `:prod`, and `:sha-<COMMIT_SHA>`
- **Frontend**: `ghcr.io/sandip-maurya/dolce-frontend-next:stg`, `:prod`, and `:sha-<COMMIT_SHA>`

The `:stg` tag is built from the `stg` branch; `:prod` from the `prod` branch. Use a single compose file per env: `docker-compose.stg.yml` or `docker-compose.prod.yml`.

### Workflow Trigger

The GitHub Actions workflow (`.github/workflows/ghcr-images.yml`) triggers on:

- **Push to `stg` or `prod`** (when backend/frontend or compose files change)
- **Manual trigger** via GitHub Actions UI (`workflow_dispatch`)

---

## Initial Setup

### 1. Verify Workflow File

Ensure `.github/workflows/ghcr-images.yml` exists in your repository. It should:

- Build both backend and frontend images
- Push to `ghcr.io/sandip-maurya/dolce-backend` and `ghcr.io/sandip-maurya/dolce-frontend-next`
- Tag with `:stg` (from stg branch) or `:prod` (from prod branch) and `:sha-<COMMIT_SHA>`

### 2. Trigger First Build

Push a commit to the `stg` branch (or `prod`), or manually trigger the workflow. Check the Actions tab to verify the build completes.

### 3. Verify Images on GHCR

Visit the package pages; you should see `stg` and `prod` tags (and `sha-<COMMIT_SHA>`).

---

## EC2 Deployment

### First-Time Setup on EC2

1. **Clone/Pull the repository** (if not already done):

```bash
cd ~/dolce  # or wherever you keep the repo
git pull origin stg
```

2. **Ensure `.env` file exists** (set values based on your environment):

```bash
# Copy from .env.example if needed
cp .env.example .env
# Edit .env with your production values
nano .env
```

Minimum `.env` variables you typically need:
- `SECRET_KEY`
- `ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`
- `CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `NGINX_DOMAIN`, `NGINX_DOMAIN_WWW`
- `NGINX_SSL_CERT_PATH`, `NGINX_SSL_KEY_PATH`

Environment selection:
- **Production**: `DJANGO_ENV=production`, `DEBUG=False`
- **Dev on EC2 (staging)**: `DJANGO_ENV=development`, `DEBUG=True`

### Pick the right compose command (production vs dev/staging)

#### Option A: Dev/Staging on EC2 with HTTPS (what you’re currently using)

Use:

```bash
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
```

Important:
- Use a single compose file: `docker-compose.stg.yml` or `docker-compose.prod.yml` (no stacking).

#### Option B: Production on EC2 with HTTPS (recommended for real production)

Use this instead:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

5. **Verify deployment**:

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f backend frontend-next nginx

# Test health endpoint
curl https://yourdomain.com/health
```

---

## Updating the Application

### Standard Update Flow

1. **Push changes to `dev` branch** (triggers GitHub Actions build):

```bash
git add .
git commit -m "Your changes"
git push origin stg
```

2. **Wait for GitHub Actions to complete** (check Actions tab, usually 5-10 minutes)

3. **On EC2, pull and restart** (choose the matching compose command you used above):

```bash
cd ~/dolce
git pull origin stg

# Dev/staging on EC2 with HTTPS
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d

# Production on EC2 with HTTPS
# docker compose -f docker-compose.prod.yml pull
# docker compose -f docker-compose.prod.yml up -d
```

### Quick Update Script

Create `scripts/deploy-ghcr.sh` on EC2:

```bash
#!/bin/bash
set -e
cd ~/dolce
git pull origin stg
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
echo "Deployment complete!"
```

Make it executable and run:

```bash
chmod +x scripts/deploy-ghcr.sh
./scripts/deploy-ghcr.sh
```

---

## Rollback Strategy

If a deployment has issues, you can rollback to a previous image using the SHA tag.

### Option 1: Pin to Specific SHA in Compose

1. **Find the previous working commit SHA** (from GitHub Actions history or git log)

2. **For staging**, use `docker-compose.stg.yml` (images tagged `:stg`). For production, use `docker-compose.prod.yml` (images tagged `:prod`). No separate ghcr override file.

```yaml
services:
  backend:
    image: ghcr.io/sandip-maurya/dolce-backend:sha-<PREVIOUS_SHA>
    build: null

  frontend-next:
    image: ghcr.io/sandip-maurya/dolce-frontend-next:sha-<PREVIOUS_SHA>
    build: null
```

3. **Pull and restart**:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

4. **Revert the compose file** after fixing the issue.

### Option 2: Revert Git Commit and Rebuild

```bash
# On your local machine or in GitHub
git revert <BAD_COMMIT_SHA>
git push origin stg
# Wait for Actions to rebuild, then pull on EC2
```

---

## Troubleshooting

### Images Not Found on GHCR

**Problem**: `docker compose pull` fails with "manifest not found"

**Solutions**:
- Check GitHub Actions completed successfully (Actions tab)
- Verify image names in `docker-compose.stg.yml` / `docker-compose.prod.yml` match `.github/workflows/ghcr-images.yml` (tags `:stg` and `:prod`)
- Wait a few minutes after Actions completes (GHCR propagation delay)

### Compose Still Trying to Build

**Problem**: `docker compose up` still builds images locally

**Solutions**:
- Use a single file: `docker compose -f docker-compose.stg.yml` or `-f docker-compose.prod.yml`. Stg/prod compose files use GHCR images (no local build).
- Check that `image:` is set (not just `build:` removed)

### Backend Environment Variables Missing

**Problem**: Django errors about missing `SECRET_KEY` or database connection

**Solutions**:
- Verify `.env` file exists on EC2 and contains all required variables
- Check `.env` file permissions: `chmod 600 .env`
- Ensure `env_file: - .env` is in your compose file (docker-compose.stg.yml / docker-compose.prod.yml)
- Restart containers after updating `.env`: `docker compose restart backend`

### Next.js Can't Connect to Backend

**Problem**: Frontend shows API errors or 502

**Solutions**:
- Verify `BACKEND_URL=http://backend:8000` in the frontend service in docker-compose.stg.yml / docker-compose.prod.yml
- Check backend container is running: `docker compose ps backend`
- Check backend logs: `docker compose logs backend`
- Verify network connectivity: `docker compose exec frontend-next ping backend`

### Nginx Domain/Certificate Issues

**Problem**: Nginx fails to start or SSL errors

**Solutions**:
- Verify `NGINX_DOMAIN` and `NGINX_DOMAIN_WWW` in `.env`
- Check SSL certificate paths exist: `ls -la /etc/letsencrypt/live/yourdomain.com/`
- Verify certificate paths in `.env` match actual locations
- Check nginx logs: `docker compose logs nginx`
- Test nginx config: `docker compose exec nginx nginx -t`

### GitHub Actions Build Fails

**Problem**: Workflow fails with build errors

**Solutions**:
- Check Actions logs for specific error (usually in "Build and push" step)
- Verify `backend/Dockerfile` and `frontend-next/Dockerfile` are correct
- Check for dependency issues (requirements.txt, package.json)
- Ensure build context paths are correct in workflow file
- Try manual trigger to see full logs

---

## Comparison: GHCR vs Local Build

| Aspect | GHCR (This Method) | Local Build (Old Method) |
|--------|-------------------|-------------------------|
| **Build Location** | GitHub Actions (powerful runners) | EC2 instance (limited resources) |
| **Build Time** | 5-10 minutes | 15-30+ minutes (or fails) |
| **Reliability** | High (consistent environment) | Low (OOM, disk space issues) |
| **EC2 Resource Usage** | Minimal (just pull + run) | High (CPU/RAM/disk during build) |
| **Rollback** | Easy (pin to SHA tag) | Requires rebuilding old commit |
| **CI/CD Integration** | Built-in (Actions) | Manual (SSH + commands) |

---

## Next Steps

Once this method is working reliably:

1. **Update deployment scripts** (`scripts/deploy-prod.sh`) to use GHCR method
2. **Consider production branch** (build from `prod` branch instead of `dev`)
3. **Add staging environment** (separate GHCR tags for staging)
4. **Update main documentation** (`DEPLOYMENT_EC2_S3.md`) to reference this guide

---

## Additional Resources

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose Override Files](https://docs.docker.com/compose/extends/)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
