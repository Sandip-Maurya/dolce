# GHCR + GitHub Actions Deployment Guide

This guide explains how to deploy Dolce Fiore to EC2 using pre-built Docker images from GitHub Container Registry (GHCR), built automatically via GitHub Actions.

## Overview

Instead of building Docker images on your EC2 instance (which can be slow or fail due to limited resources), this approach:

1. **Builds images in GitHub Actions** when you push to the `dev` branch
2. **Pushes images to GHCR** (public registry, no auth needed on EC2)
3. **Pulls and runs images on EC2** using `docker compose pull`

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

- **Backend**: `ghcr.io/sandip-maurya/dolce-backend:dev` and `ghcr.io/sandip-maurya/dolce-backend:sha-<COMMIT_SHA>`
- **Frontend**: `ghcr.io/sandip-maurya/dolce-frontend-next:dev` and `ghcr.io/sandip-maurya/dolce-frontend-next:sha-<COMMIT_SHA>`

The `:dev` tag always points to the latest build from the `dev` branch. The `:sha-<COMMIT_SHA>` tags allow you to pin to a specific commit for rollbacks.

### Workflow Trigger

The GitHub Actions workflow (`.github/workflows/ghcr-images.yml`) triggers on:

- **Push to `dev` branch** (when backend/frontend code changes)
- **Manual trigger** via GitHub Actions UI (`workflow_dispatch`)

---

## Initial Setup

### 1. Verify Workflow File

Ensure `.github/workflows/ghcr-images.yml` exists in your repository. It should:

- Build both backend and frontend images
- Push to `ghcr.io/sandip-maurya/dolce-backend` and `ghcr.io/sandip-maurya/dolce-frontend-next`
- Tag with `:dev` and `:sha-<COMMIT_SHA>`

### 2. Trigger First Build

Push a commit to the `dev` branch (or manually trigger the workflow):

```bash
git push origin dev
```

Check the Actions tab in GitHub to verify the build completes successfully.

### 3. Verify Images on GHCR

Visit:
- https://github.com/Sandip-Maurya/dolce/pkgs/container/dolce-backend
- https://github.com/Sandip-Maurya/dolce/pkgs/container/dolce-frontend-next

You should see the `dev` tag and a `sha-<COMMIT_SHA>` tag.

---

## EC2 Deployment

### First-Time Setup on EC2

1. **Clone/Pull the repository** (if not already done):

```bash
cd ~/dolce  # or wherever you keep the repo
git pull origin dev
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
docker compose -f docker-compose.yml -f docker-compose.dev-https.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.dev-https.yml -f docker-compose.ghcr.yml up -d
```

Important:
- **Do not include** `docker-compose.dev.yml` in the same command.
  - `docker-compose.dev.yml` mounts `/etc/nginx/nginx.conf` read-only (local dev convenience)
  - `docker-compose.dev-https.yml` generates `/etc/nginx/nginx.conf` from a template (needs write access)

#### Option B: Production on EC2 with HTTPS (recommended for real production)

Use this instead:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml up -d
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
git push origin dev
```

2. **Wait for GitHub Actions to complete** (check Actions tab, usually 5-10 minutes)

3. **On EC2, pull and restart** (choose the matching compose command you used above):

```bash
cd ~/dolce
git pull origin dev

# Dev/staging on EC2 with HTTPS
docker compose -f docker-compose.yml -f docker-compose.dev-https.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.dev-https.yml -f docker-compose.ghcr.yml up -d

# Production on EC2 with HTTPS
# docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml pull
# docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml up -d
```

### Quick Update Script

Create `scripts/deploy-ghcr.sh` on EC2:

```bash
#!/bin/bash
set -e
cd ~/dolce
git pull origin dev
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml up -d
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

2. **Edit `docker-compose.ghcr.yml`** temporarily:

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
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml -f docker-compose.ghcr.yml up -d
```

4. **Revert the compose file** after fixing the issue.

### Option 2: Revert Git Commit and Rebuild

```bash
# On your local machine or in GitHub
git revert <BAD_COMMIT_SHA>
git push origin dev
# Wait for Actions to rebuild, then pull on EC2
```

---

## Troubleshooting

### Images Not Found on GHCR

**Problem**: `docker compose pull` fails with "manifest not found"

**Solutions**:
- Check GitHub Actions completed successfully (Actions tab)
- Verify image names match in `docker-compose.ghcr.yml` and `.github/workflows/ghcr-images.yml`
- Ensure you're using the correct branch tag (`:dev` for dev branch builds)
- Wait a few minutes after Actions completes (GHCR propagation delay)

### Compose Still Trying to Build

**Problem**: `docker compose up` still builds images locally

**Solutions**:
- Ensure `docker-compose.ghcr.yml` is included in your compose command
- Verify `build: null` is set in `docker-compose.ghcr.yml`
- Check that `image:` is set (not just `build:` removed)

### Backend Environment Variables Missing

**Problem**: Django errors about missing `SECRET_KEY` or database connection

**Solutions**:
- Verify `.env` file exists on EC2 and contains all required variables
- Check `.env` file permissions: `chmod 600 .env`
- Ensure `env_file: - .env` is in `docker-compose.yml` (it should be)
- Restart containers after updating `.env`: `docker compose restart backend`

### Next.js Can't Connect to Backend

**Problem**: Frontend shows API errors or 502

**Solutions**:
- Verify `BACKEND_URL=http://backend:8000` in `docker-compose.ghcr.yml` (should match network service name)
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
