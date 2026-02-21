# Dolce Fiore — E-commerce Platform

A full-stack e-commerce platform for handcrafted gift hampers, built with Django and Next.js.

## Project structure

```
dolce/
├── backend/                    # Django REST Framework API
│   ├── apps/                   # Django applications
│   ├── config/                 # Django project configuration
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend-next/              # Next.js frontend (SSR)
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── nginx/                      # Nginx reverse proxy configuration
│   ├── nginx.dev.conf          # Dev (local) HTTP config
│   ├── nginx.origin.conf       # Stg/prod behind CloudFront (HTTP)
│   └── conf.d/
├── scripts/
│   ├── backup-db.py            # Database backup (S3); requires AWS_STORAGE_BUCKET_NAME
│   ├── backup-db.sh            # Legacy bash backup (local only)
│   └── restore-db.py           # Restore from S3 or local file
├── docker-compose.dev.yml      # Dev (local). Single file.
├── docker-compose.stg.yml      # Staging (Lightsail, kakshaonline.com). Single file.
├── docker-compose.prod.yml     # Production (Lightsail, dolcefiore.in). Single file.
├── .env.example                # Environment variables template
└── README.md
```

## Quick start (local)

```bash
git clone https://github.com/Sandip-Maurya/dolce.git
cd dolce
cp .env.example .env
# Edit .env with your configuration (see docs/configuration/environment-variables.md)

docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser   # optional
docker compose -f docker-compose.dev.yml exec backend python manage.py load_mock_products  # optional
```

**Access:** Frontend http://localhost:8080 · API http://localhost:8080/api/ · Admin http://localhost:8080/admin/

## Documentation

All documentation is in the **[docs/](docs/)** folder. Start with [docs/README.md](docs/README.md) for the full index.

| Doc | Description |
|-----|-------------|
| [Product](docs/product.md) | Concept, branding, features |
| [Architecture](docs/architecture.md) | Stack, branch strategy, Docker Compose |
| [Development](docs/development.md) | Local setup, commands, branch workflow |
| [API](docs/api.md) | API overview and Swagger link |
| [Deployment](docs/deployment/cloudfront-lightsail.md) | Lightsail + CloudFront (current) |
| [Operations](docs/operations.md) | Runbooks, backups, data migration |
| [Troubleshooting](docs/troubleshooting.md) | FAQ and common errors |

## License

[Add your license here]

## Support

For questions or issues, contact the development team or open an issue on GitHub.
