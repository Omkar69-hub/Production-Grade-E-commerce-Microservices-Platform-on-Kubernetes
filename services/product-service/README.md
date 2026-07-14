# Product Service

The Product Catalog and Inventory Management microservice for the Production-Grade E-Commerce Platform.

## Features
- Complete CRUD operations for Products, Categories, and Inventory.
- Distributed Redis Caching for blazing fast read operations.
- Event Publishing to RabbitMQ (`ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductDeletedEvent`, `InventoryUpdatedEvent`).
- Fine-grained search with pagination, filtering, and sorting.
- Role-Based Access Control (RBAC): Reads are public, Writes require `ROLE_ADMIN`.

## Architecture
- **Database-per-Service:** Uses an isolated PostgreSQL database (`product_db`).
- **Cache-Aside Pattern:** Redis is utilized to cache product lookups and category tree aggregations. Cache is invalidated synchronously during write operations (`@CacheEvict`).
- **Event-Driven:** Emits domain events to `product.exchange` via AMQP so other domains (Cart, Order, Search) can build eventual-consistency read models or react to changes.

## Database Schema
- `categories`: Hierarchical self-referencing table.
- `products`: Core product metadata.
- `inventory`: One-to-One mapping with products, tracking `quantity_available` and `reserved_quantity`.

## API Endpoints
- `GET /api/v1/products` - Search and list products.
- `GET /api/v1/categories` - Get category tree.
- `POST /api/v1/products` - Create product (Admin only).
- `PUT /api/v1/products/{id}/inventory` - Update stock (Admin only).

## Configuration
Requires the following environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`
- `JWT_SECRET` (Must match the Auth Service to validate tokens).

## Running Locally
```bash
mvn clean install
mvn spring-boot:run
```
To run tests:
```bash
mvn test
```
*(Integration tests use Testcontainers for Postgres).*
