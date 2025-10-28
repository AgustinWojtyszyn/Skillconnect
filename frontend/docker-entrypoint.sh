#!/bin/sh
set -e

# Set default values if not provided
export PORT=${PORT:-80}
export BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

echo "Starting Nginx with:"
echo "  PORT=${PORT}"
echo "  BACKEND_URL=${BACKEND_URL}"

# Create nginx config from template using envsubst
# Only substitute specific variables to avoid breaking nginx variables
envsubst '${PORT} ${BACKEND_URL}' < /tmp/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Show generated config for debugging
echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
nginx -t

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'
