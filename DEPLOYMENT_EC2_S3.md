# EC2 + S3 Deployment Guide (Docker Compose) — Dolce

This guide deploys the **Dolce** stack on **one EC2 instance** (Docker Compose) and uses **S3 for Django static + media**.

It matches the current repo structure:
- **Next.js**: `frontend-next/` (SSR/ISR) — served behind Nginx
- **Django**: `backend/` — API + admin
- **Postgres**: Docker container (EBS-backed volume)
- **Nginx**: Docker container (reverse proxy + TLS termination)

> You can add CloudFront later for CDN + private S3 access. This guide keeps the first deployment simple.

## Architecture (request flow)

- **Browser → Nginx (EC2 :80/:443)**  
  - `/` → Next.js (`frontend-next:3000`)
  - `/api/*`, `/admin/*` → Django (`backend:8000`)
- **Django → S3**  
  - `collectstatic` uploads to `s3://<bucket>/static/...`
  - uploads/media go to `s3://<bucket>/media/...`

## Which compose files to use

- **Production** (recommended):
  - `docker-compose.yml` + `docker-compose.prod.yml` + `docker-compose.prod-https.yml`
- **Dev on EC2** (optional):
  - `docker-compose.yml` + `docker-compose.dev.yml` (+ `docker-compose.dev-https.yml` if you want HTTPS)

## Branching & promotion workflow (GitHub → EC2)

Your desired flow:

1. **Develop** on a `feature/*` branch (or directly on `main`).
2. Merge into **`main`** in GitHub.
3. Promote to **staging** by merging **`main` → `dev`**.
4. After client approval, promote to **production** by merging **`dev` → `prod`**.

How this maps to the repo’s deploy tooling:

- **Staging EC2** should deploy from the `dev` branch.
- **Production EC2** should deploy from the `prod` branch.

This matches the existing scripts:
- `scripts/deploy-dev.sh` expects you to be on **`dev`**
- `scripts/deploy-prod.sh` expects you to be on **`prod`**

> Recommendation: Keep `dev` and `prod` protected branches in GitHub, and promote only via PR merges. This makes “what is deployed” auditable.

## Prerequisites checklist

- **Domain**: `yourdomain.com` and optionally `www.yourdomain.com`
- **EC2**: Ubuntu 22.04/24.04 with a public IP
- **Security group**:
  - TCP **22** from your IP only
  - TCP **80/443** from 0.0.0.0/0
- **S3 bucket**: for `static/` and `media/`
- **IAM**:
  - **Preferred**: EC2 IAM Role with S3 permissions (no long-lived keys)
  - Or: IAM User + access keys stored in `.env`

---

## 1) S3 setup (static + media)

### 1.1 Create bucket

- Bucket name example: `dolce-fiore-assets-prod`
- Region: same region as your infrastructure (any region works)

### 1.2 Public vs private access (choose one)

**Option A (simplest): Public read for `/static/*` and `/media/*`**

This is common if your images/assets are intended to be public.

Bucket policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadStaticAndMediaOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/static/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME/media/*"
      ]
    }
  ]
}
```

Notes:
- This still keeps the bucket relatively scoped (public only under the two prefixes).
- If you use this, you must ensure “Block Public Access” does not prevent the above.

**Option B (recommended long-term): Private bucket + CloudFront**

Use CloudFront with an Origin Access Control (OAC) and keep the bucket private.
This guide doesn’t require CloudFront, but it’s a great follow-up for performance and security.

### 1.3 CORS (recommended)

Minimal CORS for public reads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

---

## 2) IAM for S3 (recommended: EC2 role)

### Option A (recommended): EC2 IAM Role (no access keys)

1. Create an IAM policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

2. Create an IAM role for EC2 and attach the policy.
3. Attach the role to your EC2 instance.

With this approach, you can omit `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env`.

### Option B: IAM user access keys

Create an IAM user (programmatic access) with the same policy and put the keys in `.env`.

---

## 3) EC2 baseline setup

SSH in:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

Install packages:

```bash
sudo apt update
sudo apt install -y git ca-certificates curl gnupg
```

Install Docker + Compose plugin:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
```

---

## 4) Get TLS certificates (Let’s Encrypt / certbot on host)

Because Nginx runs in Docker, simplest is certbot on the **host** with standalone mode.

1. Ensure DNS `A` records point to the EC2 IP:
   - `yourdomain.com` → EC2 IP
   - `www.yourdomain.com` → EC2 IP (optional)
2. Install certbot:

```bash
sudo apt install -y certbot
```

3. Issue certs:

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Certs will be at:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

Your `docker-compose.prod-https.yml` already mounts `/etc/letsencrypt/...` into the Nginx container.

---

## 5) Configure `.env` (production)

On EC2:

```bash
git clone https://github.com/<your-org>/<your-repo>.git dolce
cd dolce

cp .env.example .env
nano .env
```

Minimum production variables (example):

```ini
# Django
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=CHANGE_ME
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True

# Postgres
DB_NAME=dolce_db
DB_USER=dolce_user
DB_PASSWORD=CHANGE_ME
DB_HOST=db
DB_PORT=5432

# S3 (turn on)
USE_S3=True
AWS_STORAGE_BUCKET_NAME=dolce-fiore-assets-prod
AWS_S3_REGION_NAME=us-east-1

# If NOT using an EC2 IAM role, also set:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...

# Nginx domains
NGINX_DOMAIN=yourdomain.com
NGINX_DOMAIN_WWW=www.yourdomain.com

# Use Let's Encrypt certs directly (recommended with prod-https compose)
NGINX_SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
NGINX_SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Razorpay (if payments enabled)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## 6) First production deploy

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml up -d --build
```

Verify:
- `https://yourdomain.com/health` → `healthy`
- `https://yourdomain.com/admin/` loads Django admin
- `https://yourdomain.com/` loads Next.js

Logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml logs -f
```

### Notes about static + media

- With `USE_S3=True`, Django uploads:
  - static → `s3://bucket/static/`
  - media → `s3://bucket/media/`
- Nginx still has `/static/` and `/media/` aliases for local storage. That’s fine, but in S3 mode the app should primarily reference S3 URLs.

---

## 7) Updating the app (manual CD on EC2)

```bash
cd ~/dolce
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml up -d --build
```

You can also use `scripts/deploy-prod.sh`, but note it currently uses only `docker-compose.yml` + `docker-compose.prod.yml`. If you use HTTPS, prefer the 3-file compose command above (or update the script accordingly).

---

## 8) Certificate renewals

Renew:

```bash
sudo certbot renew
```

Reload Nginx container to pick up renewed certs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod-https.yml restart nginx
```

---

## 9) Troubleshooting

- **S3 static/media not loading**
  - Confirm `USE_S3=True`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`
  - Check bucket policy (public read for `static/*` and `media/*`, or CloudFront)
  - Run `collectstatic` manually:
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
    ```

- **Admin CSS missing**
  - Usually means a static URL / storage mismatch.
  - Confirm production settings don’t override S3 URLs when `USE_S3=True`.

- **502 from Nginx**
  - Check upstream containers:
    ```bash
    docker compose ps
    docker compose logs -f nginx backend frontend-next
    ```

- **Next image errors (when you move media/product images to S3)**
  - Ensure `frontend-next/next.config.ts` `images.remotePatterns` includes your S3 hostname (e.g. `your-bucket.s3.amazonaws.com`) or your CloudFront domain.
