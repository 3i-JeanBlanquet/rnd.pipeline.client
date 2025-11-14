# Image Management App

A TypeScript React application for managing images with upload functionality and API service integration.

## Deploy

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag 738521500508.dkr.ecr.ap-northeast-1.amazonaws.com/int_rnd_app:latest \
  --push \
  .