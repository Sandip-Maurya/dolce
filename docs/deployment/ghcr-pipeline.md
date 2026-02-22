# GHCR + GitHub Actions deployment

Used with [CloudFront + Lightsail](cloudfront-lightsail.md): images are built by GitHub Actions and run on Lightsail.

Instead of building Docker images on your Lightsail instance (which can be slow or fail due to limited resources), this approach:

1. **Builds images in GitHub Actions** when you push to the `stg` or `prod` branch
2. **Pushes images to GHCR** (tags `:stg` and `:prod`; no auth needed on instance)
3. **Staging (stg):** Push to `stg` triggers **automatic CD** — the workflow SSHs to Lightsail and runs `git pull`, `docker compose pull`, and `up -d`
4. **Production (prod):** Images are built and pushed; you **deploy manually** (SSH to Lightsail and run the same compose commands)

This solves the "Next.js build hangs on small instances" problem and makes deployments faster and more reliable.

---

## Prerequisites

### GitHub Repository

- Repository must be on GitHub (this guide assumes `Sandip-Maurya/dolce`)
- GitHub Actions must be enabled (enabled by default for public repos)
- The workflow uses `GITHUB_TOKEN` automatically (no secrets needed for public images)
- **For staging CD:** Add repository secrets `STG_SSH_PRIVATE_KEY` and `STG_LIGHTSAIL_HOST` (see [GitHub Secrets for staging CD](#github-secrets-for-staging-cd))

### Lightsail instance

- Docker and Docker Compose installed
- Git access to your repository
- `.env` file configured with your production settings
- SSL is terminated at CloudFront (no certbot on instance)
- **For staging CD:** SSH public key for GitHub Actions must be in `~/.ssh/authorized_keys` on the staging instance

---

## How it works

### Image naming and tags

Images are built and tagged as:

- **Backend**: `ghcr.io/sandip-maurya/dolce-backend:stg`, `:prod`, and `:sha-<COMMIT_SHA>`
- **Frontend**: `ghcr.io/sandip-maurya/dolce-frontend-next:stg`, `:prod`, and `:sha-<COMMIT_SHA>`

The `:stg` tag is built from the `stg` branch; `:prod` from the `prod` branch. Use a single compose file per env: `docker-compose.stg.yml` or `docker-compose.prod.yml`.

### Workflow trigger

The GitHub Actions workflow (`.github/workflows/ghcr-images.yml`) triggers on:

- **Push to `stg` or `prod`** (when backend/frontend or compose files change)
- **Manual trigger** via GitHub Actions UI (`workflow_dispatch`)

### Staging vs production

| Branch | Build & push images | Deploy to Lightsail |
|--------|---------------------|----------------------|
| **stg** | Yes | **Automatic** (SSH from Actions) |
| **prod** | Yes | Manual (you SSH and run compose) |

---

## GitHub Secrets for staging CD

To enable automatic deployment for staging, add these **repository secrets** (GitHub → Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `STG_LIGHTSAIL_HOST` | Staging Lightsail IP or hostname (e.g. `43.204.x.x` or `origin.kakshaonline.com`) |
| `STG_SSH_PRIVATE_KEY` | Full contents of the SSH private key (PEM) that can log in as `ubuntu` to the staging instance |

The matching **public key** must be on the staging instance (e.g. in `~/.ssh/authorized_keys`). Generate a dedicated deploy key with `ssh-keygen -t ed25519 -C "github-actions-stg" -f stg_deploy_key -N ""` and add the `.pub` to Lightsail.

---

## Initial setup

### 1. Verify workflow file

Ensure `.github/workflows/ghcr-images.yml` exists in your repository. It should:

- Build both backend and frontend images
- Push to `ghcr.io/sandip-maurya/dolce-backend` and `ghcr.io/sandip-maurya/dolce-frontend-next`
- Tag with `:stg` (from stg branch) or `:prod` (from prod branch) and `:sha-<COMMIT_SHA>`

### 2. Trigger first build

Push a commit to the `stg` branch (or `prod`), or manually trigger the workflow. Check the Actions tab to verify the build completes.

### 3. Verify images on GHCR

Visit the package pages; you should see `stg` and `prod` tags (and `sha-<COMMIT_SHA>`).

---

## First-time setup on Lightsail

1. **Clone/pull the repository** (if not already done):

```bash
cd ~/dolce  # or wherever you keep the repo
git pull origin stg
```

2. **Ensure `.env` file exists** (set values based on your environment):

```bash
# Copy from .env.example or .env.staging.example / .env.prod.example
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
- For stg/prod with CloudFront: no `NGINX_SSL_*` on instance; use `SECURE_SSL_REDIRECT=False`

Environment selection:
- **Production**: `DJANGO_ENV=production`, `DEBUG=False`
- **Staging**: same for production-like; or `DJANGO_ENV=development`, `DEBUG=True` if you want debug on staging

### Pick the right compose command

**Staging (kakshaonline.com):**
```bash
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
```

**Production (dolcefiore.in):**
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Use a single compose file per env (no stacking).

3. **Verify deployment**:

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f backend frontend-next nginx

# Test (replace with your domain)
curl https://yourdomain.com/health
```

---

## Updating the application

### Staging (automatic CD)

1. Merge your changes into `stg` and push:

```bash
git checkout stg
git merge main   # or your feature branch
git push origin stg
```

2. GitHub Actions will **build images**, push to GHCR, then **deploy to staging Lightsail** (SSH + `git pull` + `docker compose pull` + `up -d`). No manual SSH needed.

3. Check the **Actions** tab to confirm both `build-and-push` and `deploy-staging` jobs succeed.

### Production (manual deploy)

1. Push changes to `prod` (triggers build only):

```bash
git checkout prod
git merge stg
git push origin prod
```

2. Wait for GitHub Actions to complete (build and push images).

3. **SSH to production Lightsail** and run:

```bash
cd ~/dolce
git pull origin prod
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Manual staging deploy (if needed)

If you need to deploy staging without a new push (e.g. re-run deploy after a fix), SSH to staging Lightsail and run:

```bash
cd ~/dolce
git pull origin stg
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
```

### Quick update script (production or manual staging)

On Lightsail you can add `scripts/deploy-ghcr.sh` for a one-command deploy (useful for **production** or when re-deploying staging manually):

```bash
#!/bin/bash
set -e
cd ~/dolce
# Use stg or prod as needed
git pull origin prod
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

## Rollback strategy

If a deployment has issues, you can rollback to a previous image using the SHA tag.

### Option 1: Pin to specific SHA in compose

1. **Find the previous working commit SHA** (from GitHub Actions history or git log)

2. **Temporarily edit** `docker-compose.stg.yml` or `docker-compose.prod.yml`:

```yaml
services:
  backend:
    image: ghcr.io/sandip-maurya/dolce-backend:sha-<PREVIOUS_SHA>

  frontend-next:
    image: ghcr.io/sandip-maurya/dolce-frontend-next:sha-<PREVIOUS_SHA>
```

3. **Pull and restart**:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

4. **Revert the compose file** after fixing the issue.

### Option 2: Revert git commit and rebuild

```bash
# On your local machine or in GitHub
git revert <BAD_COMMIT_SHA>
git push origin stg
# Wait for Actions to rebuild, then pull on Lightsail
```

---

## Troubleshooting

### Images not found on GHCR

**Problem**: `docker compose pull` fails with "manifest not found"

**Solutions**:
- Check GitHub Actions completed successfully (Actions tab)
- Verify image names in `docker-compose.stg.yml` / `docker-compose.prod.yml` match `.github/workflows/ghcr-images.yml` (tags `:stg` and `:prod`)
- Wait a few minutes after Actions completes (GHCR propagation delay)

### Compose still trying to build

**Problem**: `docker compose up` still builds images locally

**Solutions**:
- Use a single file: `docker compose -f docker-compose.stg.yml` or `-f docker-compose.prod.yml`. Stg/prod compose files use GHCR images (no local build).
- Check that `image:` is set for backend and frontend-next

### Backend environment variables missing

**Problem**: Django errors about missing `SECRET_KEY` or database connection

**Solutions**:
- Verify `.env` file exists on Lightsail and contains all required variables
- Check `.env` file permissions: `chmod 600 .env`
- Ensure `env_file: - .env` is in your compose file (docker-compose.stg.yml / docker-compose.prod.yml)
- Restart containers after updating `.env`: `docker compose restart backend`

### Next.js can't connect to backend

**Problem**: Frontend shows API errors or 502

**Solutions**:
- Verify backend is reachable from frontend container (same Docker network)
- Check backend container is running: `docker compose ps backend`
- Check backend logs: `docker compose logs backend`
- Verify network: `docker compose exec frontend-next ping backend`

### Nginx / SSL

**Problem**: Nginx fails to start or SSL errors

**Solutions**:
- Stg/prod use CloudFront for SSL; Nginx on Lightsail is HTTP only. Verify `NGINX_DOMAIN` and `NGINX_DOMAIN_WWW` in `.env`.
- Test nginx config: `docker compose exec nginx nginx -t`
- Check nginx logs: `docker compose logs nginx`

### GitHub Actions build fails

**Problem**: Workflow fails with build errors

**Solutions**:
- Check Actions logs for specific error (usually in "Build and push" step)
- Verify `backend/Dockerfile` and `frontend-next/Dockerfile` are correct
- Check for dependency issues (requirements.txt, package.json)
- Ensure build context paths are correct in workflow file
- Try manual trigger to see full logs

### deploy-staging job fails (SSH or command errors)

**Problem**: `deploy-staging` job fails (e.g. "Permission denied" or "Host key verification failed")

**Solutions**:
- Ensure `STG_SSH_PRIVATE_KEY` and `STG_LIGHTSAIL_HOST` are set in GitHub repo Settings → Secrets and variables → Actions
- Verify the **public key** is in `~/.ssh/authorized_keys` on the staging Lightsail instance (user `ubuntu`)
- Confirm Lightsail firewall allows SSH (port 22) from the internet (or restrict to GitHub Actions IPs if desired)
- Test SSH from your machine: `ssh -i /path/to/private_key ubuntu@<STG_LIGHTSAIL_HOST>`
- If the job fails on `git pull` or `docker compose`, SSH to the instance and run the same commands to see the error

---

## Comparison: GHCR vs local build

| Aspect | GHCR (this method) | Local build (old method) |
|--------|--------------------|---------------------------|
| **Build location** | GitHub Actions (powerful runners) | Lightsail instance (limited resources) |
| **Build time** | 5–10 minutes | 15–30+ minutes (or fails) |
| **Reliability** | High (consistent environment) | Low (OOM, disk space issues) |
| **Instance resource usage** | Minimal (just pull + run) | High (CPU/RAM/disk during build) |
| **Rollback** | Easy (pin to SHA tag) | Requires rebuilding old commit |
| **CI/CD integration** | Built-in (Actions). **Staging:** full CD (build + auto-deploy). **Production:** build only, deploy manual | Manual (SSH + commands) |

---

## Additional resources

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose](https://docs.docker.com/compose/)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
