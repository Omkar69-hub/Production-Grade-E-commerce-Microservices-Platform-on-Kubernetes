#!/bin/bash
# docker-run.sh
# Runs the development environment using Docker Compose

echo "Starting development environment..."

# Make sure .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

docker-compose -f docker/docker-compose.dev.yml up -d

echo "Environment started in detached mode."
echo "Use 'scripts/docker-logs.sh' to view logs."
