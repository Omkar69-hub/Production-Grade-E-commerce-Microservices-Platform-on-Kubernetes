#!/bin/bash
# docker-logs.sh
# Follows logs of all containers or a specific service

if [ -z "$1" ]; then
    echo "Following logs for all services..."
    docker-compose -f docker/docker-compose.dev.yml logs -f
else
    echo "Following logs for $1..."
    docker-compose -f docker/docker-compose.dev.yml logs -f "$1"
fi
