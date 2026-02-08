# CloudFront + Lightsail Deployment Guide

This guide deploys **Dolce Fiore** using **AWS CloudFront** as the entry point with **Lightsail** for compute and **S3** for static assets.

## Architecture Overview

```
                                    ┌─────────────────────────────────────┐
                                    │           CloudFront                │
                                    │    (Single Entry Point / CDN)       │
                                    └──────────────┬──────────────────────┘
                                                   │
                     ┌─────────────────────────────┼─────────────────────────────┐
                     │                             │                             │
                     ▼                             ▼                             ▼
        ┌────────────────────┐      ┌─────────────────────────┐
        │   S3 Origin        │      │   Lightsail Instance    │
        │  (Static Assets)   │      │       (2GB RAM)         │
        │                    │      │                         │
        │ • /_next/static/*  │      │  ┌─────────────────┐   │
        │ • /static/*        │      │  │   PostgreSQL    │   │
        │ • /media/*         │      │  │   :5432         │   │
        │                    │      │  └─────────────────┘   │
        │ Aggressive caching │      │  ┌─────────────────┐   │
        │ (1 year hashed)    │      │  │   Django API    │   │
        └────────────────────┘      │  │   :8000 ←───────────── CloudFront /admin/*, /api/*
                                    │  └─────────────────┘   │
                                    │  ┌─────────────────┐   │
                                    │  │   Next.js SSR   │   │
                                    │  │   :3000 ←───────────── CloudFront /* (default)
                                    │  └─────────────────┘   │
                                    └─────────────────────────┘

No Nginx! CloudFront routes directly to services on different ports.
```

## Environments

| Environment | Domain | CloudFront | S3 Bucket | Lightsail | Git Branch |
|-------------|--------|------------|-----------|-----------|------------|
| **Staging** | kakshaonline.com | dist-staging | dolce-staging-assets | dolce-staging | `dev` |
| **Production** | dolcefiore.in | dist-prod | dolce-prod-assets | dolce-prod | `prod` |

## Request Flow

1. **User Request** → CloudFront (CDN edge location)
2. **CloudFront** evaluates cache behaviors and routes to origin:

| Path Pattern | Origin | Port | Cache |
|--------------|--------|------|-------|
| `/_next/static/*` | S3 | - | 1 year (immutable) |
| `/static/*` | S3 | - | 1 year |
| `/media/*` | S3 | - | 1 week |
| `/admin/*` | Lightsail | 8000 | Disabled |
| `/api/*` | Lightsail | 8000 | Disabled |
| `/orders/*` | Lightsail | 3000 | Disabled |
| `/profile/*` | Lightsail | 3000 | Disabled |
| `/cart`, `/checkout/*` | Lightsail | 3000 | Disabled |
| `/*` (default) | Lightsail | 3000 | 5 min (public pages) |

## Cost Estimate (Early Stage)

| Component | Staging | Production | Total |
|-----------|---------|------------|-------|
| Lightsail 2GB | $12/mo | $12/mo | $24/mo |
| S3 (minimal) | ~$1 | ~$1 | $2/mo |
| CloudFront | ~$1-5 | ~$1-5 | $2-10/mo |
| **Total** | | | **~$28-36/mo** |

## Resource Allocation (2GB Instance, No Nginx)

| Service | Memory Limit | Memory Reserved | CPU Limit |
|---------|-------------|-----------------|-----------|
| PostgreSQL | 512 MB | 256 MB | 0.5 |
| Django | 640 MB | 320 MB | 0.6 |
| Next.js | 768 MB | 384 MB | 0.75 |
| **Total** | ~1.9 GB | ~960 MB | - |

*~100MB headroom for OS and Docker overhead*

---

## Part 1: AWS Setup

### 1.1 Create S3 Buckets

Create two S3 buckets for staging and production static assets.

#### Staging Bucket: `dolce-staging-assets`

1. Go to **S3 Console** → **Create bucket**
2. **Bucket name**: `dolce-staging-assets`
3. **Region**: `ap-south-1` (Mumbai) or your preferred region
4. **Block Public Access**: Keep **enabled** (CloudFront will access via OAC)
5. **Versioning**: Optional (recommended for production)
6. Click **Create bucket**

#### Production Bucket: `dolce-prod-assets`

Repeat the same steps with bucket name `dolce-prod-assets`.

#### Bucket Folder Structure

Both buckets will have this structure (created automatically by CI/CD):

```
dolce-staging-assets/
├── _next/
│   └── static/        # Next.js build assets (JS/CSS chunks)
├── static/            # Django collectstatic files
└── media/             # Uploaded images/files
```

### 1.2 Create CloudFront Origin Access Control (OAC)

This allows CloudFront to access private S3 buckets.

1. Go to **CloudFront Console** → **Origin access** → **Origin access controls**
2. Click **Create control setting**
3. **Name**: `dolce-s3-oac`
4. **Signing behavior**: Sign requests (recommended)
5. **Origin type**: S3
6. Click **Create**

### 1.3 Create CloudFront Distribution (Staging)

#### Step 1: Create Distribution

1. Go to **CloudFront Console** → **Create distribution**

#### Step 2: Configure S3 Origin (First Origin)

- **Origin domain**: `dolce-staging-assets.s3.ap-south-1.amazonaws.com`
- **Origin path**: Leave empty
- **Name**: `S3-static-assets`
- **Origin access**: Origin access control settings (recommended)
  - Select the OAC: `dolce-s3-oac`
- Click **Create distribution** (we'll add more origins after)

#### Step 3: Add Lightsail Origins

After the distribution is created, go to **Origins** tab and add two more origins:

**Origin 2: Next.js (Port 3000)**
- **Origin domain**: `YOUR_LIGHTSAIL_STATIC_IP`
- **Protocol**: HTTP only
- **HTTP port**: `3000`
- **Name**: `Lightsail-NextJS-3000`
- **Origin Shield**: No

**Origin 3: Django (Port 8000)**
- **Origin domain**: `YOUR_LIGHTSAIL_STATIC_IP`
- **Protocol**: HTTP only
- **HTTP port**: `8000`
- **Name**: `Lightsail-Django-8000`
- **Origin Shield**: No

#### Step 4: Configure Cache Behaviors

Go to **Behaviors** tab and create these behaviors (in order of priority):

**Behavior 1: Next.js Static Assets (S3)**
- **Path pattern**: `/_next/static/*`
- **Origin**: `S3-static-assets`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Cache policy**: CachingOptimized
- **Compress objects**: Yes

**Behavior 2: Django Static Assets (S3)**
- **Path pattern**: `/static/*`
- **Origin**: `S3-static-assets`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Cache policy**: CachingOptimized
- **Compress objects**: Yes

**Behavior 3: Media Files (S3)**
- **Path pattern**: `/media/*`
- **Origin**: `S3-static-assets`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Cache policy**: CachingOptimized
- **Compress objects**: Yes

**Behavior 4: Django Admin (No Cache)**
- **Path pattern**: `/admin/*`
- **Origin**: `Lightsail-Django-8000`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache policy**: CachingDisabled
- **Origin request policy**: AllViewer

**Behavior 5: Django API (No Cache)**
- **Path pattern**: `/api/*`
- **Origin**: `Lightsail-Django-8000`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache policy**: CachingDisabled
- **Origin request policy**: AllViewerExceptHostHeader

**Behavior 6-10: Authenticated SSR Pages (No Cache)**

Create behaviors for each authenticated path:
- `/orders/*`
- `/profile/*`
- `/cart`
- `/checkout/*`
- `/login`
- `/signup`

For each:
- **Origin**: `Lightsail-NextJS-3000`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache policy**: CachingDisabled
- **Origin request policy**: AllViewer

**Default Behavior (Public SSR Pages)**
- **Path pattern**: Default (*)
- **Origin**: `Lightsail-NextJS-3000`
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD
- **Cache policy**: Create custom (see below)
- **Origin request policy**: AllViewerExceptHostHeader

#### Step 5: Distribution Settings

- **Price class**: Use only North America and Europe (cheaper) or All edge locations
- **Alternate domain names (CNAMEs)**: `kakshaonline.com`, `www.kakshaonline.com`
- **Custom SSL certificate**: Select your ACM certificate (see section 1.4)
- **Default root object**: Leave empty
- **Standard logging**: Optional

#### Step 6: Update S3 Bucket Policy

CloudFront will show a policy to add. Go to S3 → Bucket → Permissions → Bucket policy:

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

### 1.4 Request SSL Certificate (ACM)

**Important**: CloudFront requires certificates in **us-east-1** region.

1. Go to **ACM Console** in **us-east-1** (N. Virginia)
2. Click **Request certificate** → **Request a public certificate**
3. **Domain names**:
   - `kakshaonline.com`
   - `*.kakshaonline.com` (wildcard)
4. **Validation method**: DNS validation
5. Add the CNAME records to your DNS provider
6. Wait for validation (5-30 minutes)

Repeat for production: `dolcefiore.in`, `*.dolcefiore.in`

### 1.5 Create Custom Cache Policy for Public Pages

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

### 1.6 Create Production CloudFront Distribution

Repeat steps 1.3-1.5 for production:
- S3 bucket: `dolce-prod-assets`
- Domains: `dolcefiore.in`, `www.dolcefiore.in`
- ACM certificate for `dolcefiore.in`

---

## Part 2: Lightsail Setup

### 2.1 Create Lightsail Instance (Staging)

1. Go to **Lightsail Console** → **Create instance**
2. **Instance location**: Mumbai (ap-south-1)
3. **Platform**: Linux/Unix
4. **Blueprint**: Ubuntu 22.04 LTS
5. **Instance plan**: $12/month (2 GB RAM, 1 vCPU, 60 GB SSD)
6. **Instance name**: `dolce-staging`
7. Click **Create instance**

### 2.2 Configure Networking

1. Go to instance → **Networking** tab
2. **Static IP**: Create and attach
3. **Firewall rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP only | Admin access |
| Custom | 3000 | 0.0.0.0/0 | Next.js (CloudFront) |
| Custom | 8000 | 0.0.0.0/0 | Django (CloudFront) |

**Security Note**: For production, restrict ports 3000/8000 to CloudFront IP ranges only. See [CloudFront IP ranges](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html).

### 2.3 Install Docker and Dependencies

SSH into your instance:

```bash
ssh -i ~/.ssh/LightsailDefaultKey-ap-south-1.pem ubuntu@YOUR_STATIC_IP
```

Run setup:

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

### 2.4 Clone Repository and Configure

```bash
# Clone repository
git clone https://github.com/Sandip-Maurya/dolce.git ~/dolce
cd ~/dolce

# Checkout staging branch
git checkout dev

# Create environment file
cp .env.staging.example .env
nano .env
```

### 2.5 Configure Environment Variables

Edit `.env` - key settings for CloudFront mode:

```ini
# Django
SECRET_KEY=generate-secure-key
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

# S3 Storage
USE_S3=True
AWS_STORAGE_BUCKET_NAME=dolce-staging-assets
AWS_S3_REGION_NAME=ap-south-1
AWS_S3_CUSTOM_DOMAIN=YOUR_CLOUDFRONT_DOMAIN.cloudfront.net

# CloudFront
CLOUDFRONT_DOMAIN=YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
CLOUDFRONT_MODE=true

# Domain (for reference, not used by Nginx since it's disabled)
NGINX_DOMAIN=kakshaonline.com
NGINX_DOMAIN_WWW=www.kakshaonline.com

# Revalidation
REVALIDATION_SECRET=secure-secret

# Razorpay (test keys for staging)
RAZORPAY_KEY_ID=test_key
RAZORPAY_KEY_SECRET=test_secret
```

### 2.6 Deploy Application

```bash
cd ~/dolce

# Pull images from GHCR
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml pull

# Start services (no nginx!)
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml up -d

# Check status - should show db, backend, frontend-next (NO nginx)
docker compose ps

# View logs
docker compose logs -f
```

### 2.7 Verify Services

```bash
# Test Next.js directly
curl http://localhost:3000/

# Test Django directly  
curl http://localhost:8000/api/health/
curl http://localhost:8000/admin/ -I
```

### 2.8 Configure DNS

Point your domain to CloudFront (NOT to Lightsail directly):

| Record | Type | Value |
|--------|------|-------|
| `kakshaonline.com` | ALIAS/CNAME | `d1234xxx.cloudfront.net` |
| `www.kakshaonline.com` | CNAME | `d1234xxx.cloudfront.net` |

### 2.9 Create Production Instance

Repeat steps 2.1-2.8 for production:
- Instance name: `dolce-prod`
- Branch: `prod`
- Domain: `dolcefiore.in`
- S3 bucket: `dolce-prod-assets`
- Use `docker-compose.ghcr-prod.yml` instead of `docker-compose.ghcr.yml`

---

## Part 3: GitHub Actions CI/CD

### 3.1 Workflow Overview

The workflow (`.github/workflows/ghcr-images.yml`) automatically:
1. Builds Docker images → GHCR
2. Extracts Next.js static files → S3
3. Invalidates CloudFront cache

### 3.2 GitHub Secrets Required

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret | `wJal...` |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `S3_BUCKET_STAGING` | Staging bucket | `dolce-staging-assets` |
| `S3_BUCKET_PROD` | Prod bucket | `dolce-prod-assets` |
| `CLOUDFRONT_DISTRIBUTION_STAGING` | Staging dist ID | `E1234...` |
| `CLOUDFRONT_DISTRIBUTION_PROD` | Prod dist ID | `E5678...` |

### 3.3 IAM Policy for GitHub Actions

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3Access",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::dolce-staging-assets",
                "arn:aws:s3:::dolce-staging-assets/*",
                "arn:aws:s3:::dolce-prod-assets",
                "arn:aws:s3:::dolce-prod-assets/*"
            ]
        },
        {
            "Sid": "CloudFrontInvalidation",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        }
    ]
}
```

---

## Part 4: Deployment Workflow

### 4.1 Staging Deployment

```bash
# On staging Lightsail
cd ~/dolce
git pull origin dev

docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml up -d
```

Or use the script:
```bash
./scripts/deploy-cloudfront-staging.sh
```

### 4.2 Production Deployment

```bash
# On production Lightsail
cd ~/dolce
git pull origin prod

docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr-prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr-prod.yml up -d
```

Or use the script:
```bash
./scripts/deploy-cloudfront-prod.sh
```

---

## Part 5: Maintenance

### 5.1 Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend-next
docker compose logs -f db
```

### 5.2 Database Operations

```bash
# Backup
docker compose exec db pg_dump -U dolce_user dolce_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T db psql -U dolce_user dolce_db

# Django shell
docker compose exec backend python manage.py shell
```

### 5.3 CloudFront Cache Invalidation

```bash
# Invalidate everything
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

# Invalidate specific paths
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/products/*"
```

### 5.4 Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory
free -m
```

---

## Part 6: Troubleshooting

### 6.1 CloudFront Returns 502/504

**Check services are running:**
```bash
docker compose ps
# Should show: db, backend, frontend-next (all "Up")
```

**Check ports are accessible:**
```bash
curl http://localhost:3000/
curl http://localhost:8000/admin/ -I
```

**Check Lightsail firewall** allows ports 3000 and 8000.

### 6.2 Static Assets Not Loading

**Check S3 bucket policy** includes CloudFront OAC.

**Check assets exist:**
```bash
aws s3 ls s3://dolce-staging-assets/_next/static/
```

### 6.3 API CORS Errors

**Check CORS_ALLOWED_ORIGINS** in `.env` includes your domain with `https://`.

**Check CloudFront behavior** for `/api/*` uses `AllViewerExceptHostHeader` origin request policy.

### 6.4 Admin Panel Issues

**Check Django ALLOWED_HOSTS** includes your domain.

**Check CSRF settings** - Django needs to trust CloudFront's forwarded headers:
```python
CSRF_TRUSTED_ORIGINS = ['https://kakshaonline.com', 'https://www.kakshaonline.com']
```

### 6.5 Container Memory Issues

```bash
# Check if OOM killed
docker compose logs | grep -i "killed\|oom"

# Check current usage
docker stats --no-stream
```

If memory issues persist, consider upgrading to 4GB Lightsail ($24/mo).

---

## Quick Reference

### Compose Command

```bash
# Staging
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr.yml [command]

# Production  
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.cloudfront.yml -f docker-compose.ghcr-prod.yml [command]
```

### URLs

| Environment | URL |
|-------------|-----|
| Staging | https://kakshaonline.com |
| Staging Admin | https://kakshaonline.com/admin |
| Production | https://dolcefiore.in |
| Production Admin | https://dolcefiore.in/admin |

### Services (No Nginx)

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| db | 5432 | - | PostgreSQL |
| backend | 8000 | 8000 | Django API + Admin |
| frontend-next | 3000 | 3000 | Next.js SSR |
