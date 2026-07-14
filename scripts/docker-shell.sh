#!/bin/bash
# docker-shell.sh
# Opens a shell in a running container

if [ -z "$1" ]; then
    echo "Usage: $0 <service-name>"
    echo "Example: $0 api-gateway"
    exit 1
fi

echo "Opening shell in $1..."
docker exec -it $1 /bin/sh
