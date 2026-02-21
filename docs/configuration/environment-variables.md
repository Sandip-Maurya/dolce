# Environment variables

See `.env.example` at the repo root for all available variables. For staging/production you can use `.env.staging.example` or `.env.prod.example` as a base.

## Environment comparison

| Feature | Local (dev) | Stg (Lightsail) | Prod (Lightsail) |
|---------|-------------|-----------------|-------------------|
| **Compose file** | docker-compose.dev.yml | docker-compose.stg.yml | docker-compose.prod.yml |
| **Protocol** | HTTP | HTTPS (CloudFront) | HTTPS (CloudFront) |
| **Port** | 8080 | 80 (Nginx) | 80 (Nginx) |
| **Domain** | localhost | kakshaonline.com | dolcefiore.in |
| **SSL** | No | CloudFront | CloudFront |
| **Debug** | Enabled | Disabled | Disabled |
| **Hot Reload** | Yes | No | No |
| **DB Port Exposed** | Yes | No | No |

## Django / backend variables

| Variable | Description | Local (dev) | Stg | Prod |
|----------|-------------|-------------|-----|------|
| `SECRET_KEY` | Django secret key | Required | Required | Required (strong) |
| `DJANGO_ENV` | Environment type | `development` | `production` | `production` |
| `DEBUG` | Debug mode | `True` | `False` | `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` | kakshaonline.com, www | dolcefiore.in, www |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:8080` | https://kakshaonline.com | https://dolcefiore.in |
| `USE_S3` / `AWS_S3_CUSTOM_DOMAIN` | Media via CloudFront | Optional | Yes (stg) | Yes (prod) |

Stg/prod use CloudFront for SSL; Nginx on Lightsail is HTTP-only. No certbot on the instance.

## Media (images) and S3

Images are uploaded from Django admin and stored in S3. For **staging and dev**, you can use the **production** S3 bucket and CloudFront domain so that:

- Uploads from admin on staging (or dev) go to prod S3.
- Export from staging and import to prod keeps the same file paths.

Set on **staging** (and optionally dev):

- `USE_S3=True`
- `AWS_STORAGE_BUCKET_NAME=<prod-bucket>` (e.g. `dolce-prod-assets`)

**Backups:** The backup scripts (`scripts/backup-db.py`, `scripts/restore-db.py`) require `AWS_STORAGE_BUCKET_NAME` to upload and restore from S3. Backups are stored at `s3://{bucket}/backups/{env}/`.
- `AWS_S3_CUSTOM_DOMAIN=<prod-cloudfront-domain>` (e.g. `d1234abcd.cloudfront.net` or your custom domain)
- AWS credentials that can write to the prod bucket

For the Next.js app, when it displays images from that domain:

- `NEXT_PUBLIC_MEDIA_DOMAIN=<prod-cloudfront-hostname>` (hostname only, no protocol)

## Generating strong secrets

```bash
# Generate Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate random password
openssl rand -base64 32
```

## Nginx config

- **`nginx/nginx.dev.conf`**: Used by dev (docker-compose.dev.yml). HTTP only, port 8080.
- **`nginx/nginx.origin.conf`**: Used by stg and prod. HTTP only; forwards `X-Forwarded-Proto` so the app sees HTTPS when behind CloudFront.

The init script uses `envsubst` to replace placeholders such as `${NGINX_DOMAIN}` and `${NGINX_DOMAIN_WWW}` from the environment.
