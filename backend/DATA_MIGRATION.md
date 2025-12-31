# Data Migration Guide

Quick reference guide for migrating data between environments.

## Quick Commands

### Export from Local (Docker Compose)

**Note:** When using Docker Compose, prefix commands with `docker-compose exec backend`

```bash
# Export everything
docker-compose exec backend python manage.py export_content_data --output content_data_export.json

# Export only products
docker-compose exec backend python manage.py export_content_data --output products.json --only-products

# Export only content (blogs, testimonials)
docker-compose exec backend python manage.py export_content_data --output content.json --only-content
```

**File Location:** Files are created in `./backend/` on your host machine (mapped from `/app` in container).

### Import to Dev/Prod

**Option 1: Secure Transfer (Recommended for large files)**
```bash
# 1. Transfer file to server (from your local machine)
scp backend/content_data_export.json user@server:/path/to/dolce/backend/

# 2. On server, import
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json
```

**Option 2: Git (Only for small files < 1MB)**
```bash
# 1. Export to fixtures (with Docker)
docker-compose exec backend python manage.py export_content_data --output fixtures/content/latest.json

# 2. Commit and push
git add backend/fixtures/content/latest.json
git commit -m "Update content data"
git push origin dev

# 3. On server, pull and import
git pull origin dev
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input fixtures/content/latest.json
```

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

## Docker-Specific Notes

- **Volume Mounts:** The `./backend:/app` volume mount means files created in the container are accessible on the host
- **File Paths:** Use paths relative to `/app` inside container (which is `./backend` on host)
- **Command Format:** Always use `docker-compose exec backend` prefix for management commands
- **Development vs Production:** Use appropriate compose files:
  - Dev: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml`
  - Prod: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml`

## Full Documentation

See `backend/fixtures/README.md` for complete documentation.

