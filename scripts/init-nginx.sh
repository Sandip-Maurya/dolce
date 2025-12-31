#!/bin/sh
# Initialize nginx configuration by substituting environment variables in templates

set -e

# Default values for SSL paths
NGINX_SSL_CERT_PATH=${NGINX_SSL_CERT_PATH:-/etc/nginx/ssl/fullchain.pem}
NGINX_SSL_KEY_PATH=${NGINX_SSL_KEY_PATH:-/etc/nginx/ssl/privkey.pem}

# Export variables for envsubst
export NGINX_DOMAIN
export NGINX_DOMAIN_WWW
export NGINX_SSL_CERT_PATH
export NGINX_SSL_KEY_PATH

# Determine which template to use based on environment
# Priority: dev-https template (if mounted) > production template > skip (use existing)
if [ -f "/etc/nginx/nginx.dev-https.conf.template" ]; then
    TEMPLATE_FILE="/etc/nginx/nginx.dev-https.conf.template"
    OUTPUT_FILE="/etc/nginx/nginx.conf"
    echo "Using dev HTTPS template"
elif [ -f "/etc/nginx/nginx.conf.template" ]; then
    TEMPLATE_FILE="/etc/nginx/nginx.conf.template"
    OUTPUT_FILE="/etc/nginx/nginx.conf"
    echo "Using production template"
else
    # No template found, use existing config (for local development)
    echo "No nginx template found, using existing configuration (local dev mode)"
    exit 0
fi

# Check if required environment variables are set
if [ -z "$NGINX_DOMAIN" ]; then
    echo "Warning: NGINX_DOMAIN is not set. Using default 'localhost'"
    export NGINX_DOMAIN=localhost
fi

if [ -z "$NGINX_DOMAIN_WWW" ]; then
    echo "Warning: NGINX_DOMAIN_WWW is not set. Using default 'www.localhost'"
    export NGINX_DOMAIN_WWW=www.localhost
fi

# Substitute environment variables in template
echo "Generating nginx configuration from template..."
envsubst '${NGINX_DOMAIN} ${NGINX_DOMAIN_WWW} ${NGINX_SSL_CERT_PATH} ${NGINX_SSL_KEY_PATH}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "Nginx configuration generated successfully"
echo "Domain: $NGINX_DOMAIN"
echo "WWW Domain: $NGINX_DOMAIN_WWW"
echo "SSL Cert: $NGINX_SSL_CERT_PATH"
echo "SSL Key: $NGINX_SSL_KEY_PATH"

# Test nginx configuration
nginx -t

