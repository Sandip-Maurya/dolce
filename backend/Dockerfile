# Django backend (simple)
FROM python:3.11-slim

WORKDIR /app

# System deps (keep only what you actually need)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    build-essential \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install uv using pip (simple)
RUN pip install --no-cache-dir -U pip uv

# Put the venv somewhere explicit (NOT /app/.venv)
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# App env
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=config.settings

# Copy dependency files first (better caching)
COPY backend/pyproject.toml /app/pyproject.toml
COPY backend/uv.lock /app/uv.lock

# Install deps into /opt/venv
# The --frozen flag ensures we use the exact versions from uv.lock
# Note: We install the project too, which is fine since we'll copy the code anyway
RUN uv sync --frozen --no-dev

# Copy the rest of the backend code
COPY backend/ /app/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/schema/')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "config.wsgi:application"]
