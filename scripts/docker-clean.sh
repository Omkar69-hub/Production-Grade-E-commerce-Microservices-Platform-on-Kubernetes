#!/bin/bash
# docker-clean.sh
# Stops and removes containers, networks, and volumes

echo "Cleaning up Docker environment..."

docker-compose -f docker/docker-compose.dev.yml down -v --remove-orphans

echo "Cleanup complete."
