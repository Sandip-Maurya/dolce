# CloudFront + Lightsail Deployment Guide

This guide deploys **Dolce Fiore** with **CloudFront** terminating SSL and **Lightsail** for the app. **Nginx on Lightsail** listens on port 80 (HTTP) and routes internally to Django and Next.js; CloudFront forwards HTTPS traffic to Lightsail:80. **S3** is used for media; CloudFront behavior for `/media/*` points to S3.

## Architecture Overview

- **CloudFront**: SSL termination; origin for the app = **Lightsail:80** (Nginx). Origin for `/media/*` = S3.
- **Lightsail**: Nginx on port 80 (HTTP only); Nginx routes `/api/`, `/admin/` to backend:8000 and everything else to frontend-next:3000. No SSL on the instance.
- **Compose**: One file per env. Staging: `docker compose -f docker-compose.stg.yml`. Production: `docker compose -f docker-compose.prod.yml`.

## Key Design Decisions

1. **No S3 for Next.js static files** - Next.js serves `/_next/static/*` directly
2. **CloudFront caches at edge** - Same performance as S3 origin
3. **S3 only for media** - User-uploaded images via Django
4. **No AWS secrets in GitHub** - Simpler CI/CD pipeline

## Environments

| Environment | Domain | CloudFront | S3 Bucket | Lightsail | Branch |
|-------------|--------|------------|-----------|-----------|--------|
| **Staging** | kakshaonline.com | dist-staging | dolce-staging-assets | dolce-staging | `stg` |
| **Production** | dolcefiore.in | dist-prod | dolce-prod-assets | dolce-prod | `prod` |

## Request Routing (CloudFront Behaviors)

| Priority | Path Pattern | Origin | Cache | Notes |
|----------|--------------|--------|-------|-------|
| 1 | `/media/*` | S3 | 1 week | User uploads |
| 2 | `/admin/*` | Lightsail:80 (Nginx) | Disabled | Django admin |
| 3 | `/api/*` | Lightsail:80 (Nginx) | Disabled | REST API |
| 4 | `/orders/*` | Lightsail:80 (Nginx) | Disabled | Authenticated |
| 5 | `/profile/*` | Lightsail:80 (Nginx) | Disabled | Authenticated |
| 6 | `/cart` | Lightsail:80 (Nginx) | Disabled | Authenticated |
| 7 | `/checkout/*` | Lightsail:80 (Nginx) | Disabled | Authenticated |
| 8 | `/login` | Lightsail:80 (Nginx) | Disabled | Auth page |
| 9 | `/signup` | Lightsail:80 (Nginx) | Disabled | Auth page |
| Default | `*` | Lightsail:80 (Nginx) | 5 min | SSR + static |

**Note**: `/_next/static/*` goes to Lightsail:3000 (default behavior). CloudFront caches these files at the edge with long TTL because they have unique hashed filenames.

## Cost Estimate

| Component | Staging | Production | Total |
|-----------|---------|------------|-------|
| Lightsail 2GB | $12/mo | $12/mo | $24/mo |
| S3 (media only) | ~$1 | ~$1 | $2/mo |
| CloudFront | ~$1-5 | ~$1-5 | $2-10/mo |
| **Total** | | | **~$28-36/mo** |

---

## Part 1: AWS Setup

### 1.1 Create S3 Bucket (Media Only)

1. Go to **S3 Console** → **Create bucket**
2. **Bucket name**: `dolce-staging-assets` (or `dolce-prod-assets`)
3. **Region**: `ap-south-1` (Mumbai)
4. **Block Public Access**: Keep **enabled**
5. Click **Create bucket**

### 1.2 Create CloudFront Origin Access Control (OAC)

1. Go to **CloudFront Console** → **Origin access** → **Origin access controls**
2. Click **Create control setting**
3. **Name**: `dolce-s3-oac`
4. **Signing behavior**: Sign requests
5. **Origin type**: S3
6. Click **Create**

### 1.3 Request SSL Certificate (ACM)

**Important**: CloudFront requires certificates in **us-east-1** region.

1. Go to **ACM Console** in **us-east-1** (N. Virginia)
2. Click **Request certificate** → **Request a public certificate**
3. **Domain names**:
   - `kakshaonline.com`
   - `*.kakshaonline.com`
4. **Validation method**: DNS validation
5. Add CNAME records to your DNS provider
6. Wait for validation (5-30 minutes)

Repeat for production: `dolcefiore.in`, `*.dolcefiore.in`

### 1.4 Create CloudFront Distribution

#### Step 1: Create with Lightsail Origin

1. Go to **CloudFront Console** → **Create distribution**
2. **Origin domain**: `YOUR_LIGHTSAIL_STATIC_IP`
3. **Protocol**: HTTP only
4. **HTTP port**: `3000`
5. **Name**: `Lightsail-NextJS-3000`

#### Step 2: Default Cache Behavior

- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache policy**: Create custom `Dolce-PublicPages-5min` (see below)
- **Origin request policy**: AllViewerExceptHostHeader

#### Step 3: Distribution Settings

- **Alternate domain names (CNAMEs)**: `kakshaonline.com`, `www.kakshaonline.com`
- **Custom SSL certificate**: Select your ACM certificate
- **Default root object**: Leave empty

#### Step 4: Add Additional Origins

After creation, go to **Origins** tab and add:

**S3 Origin (for media)**:
- **Origin domain**: `dolce-staging-assets.s3.ap-south-1.amazonaws.com`
- **Name**: `S3-media`
- **Origin access**: Origin access control → Select `dolce-s3-oac`

**Django Origin**:
- **Origin domain**: `YOUR_LIGHTSAIL_STATIC_IP`
- **Protocol**: HTTP only
- **HTTP port**: `8000`
- **Name**: `Lightsail-Django-8000`

#### Step 5: Create Cache Behaviors

Go to **Behaviors** tab and create (in order):

| Path | Origin | Cache Policy | Origin Request Policy |
|------|--------|--------------|----------------------|
| `/media/*` | S3-media | CachingOptimized | CORS-S3Origin |
| `/admin/*` | Lightsail-Django-8000 | CachingDisabled | AllViewer |
| `/api/*` | Lightsail-Django-8000 | CachingDisabled | AllViewerExceptHostHeader |
| `/orders/*` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |
| `/profile/*` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |
| `/cart` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |
| `/checkout/*` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |
| `/login` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |
| `/signup` | Lightsail-NextJS-3000 | CachingDisabled | AllViewer |

**Default** (`*`) stays as Lightsail-NextJS-3000 with 5-min cache.

#### Step 6: Update S3 Bucket Policy

Go to S3 → Bucket → Permissions → Bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dolce-staging-assets/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

### 1.5 Create Custom Cache Policy

1. Go to **CloudFront** → **Policies** → **Cache policies** → **Create**
2. **Name**: `Dolce-PublicPages-5min`
3. **TTL settings**:
   - Minimum TTL: 0
   - Maximum TTL: 300 (5 minutes)
   - Default TTL: 300
4. **Cache key settings**:
   - Headers: None
   - Query strings: All
   - Cookies: None
5. **Compression**: Enable Gzip and Brotli

---

## Part 2: Lightsail Setup

### 2.1 Create Instance

1. Go to **Lightsail Console** → **Create instance**
2. **Region**: Mumbai (ap-south-1)
3. **Platform**: Linux/Unix
4. **Blueprint**: Ubuntu 22.04 LTS
5. **Plan**: $12/month (2 GB RAM)
6. **Name**: `dolce-staging`

### 2.2 Configure Networking

1. **Static IP**: Create and attach
2. **Firewall rules**:

| Port | Source | Purpose |
|------|--------|---------|
| 22 | Your IP | SSH |
| 80 | 0.0.0.0/0 | Nginx (CloudFront origin) |

### 2.3 Install Docker

SSH into the instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y git ca-certificates curl gnupg

# Install Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

### 2.4 Clone and Configure

```bash
# Clone repository
git clone https://github.com/Sandip-Maurya/dolce.git ~/dolce
cd ~/dolce
git checkout dev

# Create environment file
cp .env.staging.example .env
nano .env
```

Key `.env` settings:

```ini
# Django
SECRET_KEY=your-secret-key
DJANGO_ENV=production
DEBUG=False
ALLOWED_HOSTS=kakshaonline.com,www.kakshaonline.com

# Database
DB_NAME=dolce_db
DB_USER=dolce_user
DB_PASSWORD=strong-password
DB_HOST=db
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://kakshaonline.com,https://www.kakshaonline.com

# CloudFront handles SSL
SECURE_SSL_REDIRECT=False

# S3 for media uploads only
USE_S3=True
AWS_STORAGE_BUCKET_NAME=dolce-staging-assets
AWS_S3_REGION_NAME=ap-south-1
AWS_S3_CUSTOM_DOMAIN=YOUR_CLOUDFRONT_DOMAIN.cloudfront.net

# Domain
NGINX_DOMAIN=kakshaonline.com
NGINX_DOMAIN_WWW=www.kakshaonline.com
```

### 2.5 Deploy

```bash
cd ~/dolce

# Pull images
docker compose -f docker-compose.stg.yml pull

# Start services
docker compose -f docker-compose.stg.yml up -d

# Verify
docker compose ps
curl http://localhost:3000/
curl http://localhost:8000/admin/ -I
```

### 2.6 Configure DNS

Point domain to CloudFront (NOT Lightsail):

| Record | Type | Value |
|--------|------|-------|
| `kakshaonline.com` | ALIAS/CNAME | `d1234xxx.cloudfront.net` |
| `www.kakshaonline.com` | CNAME | `d1234xxx.cloudfront.net` |

---

## Part 3: CI/CD Pipeline

### 3.1 How It Works

```
Developer pushes to dev/prod branch
         │
         ▼
GitHub Actions (automatic)
  └── Build Docker images
  └── Push to GHCR (ghcr.io/sandip-maurya/dolce-*)
         │
         ▼
SSH to Lightsail (manual)
  └── docker compose pull
  └── docker compose up -d
         │
         ▼
Live on CloudFront!
```

### 3.2 No AWS Secrets Required

The simplified workflow only needs `GITHUB_TOKEN` (automatic).

**What happens:**
- ✅ Docker images built and pushed to GHCR
- ✅ Next.js static files included in Docker image
- ✅ Django uploads media to S3 using `.env` credentials on Lightsail

### 3.3 Deployment Commands

**Staging:**
```bash
cd ~/dolce && git pull origin stg
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
```

**Production:**
```bash
cd ~/dolce && git pull origin prod
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Or use the scripts:
```bash
./scripts/deploy-cloudfront-staging.sh
./scripts/deploy-cloudfront-prod.sh
```

---

## Part 4: Maintenance

### View Logs

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend-next
```

### Database Backup

```bash
docker compose exec db pg_dump -U dolce_user dolce_db > backup_$(date +%Y%m%d).sql
```

### Django Commands

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py collectstatic --noinput
```

### Resource Monitoring

```bash
docker stats
free -m
df -h
```

---

## Part 5: Troubleshooting

### CloudFront 502/504

```bash
# Check services running
docker compose ps

# Test locally
curl http://localhost:3000/
curl http://localhost:8000/admin/ -I

# Check Lightsail firewall allows 80 (Nginx)
```

### Media Files Not Loading

- Check S3 bucket policy has CloudFront OAC access
- Check `USE_S3=True` in `.env`
- Check `AWS_S3_CUSTOM_DOMAIN` points to CloudFront

### Admin CSRF Issues

Add to Django settings:
```python
CSRF_TRUSTED_ORIGINS = ['https://kakshaonline.com', 'https://www.kakshaonline.com']
```

### Container Memory Issues

```bash
docker stats --no-stream
docker compose logs | grep -i "killed\|oom"
```

---

## Quick Reference

### Compose Command

```bash
# Staging
docker compose -f docker-compose.stg.yml [command]

# Production
docker compose -f docker-compose.prod.yml [command]
```

### URLs

| Environment | Site | Admin |
|-------------|------|-------|
| Staging | https://kakshaonline.com | https://kakshaonline.com/admin |
| Production | https://dolcefiore.in | https://dolcefiore.in/admin |

### Services

| Service | Port | Purpose |
|---------|------|---------|
| db | 5432 | PostgreSQL |
| backend | 8000 | Django API + Admin |
| frontend-next | 3000 | Next.js SSR + Static |
