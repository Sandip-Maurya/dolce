# Troubleshooting

## Port already in use

- **Local (dev):** Port 8080 is in docker-compose.dev.yml (8080:80). Ensure no other process uses 8080.
- **Stg/prod:** Ensure ports 80 and 22 are available on the Lightsail instance. Stop other services using these ports if needed.

## Database connection errors

- Ensure the database container is running: `docker compose -f docker-compose.dev.yml ps`
- Check database credentials in `.env`
- Verify `DB_HOST` is set to `db` for Docker setup
- For prod/stg use the correct compose file: `docker-compose.stg.yml` or `docker-compose.prod.yml`

## Static files not loading

- Run `docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput` (or stg/prod compose file)
- Check that volumes are mounted correctly in your compose file
- If using S3, verify `USE_S3`, `AWS_STORAGE_BUCKET_NAME`, and `AWS_S3_CUSTOM_DOMAIN` in `.env`

## CORS errors

- Verify `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL
- Check that the frontend URL matches exactly (including protocol and port)
- For HTTPS deployments, ensure the URL uses `https://` not `http://`

## Nginx not serving app / domain not working

- Verify `NGINX_DOMAIN` and `NGINX_DOMAIN_WWW` are set in `.env` for stg/prod
- Stg/prod: DNS should point to **CloudFront**, not directly to Lightsail. Check CloudFront behaviors and origin (Lightsail:80)
- Check nginx logs: `docker compose -f docker-compose.dev.yml logs nginx` (or stg/prod)
- Test nginx configuration: `docker compose -f docker-compose.dev.yml exec nginx nginx -t`

## SSL certificate issues

- **Stg/prod:** SSL is terminated at CloudFront; no certbot on the instance. If you use EC2 with certbot, ensure certificates are valid and paths in `.env` match (`NGINX_SSL_CERT_PATH`, `NGINX_SSL_KEY_PATH`).
- Certificate path errors: check where certificates are located (e.g. `/etc/letsencrypt/live/yourdomain.com/`) and update `.env` accordingly.

## Docker exec errors

If you get "current working directory is outside of container mount namespace root":

```bash
# Use -T flag to disable pseudo-TTY
docker compose exec -T backend python manage.py migrate

# Or explicitly set working directory
docker compose exec -w /app backend python manage.py migrate

# Or use docker compose run (creates new container)
docker compose run --rm backend python manage.py migrate
```

## Nginx container configuration errors

**"cannot create subdirectories" or "mount: not a directory"**

- Occurs when `nginx/nginx.conf` doesn't exist but Docker tries to mount it. For stg/prod the init script generates it. Create an empty file if needed: `touch nginx/nginx.conf` (or remove and recreate if it was accidentally a directory).

**"no 'events' section in configuration"**

- nginx.conf is empty. Use the correct compose file for the environment: dev uses static config; stg/prod use nginx.origin.conf with env substitution. Ensure `NGINX_DOMAIN` is set in `.env` for stg/prod.

**Nginx container keeps restarting**

- Check nginx logs: `docker compose logs nginx --tail=50`
- Common causes: SSL certificates not found (if using HTTPS on instance), empty or malformed nginx.conf, template processing failed (check `NGINX_DOMAIN`)

## FAQ

### Can I use the same instance for both stg and prod?

Technically yes, but it is **not recommended**. Use separate instances (and branches) for better isolation and security.

### Do I need different domains for stg and prod?

Yes. Staging uses kakshaonline.com; production uses dolcefiore.in. Use different domains or subdomains to separate environments.

### Can I run local development without Docker?

Yes. Run backend with Python (e.g. `uv run python manage.py runserver` in `backend/`) and frontend with Node (`npm run dev` in `frontend-next/`). See [development.md](development.md).

### Why one compose file per environment?

One self-contained file per env (dev, stg, prod) avoids stacking multiple `-f` flags and keeps which stack runs where clear. Each file has the full service definitions for that environment.

### How do I update the application?

Pull the latest code, run `docker compose -f docker-compose.<env>.yml pull && up -d`, then run migrations and collectstatic if needed. See [operations.md](operations.md).

### Why does `git status` show `nginx/nginx.conf` as modified?

`nginx/nginx.conf` is a generated file (from templates for stg/prod). It's in `.gitignore`. If you see it as modified, discard with `git restore nginx/nginx.conf`; it will be regenerated when containers start.

### What's the difference between `docker compose up` and `docker compose up --build`?

`--build` forces rebuilding of images even if they exist. Use it when code or Dockerfiles change. On stg/prod you typically only `pull` and `up -d` (no build on the server).

### How do I backup the database?

Use `python scripts/backup-db.py` with `COMPOSE_FILE` set for your environment. Requires `AWS_STORAGE_BUCKET_NAME` in `.env`. See [operations.md](operations.md#backups).

### How do I restore from a backup?

`python scripts/restore-db.py --latest` (or `--s3-key KEY` / `--file PATH`). Set `COMPOSE_FILE` for the target environment. See [operations.md](operations.md#backups).

### Nginx shows "502 Bad Gateway"

Check if backend (and frontend-next) are running: `docker compose ps`. Check backend logs: `docker compose logs backend`. Ensure backend is listening on port 8000.

### Domain not working / DNS issues

Stg/prod: verify DNS points to **CloudFront** (e.g. CNAME www to your distribution). Check with `dig www.yourdomain.com` or `nslookup`. Allow time for DNS propagation (up to 48 hours).

### Nginx shows "cannot load certificate" errors

Verify SSL certificate paths in `.env` match actual locations. For Let's Encrypt: `NGINX_SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem`. For stg/prod with CloudFront, SSL is at CloudFront; Nginx on the instance is HTTP only.

## Command cheat sheet

| Task | Command |
|------|---------|
| Start services | `docker compose -f docker-compose.dev.yml up -d` (or .stg.yml / .prod.yml) |
| Stop services | `docker compose -f docker-compose.dev.yml down` |
| View logs | `docker compose -f docker-compose.dev.yml logs -f [service]` |
| Restart service | `docker compose -f docker-compose.dev.yml restart [service]` |
| Run migrations | `docker compose -f docker-compose.dev.yml exec backend python manage.py migrate` |
| Create superuser | `docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser` |
| Collect static | `docker compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput` |
| Django shell | `docker compose -f docker-compose.dev.yml exec backend python manage.py shell` |
| Test nginx | `docker compose -f docker-compose.dev.yml exec nginx nginx -t` |
| View containers | `docker compose -f docker-compose.dev.yml ps` |
| Resource usage | `docker stats` |
