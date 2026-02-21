# Operations

Runbooks, backups, and data migration for running and maintaining the application.

---

## Runbooks

### Updating staging

```bash
git pull origin stg
docker compose -f docker-compose.stg.yml pull
docker compose -f docker-compose.stg.yml up -d
# If needed:
docker compose -f docker-compose.stg.yml exec backend python manage.py migrate
docker compose -f docker-compose.stg.yml exec backend python manage.py collectstatic --noinput
```

### Updating production

```bash
git pull origin prod
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
# If needed:
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Monitoring

```bash
# Staging
docker compose -f docker-compose.stg.yml logs -f
docker compose -f docker-compose.stg.yml ps
docker compose -f docker-compose.stg.yml exec nginx nginx -t

# Production (same with docker-compose.prod.yml)
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## Backups

Backups use Python scripts that create a local dump, upload to S3, and manage retention. **Requires `AWS_STORAGE_BUCKET_NAME`** in `.env` (same bucket as media, with `backups/` prefix).

### Requirements

- `AWS_STORAGE_BUCKET_NAME` must be set in `.env` (required)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (or IAM role) for S3
- Python 3.11+ with `boto3` and `python-dotenv` (backend requirements)

### Manual backup

```bash
# Staging
COMPOSE_FILE=docker-compose.stg.yml python scripts/backup-db.py

# Production
COMPOSE_FILE=docker-compose.prod.yml python scripts/backup-db.py

# Dev (use docker-compose.dev.yml)
COMPOSE_FILE=docker-compose.dev.yml python scripts/backup-db.py
```

- **Local:** Backups stored in `./backups/` (retention: 7 days)
- **S3:** Uploaded to `s3://{bucket}/backups/{env}/` (retention: last 14 per env)
- Environment (`dev`/`stg`/`prod`) is inferred from `COMPOSE_FILE`

### Automated backups

Add to crontab on each Lightsail instance:

```bash
# crontab -e
# Staging: daily at 2 AM
0 2 * * * cd /path/to/dolce && COMPOSE_FILE=docker-compose.stg.yml python scripts/backup-db.py

# Production: daily at 3 AM (different instance)
0 3 * * * cd /path/to/dolce && COMPOSE_FILE=docker-compose.prod.yml python scripts/backup-db.py
```

### Restore from backup

```bash
# Restore latest backup for the environment
COMPOSE_FILE=docker-compose.prod.yml python scripts/restore-db.py --latest

# Restore specific S3 backup
COMPOSE_FILE=docker-compose.prod.yml python scripts/restore-db.py --s3-key backups/prod/backup_dolce_db_20250221_020000.sql.gz

# Restore from local file
COMPOSE_FILE=docker-compose.prod.yml python scripts/restore-db.py --file ./backups/backup_dolce_db_20250221_120000.sql.gz

# Dry-run: show what would be restored
python scripts/restore-db.py --latest --dry-run
```

Restore prompts for confirmation and replaces all data in the target database. Use the compose file for the environment you are restoring **to**.

---

## Data migration (content and products)

Export/import moves products, categories, content (blogs, testimonials, About Us, etc.) between environments. User accounts, orders, and carts are **not** exported.

### Export (dev/local)

```bash
# Export everything (file appears in ./backend/ on host when using dev compose volume)
docker compose -f docker-compose.dev.yml exec backend python manage.py export_content_data --output content_data_export.json

# Export only products
docker compose -f docker-compose.dev.yml exec backend python manage.py export_content_data --output products.json --only-products

# Export only content (no products)
docker compose -f docker-compose.dev.yml exec backend python manage.py export_content_data --output content.json --only-content
```

**File location (dev):** With volume mount `./backend:/app`, files are saved to `./backend/` on the host.

### Import (dev)

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json

# Replace all existing data (WARNING: deletes existing content/products first)
docker compose -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json --clear-existing
```

### Migrating from dev to prod

**Option A: Via S3**

1. On dev: export as above, then upload: `aws s3 cp backend/content_data_export.json s3://your-bucket/content_data_export.json`
2. On prod server: download: `aws s3 cp s3://your-bucket/content_data_export.json backend/content_data_export.json`
3. On prod: copy file into container (prod does not mount `./backend` as a volume), then import:
   ```bash
   docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json
   docker compose -f docker-compose.prod.yml exec backend python manage.py import_content_data --input /app/content_data_export.json --clear-existing
   ```

**Option B: Direct transfer (SCP)**

1. From local: `scp user@dev-server:/path/to/dolce/backend/content_data_export.json ./backend/`
2. Transfer to prod: `scp backend/content_data_export.json user@prod-server:/path/to/dolce/backend/`
3. On prod: same `docker cp` and `import_content_data` as above.

**Important (prod):** In production, `./backend` is not fully mounted; only subdirs like `media`, `staticfiles`, `logs` may be. You must copy the JSON into the container with `docker cp` and use the path inside the container (e.g. `/app/content_data_export.json`) in `import_content_data`.

### Import behavior

- **Without `--clear-existing`:** Updates existing records with same ID; creates new records; leaves prod-only records unchanged. Matching IDs are overwritten with export data.
- **With `--clear-existing`:** Deletes all existing content/products then imports from file. Use for first-time migration or when you want prod to exactly match the export.

### Fixtures (small/static data)

For categories and tags you can use Django fixtures. Export to `backend/fixtures/content/` or `backend/fixtures/initial/`, commit if small, then on server:

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py loaddata fixtures/initial/categories_tags.json
```

See management command options: `--only-products`, `--only-content`, `--skip-products`, `--skip-content`, etc.

### Troubleshooting data migration

- **File not found (prod):** Copy file into container first: `docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json`, then use `--input /app/content_data_export.json`.
- **File not found (dev):** Ensure path is relative to `/app` (e.g. `content_data_export.json`) and file exists in `./backend/` on host.
- **Container name:** Use `docker compose -f docker-compose.prod.yml ps` to get the backend container name (e.g. `dolce_backend`).

---

## Production checklist

Before going live:

- [ ] `DEBUG=False` in `.env`
- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database password set
- [ ] DNS pointing to CloudFront (SSL at CloudFront)
- [ ] Instance firewall: 80, 22 open (CloudFront → origin 80)
- [ ] Database backups configured
- [ ] All environment variables set correctly
- [ ] Static files collected
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Test all endpoints (frontend, API, admin)
- [ ] Monitor logs for errors
