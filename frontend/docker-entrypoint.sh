#!/bin/sh
set -e

# Set default values if not provided
export PORT=${PORT:-80}
export BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

# Create nginx config from template using envsubst
# Only substitute specific variables to avoid breaking nginx variables
envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'
