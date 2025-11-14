# Docker Build Guide

This guide explains how to build multi-platform Docker images for the rnd-client application.

## Multi-Platform Build

The application supports building Docker images for multiple platforms (architectures) to ensure compatibility across different systems (AMD64, ARM64, etc.).

### Prerequisites

1. **Docker Buildx** (included with Docker Desktop, or install separately)
   ```bash
   # Verify buildx is available
   docker buildx version
   ```

2. **Enable buildx** (if not already enabled)
   ```bash
   docker buildx create --use
   ```

### Quick Start

#### Build for multiple platforms (default: linux/amd64,linux/arm64)

```bash
# Build locally (loads image for your current platform)
./build-docker.sh

# Build and push to registry
PUSH=true IMAGE_NAME=your-registry/rnd-app IMAGE_TAG=v1.0.0 ./build-docker.sh
```

#### Custom platforms

```bash
# Build for specific platforms
PLATFORMS="linux/amd64,linux/arm64,linux/arm/v7" ./build-docker.sh

# Common platform combinations:
# - AMD64 only: PLATFORMS="linux/amd64"
# - ARM64 only: PLATFORMS="linux/arm64"
# - Both: PLATFORMS="linux/amd64,linux/arm64"
# - All common: PLATFORMS="linux/amd64,linux/arm64,linux/arm/v7"
```

### Manual Build Commands

#### Using Docker Buildx directly

```bash
# Create builder (one-time setup)
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap

# Build for multiple platforms and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag your-registry/rnd-app:latest \
  --push \
  .

# Build for multiple platforms and load (current platform only)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag rnd-app:latest \
  --load \
  .
```

#### Using standard docker build (single platform)

```bash
# Build for your current platform
docker build -t rnd-app:latest .

# Build for specific platform (requires buildx)
docker buildx build --platform linux/amd64 -t rnd-app:latest --load .
```

### Environment Variables

The build script supports the following environment variables:

- `IMAGE_NAME` - Docker image name (default: `rnd-app`)
- `IMAGE_TAG` - Docker image tag (default: `latest`)
- `PLATFORMS` - Comma-separated list of platforms (default: `linux/amd64,linux/arm64`)
- `PUSH` - Set to `true` to push to registry (default: `false`)

### Examples

#### Build and push to Docker Hub

```bash
PUSH=true \
IMAGE_NAME=yourusername/rnd-app \
IMAGE_TAG=v1.0.0 \
./build-docker.sh
```

#### Build and push to private registry

```bash
PUSH=true \
IMAGE_NAME=registry.example.com/rnd-app \
IMAGE_TAG=latest \
./build-docker.sh
```

#### Build for Apple Silicon (M1/M2) and Intel Macs

```bash
PLATFORMS="linux/amd64,linux/arm64" ./build-docker.sh
```

### Runtime Environment Variables

The container supports runtime environment variables that override build-time values:

```bash
docker run -p 8080:80 \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_S3_BUCKET_URL=https://s3.example.com/bucket \
  rnd-app:latest
```

### Troubleshooting

#### "no match for platform in manifest: not found"

This error occurs when trying to pull an image built for a different platform. Solutions:

1. **Build multi-platform image** (recommended):
   ```bash
   ./build-docker.sh
   ```

2. **Build for specific platform**:
   ```bash
   docker buildx build --platform linux/amd64 -t rnd-app:latest --load .
   ```

3. **Use platform flag when running**:
   ```bash
   docker run --platform linux/amd64 rnd-app:latest
   ```

#### Buildx not found

Install Docker Buildx:
- **Docker Desktop**: Already included
- **Linux**: `docker buildx install` (if using Docker CLI plugin)
- **Manual**: Follow [Docker Buildx installation guide](https://docs.docker.com/buildx/working-with-buildx/)

#### Build fails on ARM64/Apple Silicon

Ensure you're using multi-platform base images (already configured):
- `node:18-alpine` - supports multi-platform
- `nginx:alpine` - supports multi-platform

### Verifying Multi-Platform Support

Check if your image supports multiple platforms:

```bash
# Inspect image manifest
docker buildx imagetools inspect your-registry/rnd-app:latest

# Should show multiple platforms:
# linux/amd64
# linux/arm64
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
- name: Build and push multi-platform image
  uses: docker/build-push-action@v4
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: your-registry/rnd-app:latest
```

#### GitLab CI Example

```yaml
build:
  stage: build
  script:
    - docker buildx create --use
    - docker buildx build --platform linux/amd64,linux/arm64 --push -t $CI_REGISTRY_IMAGE:latest .
```

