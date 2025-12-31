#!/bin/sh
# Nginx entrypoint that initializes config from template and starts nginx

set -e

# Run the init script to process templates
# Use sh to execute so we don't need execute permissions on the mounted file
if [ -f "/scripts/init-nginx.sh" ]; then
    sh /scripts/init-nginx.sh
fi

# Start nginx
exec nginx -g "daemon off;"

