# Docker Data Migration Quick Reference

Quick reference for migrating data when using Docker Compose.

## Dev Server (Docker)

### Export Data
```bash
# Export everything
docker compose exec backend python manage.py export_content_data --output content_data_export.json

# Export only products
docker compose exec backend python manage.py export_content_data --output products.json --only-products

# Export only content
docker compose exec backend python manage.py export_content_data --output content.json --only-content
```

**File Location (Dev):** Files are saved to `./backend/` on your host machine (due to volume mount `./backend:/app`).

### Import Data (Dev Server)
```bash
# Import everything
docker compose exec backend python manage.py import_content_data --input content_data_export.json

# Import with clearing existing
docker compose exec backend python manage.py import_content_data --input content_data_export.json --clear-existing
```

## Migrating from Dev to Prod

### Complete Workflow: Dev → Prod via S3

**Step 1: Export on Dev Server**
```bash
# SSH into dev server
ssh user@dev-server
cd /path/to/dolce

# Export data (creates file in ./backend/ on host)
docker compose exec backend python manage.py export_content_data --output content_data_export.json

# Verify file exists
ls -lh backend/content_data_export.json
```

**Step 2: Upload to S3**
```bash
# Upload to S3 bucket
aws s3 cp backend/content_data_export.json s3://your-bucket-name/content_data_export.json
```

**Step 3: Download on Prod Server**
```bash
# SSH into prod server
ssh user@prod-server
cd /path/to/dolce

# Download from S3
aws s3 cp s3://your-bucket-name/content_data_export.json backend/content_data_export.json

# Verify file exists
ls -lh backend/content_data_export.json
```

**Step 4: Copy into Container and Import**
```bash
# IMPORTANT: In production, ./backend is NOT mounted as a volume
# Copy file from host into container first
docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json

# Import using absolute path inside container
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py import_content_data --input /app/content_data_export.json --clear-existing
```

### Alternative: Direct Transfer (Small Files)

**Using SCP:**
```bash
# 1. From local machine, copy from dev server
scp user@dev-server:/path/to/dolce/backend/content_data_export.json ./backend/

# 2. Transfer to prod server
scp backend/content_data_export.json user@prod-server:/path/to/dolce/backend/

# 3. On prod server, copy into container and import
docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py import_content_data --input /app/content_data_export.json --clear-existing
```

## Important Notes

1. **File Paths:** 
   - **Container:** `/app/content_data_export.json` (always use absolute path inside container)
   - **Host (Dev):** `./backend/content_data_export.json` (accessible due to volume mount)
   - **Host (Prod):** `./backend/content_data_export.json` (NOT accessible inside container, must use `docker cp`)

2. **Volume Mounts:**
   - **Dev:** `./backend:/app` volume mount means files are shared between host and container
   - **Prod:** Only `./backend/media:/app/media`, `./backend/staticfiles:/app/staticfiles`, and `./backend/logs:/app/logs` are mounted
   - **Critical:** In production, you MUST copy files into the container using `docker cp` before importing

3. **Compose Files:**
   - **Dev:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`
   - **Prod:** `docker compose -f docker-compose.yml -f docker-compose.prod.yml`

4. **Command Syntax:**
   - Use `docker compose` (V2 syntax with space, not hyphen)
   - Container name for `docker cp`: `dolce_backend`

## What Gets Migrated

✅ **Exported/Imported:**
- Products, Categories, Subcategories, Tags
- Product Images
- Blogs, Testimonials (Text & Video)
- About Us, Our Story, Our Commitment sections
- Photo Gallery, Sustainable Gifting items

❌ **NOT Exported:**
- User accounts
- Orders
- Cart items
- Payment records

## Example Workflow: Dev to Prod

```bash
# === ON DEV SERVER ===
# 1. Export data
docker compose exec backend python manage.py export_content_data --output content_data_export.json

# 2. Verify file exists on host
ls -lh backend/content_data_export.json

# 3. Upload to S3
aws s3 cp backend/content_data_export.json s3://your-bucket-name/content_data_export.json

# === ON PROD SERVER ===
# 4. Download from S3
aws s3 cp s3://your-bucket-name/content_data_export.json backend/content_data_export.json

# 5. Copy file into container
docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json

# 6. Import data (using absolute path inside container)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py import_content_data --input /app/content_data_export.json --clear-existing
```

## Troubleshooting

**File not found error (Prod):**
- ⚠️ **CRITICAL:** In production, files on the host are NOT visible inside the container
- You MUST copy the file into the container first: `docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json`
- Use absolute path `/app/content_data_export.json` when importing
- Verify file exists in container: `docker compose exec backend ls -lh /app/content_data_export.json`

**File not found error (Dev):**
- Make sure file path is relative to `/app` in container (e.g., `content_data_export.json`)
- Check that file exists in `./backend/` on host: `ls -lh backend/content_data_export.json`
- Dev has volume mount, so files should be accessible automatically

**Permission errors:**
- Ensure Docker has write access to `./backend/` directory
- Check file permissions: `chmod 644 backend/content_data_export.json`
- When copying into container, ensure you have permission: `docker cp backend/content_data_export.json dolce_backend:/app/content_data_export.json`

**Container not running:**
- Start containers: `docker compose up -d`
- Check status: `docker compose ps`
- Verify container name: `docker compose ps` (should show `dolce_backend`)

**Wrong container name:**
- Find container name: `docker compose ps`
- Use the correct container name in `docker cp` command: `docker cp <file> <container-name>:/app/<filename>`

