#!/bin/sh
set -e

# Generate runtime configuration from environment variables
# This allows Docker environment variables to override build-time values
# Only include variables that are actually set (non-empty)
{
  echo "window.__ENV__ = {"
  
  if [ -n "$VITE_API_BASE_URL" ]; then
    echo -n "  VITE_API_BASE_URL: \"$VITE_API_BASE_URL\""
    if [ -n "$VITE_S3_BUCKET_URL" ]; then
      echo ","
    else
      echo ""
    fi
  fi
  
  if [ -n "$VITE_S3_BUCKET_URL" ]; then
    echo "  VITE_S3_BUCKET_URL: \"$VITE_S3_BUCKET_URL\""
  fi
  
  echo "};"
} > /usr/share/nginx/html/config.js

# Start nginx
exec nginx -g "daemon off;"

