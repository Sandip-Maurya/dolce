#!/bin/bash
set -e

# This script runs as root (via entrypoint) to fix permissions,
# then switches to django user before executing the command

# Fix permissions for mounted volumes
# This is needed because volumes mounted from host may have wrong ownership
if [ -d "/app/staticfiles" ]; then
    echo "Fixing permissions for staticfiles directory..."
    chown -R django:django /app/staticfiles 2>/dev/null || true
    chmod -R 755 /app/staticfiles 2>/dev/null || true
fi

if [ -d "/app/media" ]; then
    echo "Fixing permissions for media directory..."
    chown -R django:django /app/media 2>/dev/null || true
    chmod -R 755 /app/media 2>/dev/null || true
fi

if [ -d "/app/logs" ]; then
    echo "Fixing permissions for logs directory..."
    chown -R django:django /app/logs 2>/dev/null || true
    chmod -R 755 /app/logs 2>/dev/null || true
fi

# Switch to django user and execute the command
exec gosu django "$@"

