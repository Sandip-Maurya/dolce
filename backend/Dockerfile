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
    && rm -rf /var/lib/apt/lists/*

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

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=config.settings

# Switch to non-root user
USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/schema/')" || exit 1

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "config.wsgi:application"]
