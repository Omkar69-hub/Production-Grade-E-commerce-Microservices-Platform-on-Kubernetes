#!/bin/bash
# docker-build.sh
# Builds all Docker images for the e-commerce platform locally

echo "Building all Docker images..."

docker-compose -f docker/docker-compose.dev.yml build

echo "Build complete."
