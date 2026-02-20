# EC2 + S3 Deployment Guide (Legacy)

**Legacy/alternative:** This guide describes EC2 + S3 deployment. The **current** staging and production setup uses **Lightsail + CloudFront**; see [CloudFront + Lightsail](cloudfront-lightsail.md).

---

This guide deploys the **Dolce** stack on **one EC2 instance** (Docker Compose) and uses **S3 for Django static + media**.

It matches the current repo structure:
- **Next.js**: `frontend-next/` (SSR/ISR) — served behind Nginx
- **Django**: `backend/` — API + admin
- **Postgres**: Docker container (EBS-backed volume)
- **Nginx**: Docker container (reverse proxy + TLS termination)

You can add CloudFront later for CDN + private S3 access. This guide keeps the first deployment simple.

## Architecture (request flow)

- **Browser → Nginx (EC2 :80/:443)**
  - `/` → Next.js (`frontend-next:3000`)
  - `/api/*`, `/admin/*` → Django (`backend:8000`)
- **Django → S3**
  - `collectstatic` uploads to `s3://<bucket>/static/...`
  - uploads/media go to `s3://<bucket>/media/...`

## Which compose file to use

- **Local dev**: `docker compose -f docker-compose.dev.yml up -d`
- **Staging (kakshaonline.com)**: `docker compose -f docker-compose.stg.yml pull && up -d` (from `stg` branch)
- **Production (dolcefiore.in)**: `docker compose -f docker-compose.prod.yml pull && up -d` (from `prod` branch)

One file per environment. Stg/prod use GHCR images. For current setup, CloudFront terminates SSL; Nginx on instance is HTTP only.

## Recommended deployment method (GitHub Actions + GHCR)

Building images on small EC2 instances is slow and can fail. Use GitHub Actions to build Docker images and push them to **GHCR**, then have EC2 only **pull** and **run** them.

- Guide: [ghcr-pipeline.md](ghcr-pipeline.md)
- Key idea: **GitHub** push → Actions builds images → **EC2/Lightsail**: `docker compose pull` → `docker compose up -d` (no `--build`)

## Prerequisites checklist

- **Domain**: `yourdomain.com` and optionally `www.yourdomain.com`
- **EC2**: Ubuntu 22.04/24.04 with a public IP
- **Security group**: TCP **22** from your IP only; TCP **80/443** from 0.0.0.0/0
- **S3 bucket**: for `static/` and `media/`
- **IAM**: EC2 IAM Role with S3 permissions (preferred) or IAM User + access keys in `.env`

---

## 1) S3 setup (static + media)

### 1.1 Create bucket

- Bucket name example: `dolce-fiore-assets-prod`
- Region: same region as your infrastructure (any region works)

### 1.2 Public vs private access (choose one)

**Option A (simplest):** Public read for `/static/*` and `/media/*` — bucket policy scoped to those prefixes.

**Option B (recommended long-term):** Private bucket + CloudFront with OAC. See [cloudfront-lightsail.md](cloudfront-lightsail.md).

### 1.3 CORS (recommended)

Minimal CORS for public reads: `AllowedOrigins` = your domain(s), `AllowedMethods` = GET, HEAD.

---

## 2) IAM for S3 (recommended: EC2 role)

Create an IAM policy for the bucket (ListBucket, GetBucketLocation, GetObject, PutObject, DeleteObject, etc.). Attach to an EC2 IAM role and attach the role to your instance. With this, omit `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env`. Alternatively use an IAM user and put keys in `.env`.

---

## 3) EC2 baseline setup

SSH in, install Docker + Compose plugin (see [cloudfront-lightsail.md](cloudfront-lightsail.md) Part 2.3 for the same Docker install steps). Add user to docker group.

---

## 4) Get TLS certificates (Let's Encrypt / certbot on host)

1. Ensure DNS A records point to the EC2 IP.
2. Install certbot: `sudo apt install -y certbot`
3. Issue certs: `sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com`
4. Certs at `/etc/letsencrypt/live/yourdomain.com/` (fullchain.pem, privkey.pem). Mount into Nginx container or reference in `.env`.

---

## 5) Configure `.env` (production)

On EC2: clone repo, `cp .env.example .env`, edit. Set `DJANGO_ENV=production`, `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DB_*`, `USE_S3=True`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `NGINX_DOMAIN`, `NGINX_DOMAIN_WWW`, `NGINX_SSL_CERT_PATH`, `NGINX_SSL_KEY_PATH`. Add AWS keys if not using EC2 IAM role.

---

## 6) First production deploy

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Verify: health endpoint, admin, frontend. Logs: `docker compose -f docker-compose.prod.yml logs -f`.

---

## 7) Updating the app

```bash
cd ~/dolce
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 8) Certificate renewals

`sudo certbot renew` then `docker compose -f docker-compose.prod.yml restart nginx`.

---

## 9) Troubleshooting

- **S3 static/media not loading:** Confirm `USE_S3=True`, bucket name, region, bucket policy. Run `collectstatic --noinput`.
- **Admin CSS missing:** Check static/storage URL settings.
- **502 from Nginx:** Check `docker compose ps` and logs for nginx, backend, frontend-next.
- **Next.js images:** Ensure `frontend-next/next.config.ts` `images.remotePatterns` includes your S3 or CloudFront domain.
