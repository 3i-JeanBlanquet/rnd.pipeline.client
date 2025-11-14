#!/bin/bash
set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-rnd-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building multi-platform Docker image...${NC}"
echo -e "Image: ${GREEN}${IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo -e "Platforms: ${GREEN}${PLATFORMS}${NC}"
echo ""

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "Error: docker buildx is not available. Please install Docker Buildx."
    exit 1
fi

# Create and use a new builder instance for multi-platform builds
BUILDER_NAME="multiarch-builder"
if ! docker buildx inspect $BUILDER_NAME > /dev/null 2>&1; then
    echo "Creating new buildx builder: $BUILDER_NAME"
    docker buildx create --name $BUILDER_NAME --use
else
    echo "Using existing buildx builder: $BUILDER_NAME"
    docker buildx use $BUILDER_NAME
fi

# Bootstrap the builder (needed for multi-platform)
docker buildx inspect --bootstrap

# Build and push multi-platform image
echo ""
echo -e "${BLUE}Building for platforms: ${PLATFORMS}${NC}"

# Check if we should push or load
if [ "$PUSH" = "true" ]; then
    echo "Building and pushing to registry..."
    docker buildx build \
        --platform $PLATFORMS \
        --tag ${IMAGE_NAME}:${IMAGE_TAG} \
        --push \
        .
else
    echo "Building multi-platform image (use PUSH=true to push to registry)..."
    docker buildx build \
        --platform $PLATFORMS \
        --tag ${IMAGE_NAME}:${IMAGE_TAG} \
        --load \
        .
fi

echo ""
echo -e "${GREEN}✓ Build complete!${NC}"
echo ""
echo "To push to registry, run:"
echo "  PUSH=true ./build-docker.sh"
echo ""
echo "Or manually:"
echo "  docker buildx build --platform ${PLATFORMS} --tag ${IMAGE_NAME}:${IMAGE_TAG} --push ."

