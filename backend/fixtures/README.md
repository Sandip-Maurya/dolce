# Data Migration & Fixtures

This directory contains fixtures and data export files for migrating data between environments (local → dev → prod).

## Directory Structure

```
fixtures/
├── initial/          # Small, static seed data (commit to git)
│   └── *.json       # Base categories, tags, etc.
└── content/         # Dynamic content data (optional to commit if < 1MB)
    └── *.json       # Products, blogs, testimonials, etc.
```

## Quick Start

### Exporting Data from Local Environment (Docker)

**Note:** If running with Docker Compose, use `docker-compose exec backend` prefix.

Export all content data:
```bash
# With Docker Compose
docker-compose exec backend python manage.py export_content_data --output fixtures/content/latest.json

# Without Docker (direct Python)
python manage.py export_content_data --output fixtures/content/latest.json
```

Export only products:
```bash
docker-compose exec backend python manage.py export_content_data --output fixtures/content/products.json --only-products
```

Export only content (blogs, testimonials):
```bash
docker-compose exec backend python manage.py export_content_data --output fixtures/content/content.json --only-content
```

### Importing Data to Dev/Prod Environment (Docker)

Import all data:
```bash
# With Docker Compose
docker-compose exec backend python manage.py import_content_data --input fixtures/content/latest.json

# Without Docker (direct Python)
python manage.py import_content_data --input fixtures/content/latest.json
```

Import with clearing existing data (⚠️ WARNING: Deletes all existing data):
```bash
docker-compose exec backend python manage.py import_content_data --input fixtures/content/latest.json --clear-existing
```

Import only products:
```bash
docker-compose exec backend python manage.py import_content_data --input fixtures/content/products.json --only-products
```

**Important:** When using Docker Compose:
- File paths are relative to `/app` inside the container (which maps to `./backend` on host)
- Files created in the container are accessible on the host (and vice versa) due to volume mounts
- Use `docker-compose exec backend` to run management commands

## Recommended Workflow

### For Small/Static Data (Categories, Tags)

1. **Export from local (Docker):**
   ```bash
   # Using export command
   docker-compose exec backend python manage.py export_content_data --output fixtures/initial/categories_tags.json --only-products --exclude-products
   
   # Or using Django dumpdata
   docker-compose exec backend python manage.py dumpdata products.Category products.Tag --indent 2 --output fixtures/initial/categories_tags.json
   ```

2. **Commit to git:**
   ```bash
   git add backend/fixtures/initial/categories_tags.json
   git commit -m "Add initial categories and tags"
   git push origin dev  # or prod
   ```

3. **On server, pull and load:**
   ```bash
   git pull origin dev
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py loaddata fixtures/initial/categories_tags.json
   ```

### For Large/Dynamic Data (Products, Blogs, Testimonials)

**Option A: Secure File Transfer (Recommended)**

1. **Export from local (Docker):**
   ```bash
   docker-compose exec backend python manage.py export_content_data --output content_data_export.json
   ```
   The file will be created in `./backend/content_data_export.json` on your host machine.

2. **Transfer to server:**
   ```bash
   # Using SCP (from your local machine)
   scp backend/content_data_export.json user@dev-server:/path/to/dolce/backend/
   
   # Or using rsync
   rsync -avz backend/content_data_export.json user@dev-server:/path/to/dolce/backend/
   ```

3. **On server, import:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input content_data_export.json
   ```

**Option B: Git (Only if files are < 1MB)**

1. **Export to fixtures directory (Docker):**
   ```bash
   docker-compose exec backend python manage.py export_content_data --output fixtures/content/latest.json
   ```
   The file will be in `./backend/fixtures/content/latest.json` on your host.

2. **Check file size:**
   ```bash
   ls -lh backend/fixtures/content/latest.json
   # If < 1MB, proceed with git commit
   ```

3. **Commit and push:**
   ```bash
   git add backend/fixtures/content/latest.json
   git commit -m "Update content data"
   git push origin dev
   ```

4. **On server, pull and import:**
   ```bash
   git pull origin dev
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py import_content_data --input fixtures/content/latest.json
   ```

## Management Commands Reference

### export_content_data

Export content data to JSON file.

**Options:**
- `--output PATH`: Output file path (default: `content_data_export.json`)
- `--exclude-products`: Exclude products from export
- `--exclude-content`: Exclude content models from export
- `--only-products`: Export only products and related data
- `--only-content`: Export only content models

**Examples:**
```bash
# Export everything (with Docker)
docker-compose exec backend python manage.py export_content_data --output data/export.json

# Export only products
docker-compose exec backend python manage.py export_content_data --output products.json --only-products

# Export only blogs and testimonials
docker-compose exec backend python manage.py export_content_data --output content.json --only-content
```

### import_content_data

Import content data from JSON file.

**Options:**
- `--input PATH`: Input JSON file path (required)
- `--clear-existing`: Clear existing data before importing (⚠️ WARNING)
- `--skip-products`: Skip importing products
- `--skip-content`: Skip importing content models
- `--only-products`: Import only products
- `--only-content`: Import only content models

**Examples:**
```bash
# Import everything (with Docker)
docker-compose exec backend python manage.py import_content_data --input data/export.json

# Import with clearing existing data
docker-compose exec backend python manage.py import_content_data --input data/export.json --clear-existing

# Import only products
docker-compose exec backend python manage.py import_content_data --input products.json --only-products
```

## What Gets Exported/Imported

### Products & Related:
- Categories
- Subcategories
- Tags
- Products
- Product Images
- Product-Tag relationships (many-to-many)

### Content Models:
- Blog Posts
- Text Testimonials
- Video Testimonials
- Sustainable Gifting Items
- About Us Sections
- Our Story Sections
- Our Commitment Sections
- Photo Gallery Items

## Docker Compose Specific Notes

When using Docker Compose, keep these points in mind:

1. **Volume Mounts:**
   - Development: `./backend:/app` is mounted, so files are shared between host and container
   - Files created in container at `/app/` are accessible at `./backend/` on host
   - Files placed in `./backend/` on host are accessible at `/app/` in container

2. **Command Format:**
   ```bash
   # Always use docker-compose exec backend prefix
   docker-compose exec backend python manage.py <command>
   
   # For dev environment
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py <command>
   
   # For prod environment
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend python manage.py <command>
   ```

3. **File Paths:**
   - Use paths relative to `/app` inside container
   - Example: `fixtures/content/latest.json` in container = `./backend/fixtures/content/latest.json` on host

4. **Transferring Files:**
   - Export files are created in `./backend/` on your local machine
   - Transfer the file from `./backend/` directory, not from inside container
   - Example: `scp backend/content_data_export.json user@server:/path/to/dolce/backend/`

## Best Practices

1. **Always backup before importing:**
   ```bash
   # Backup database (with Docker)
   docker-compose exec db pg_dump -U dolce_user dolce_db | gzip > backup.sql.gz
   
   # Or use the backup script
   ./scripts/backup-db.sh
   ```

2. **Test imports on dev before prod:**
   - Always test data imports on dev environment first
   - Verify data integrity after import

3. **Use transactions:**
   - The import command uses database transactions
   - If import fails, all changes are rolled back

4. **Check file sizes:**
   - Files > 1MB should use secure transfer (SCP/rsync)
   - Files < 1MB can optionally be committed to git

5. **Version control:**
   - Small seed data (categories, tags) → commit to git
   - Large dynamic data → use secure transfer

## Troubleshooting

### Import fails with foreign key errors
- Make sure categories and tags are imported before products
- The export/import commands handle dependencies automatically

### Duplicate key errors
- Use `--clear-existing` to remove existing data first
- Or manually delete conflicting records before import

### Large file size
- Use `--only-products` or `--only-content` to split exports
- Compress files before transfer: `gzip content_data_export.json`

## Notes

- Media files (images, videos) are referenced by URL, not exported
- User data, orders, and carts are NOT exported (for security/privacy)
- The export includes metadata (export date, object count) for tracking

