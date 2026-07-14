#!/bin/bash
# docker-stop.sh
# Stops the development environment

echo "Stopping development environment..."

docker-compose -f docker/docker-compose.dev.yml stop

echo "Environment stopped."
