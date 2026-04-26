#!/bin/sh
set -e

# Generate runtime configuration from environment variables
# This allows Docker environment variables to override build-time values
{
  echo "window.__ENV__ = {"
  if [ -n "$VITE_API_BASE_URL" ]; then
    echo "  VITE_API_BASE_URL: \"$VITE_API_BASE_URL\""
  fi
  echo "};"
} > /usr/share/nginx/html/config.js

# Start nginx
exec nginx -g "daemon off;"
