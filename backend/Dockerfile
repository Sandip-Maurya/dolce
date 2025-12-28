# Dockerfile for Django backend
FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install system and build dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq5 \
    libpq-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install gosu for dropping privileges
RUN curl -o /usr/local/bin/gosu -SL "https://github.com/tianon/gosu/releases/download/1.16/gosu-$(dpkg --print-architecture)" \
    && chmod +x /usr/local/bin/gosu

# Install Python dependencies
RUN uv pip install --system \
    "django>=5.0,<6.0" \
    "djangorestframework>=3.15.0" \
    "drf-spectacular>=0.27.0" \
    "drf-spectacular-sidecar>=2024.5.1" \
    "django-cors-headers>=4.3.0" \
    "python-dotenv>=1.0.0" \
    "pillow>=10.0.0" \
    "gunicorn>=23.0.0" \
    "psycopg2-binary>=2.9.0"

# Create non-root user
RUN useradd -m -u 1000 django && \
    mkdir -p /app /app/staticfiles /app/media /app/logs && \
    chown -R django:django /app

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=django:django backend/ .

# Create entrypoint script inline to fix permissions on mounted volumes
# This runs as root on container start, fixes permissions, then switches to django user
RUN echo '#!/bin/bash' > /usr/local/bin/docker-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ -d "/app/staticfiles" ]; then echo "Fixing permissions for staticfiles directory..."; chown -R django:django /app/staticfiles 2>/dev/null || true; chmod -R 755 /app/staticfiles 2>/dev/null || true; fi' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ -d "/app/media" ]; then echo "Fixing permissions for media directory..."; chown -R django:django /app/media 2>/dev/null || true; chmod -R 755 /app/media 2>/dev/null || true; fi' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ -d "/app/logs" ]; then echo "Fixing permissions for logs directory..."; chown -R django:django /app/logs 2>/dev/null || true; chmod -R 755 /app/logs 2>/dev/null || true; fi' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'exec gosu django "$@"' >> /usr/local/bin/docker-entrypoint.sh && \
    chown root:root /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=config.settings

# Set entrypoint (runs as root to fix permissions, then switches to django user)
# Entrypoint runs as root by default, fixes permissions, then uses gosu to switch to django user
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Note: We don't set USER here because entrypoint needs to run as root to fix permissions
# The entrypoint script will switch to django user using gosu

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/schema/')" || exit 1

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "config.wsgi:application"]
