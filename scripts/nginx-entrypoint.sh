#!/bin/sh
# Nginx entrypoint that initializes config from template and starts nginx

set -e

# Run the init script to process templates
if [ -f "/scripts/init-nginx.sh" ]; then
    /scripts/init-nginx.sh
fi

# Start nginx
exec nginx -g "daemon off;"

