# Docker Data Migration Quick Reference

Quick reference for migrating data when using Docker Compose.

## Local Development (Docker)

### Export Data
```bash
# Export everything
docker-compose exec backend python manage.py export_content_data --output content_data_export.json

# Export only products
docker-compose exec backend python manage.py export_content_data --output products.json --only-products

# Export only content
docker-compose exec backend python manage.py export_content_data --output content.json --only-content
```

**File Location:** Files are saved to `./backend/` on your host machine.

### Import Data
```bash
# Import everything
docker-compose exec backend python manage.py import_content_data --input content_data_export.json

# Import with clearing existing
docker-compose exec backend python manage.py import_content_data --input content_data_export.json --clear-existing
```

## Transferring to Server

### Step 1: Export on Local
```bash
docker-compose exec backend python manage.py export_content_data --output content_data_export.json
```

### Step 2: Transfer File
```bash
# Using SCP
scp backend/content_data_export.json user@dev-server:/path/to/dolce/backend/

# Using rsync
rsync -avz backend/content_data_export.json user@dev-server:/path/to/dolce/backend/
```

### Step 3: Import on Server
```bash
# SSH into server
ssh user@dev-server

# Navigate to project
cd /path/to/dolce

# Import data
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json
```

## Important Notes

1. **File Paths:** 
   - Container: `/app/content_data_export.json`
   - Host: `./backend/content_data_export.json`

2. **Volume Mounts:**
   - `./backend:/app` means files are shared between host and container
   - Files created in container are visible on host immediately

3. **Compose Files:**
   - Dev: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml`
   - Prod: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml`

## Example Workflow

```bash
# 1. Export from local
docker-compose exec backend python manage.py export_content_data --output content_data_export.json

# 2. Check file exists on host
ls -lh backend/content_data_export.json

# 3. Transfer to server
scp backend/content_data_export.json user@dev-server:/path/to/dolce/backend/

# 4. On server, import
ssh user@dev-server
cd /path/to/dolce
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json
```

## Troubleshooting

**File not found error:**
- Make sure file path is relative to `/app` in container
- Check that file exists in `./backend/` on host

**Permission errors:**
- Ensure Docker has write access to `./backend/` directory
- Check file permissions: `chmod 644 backend/content_data_export.json`

**Container not running:**
- Start containers: `docker-compose up -d`
- Check status: `docker-compose ps`

