# Dockerization Guide
This directory contains the Docker configuration for the Production-Grade E-Commerce Platform.

## Architecture Overview
The platform is containerized using multi-stage Docker builds to ensure optimal, lightweight, and secure production images.

* **Backend Services**: Built using Maven and Eclipse Temurin Java 21, packaged into Alpine JRE runtime images.
* **Frontend**: Built using Node.js and served statically using an Nginx Alpine runtime image.
* **Infrastructure**: Managed entirely via Docker Compose (PostgreSQL, Redis, RabbitMQ).

## Networks
Docker networks isolate the traffic into logical boundaries:
- `frontend-network`: Bridges the API Gateway and the React Frontend.
- `backend-network`: Interconnects all Spring Boot microservices.
- `infrastructure-network`: Provides access to databases and message brokers (Postgres, Redis, RabbitMQ).

## Volumes
Named volumes are used to persist state:
- `postgres-data`: Stores PostgreSQL database state.
- `redis-data`: Stores Redis cache data.
- `rabbitmq-data`: Stores RabbitMQ queues and metadata.

## Environment Variables
The `.env.example` file located in the root of the project defines all necessary environment variables. 
Copy `.env.example` to `.env` before starting the services:
```bash
cp .env.example .env
```
Ensure that no sensitive secrets (like `JWT_SECRET` or database passwords) are committed to version control. 

## Docker Compose Environments
- `docker-compose.dev.yml`: Local development environment. Builds images from source on the fly and binds to local code if needed.
- `docker-compose.yml`: Production-style compose file. Relies on pre-built `ecommerce/*` images, specifies `restart: always`, and mimics production conditions.

## Local Development Workflow
Use the provided scripts in the `scripts/` directory to manage your local environment effortlessly.
Ensure you have execute permissions (`chmod +x scripts/*.sh`).

* **Build all images:** `scripts/docker-build.sh`
* **Start services:** `scripts/docker-run.sh`
* **Stop services:** `scripts/docker-stop.sh`
* **View logs:** `scripts/docker-logs.sh [service-name]`
* **Open shell inside container:** `scripts/docker-shell.sh <service-name>`
* **Clean everything (Destructive):** `scripts/docker-clean.sh`

## Image Build Instructions
Each service includes a `Dockerfile` optimized for production.
To build a specific service manually:
```bash
docker build -t ecommerce/product-service:latest -f services/product-service/Dockerfile services/product-service
```

### Multi-stage Build Strategy
We employ multi-stage builds to keep images small and secure:
1. **Builder Stage**: Full JDK/Node image used to resolve dependencies, compile code, and generate the deployable artifact (`app.jar` or `dist/` folder).
2. **Runtime Stage**: Minimal OS (Alpine), Non-root user execution, required runtime environments (JRE or Nginx).

## Security Best Practices
- **Non-root Execution**: Spring Boot services run as a dedicated `spring` user. Nginx utilizes non-root capabilities where possible.
- **Minimal Surface Area**: Alpine linux limits installed packages.
- **Health Checks**: Every service exposes a `HEALTHCHECK` directive, preventing upstream systems from routing traffic to unhealthy containers.
- **Layer Optimization**: Dependency layers (`pom.xml`, `package.json`) are copied and installed prior to application code copying, maximizing layer cache hits.

## Troubleshooting
- **Containers exit immediately**: Check the logs using `scripts/docker-logs.sh <service-name>`. Often caused by database connection failures.
- **Port conflicts**: Ensure ports `8080` (API Gateway), `3000` (Frontend locally), `5432`, `6379`, `5672` are available on your host machine.
- **Out of memory during build**: The Java builds can be memory intensive. Ensure Docker Desktop has at least 8GB of RAM allocated.
