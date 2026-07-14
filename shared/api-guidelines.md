# API Guidelines

## 1. REST Naming Conventions
- URLs must be **lowercase** and **kebab-case**. (e.g., `/api/v1/product-categories`).
- Resources should be **plural nouns** (e.g., `/users`, not `/user`).
- Avoid using verbs in URLs; use HTTP methods instead (e.g., `POST /orders`, not `POST /createOrder`).

## 2. HTTP Methods
- `GET`: Retrieve a resource. Safe and idempotent.
- `POST`: Create a new resource or trigger a non-idempotent action.
- `PUT`: Fully replace a resource. Idempotent.
- `PATCH`: Partially update a resource.
- `DELETE`: Remove a resource. Idempotent.

## 3. Status Codes
- `200 OK`: Successful GET, PUT, PATCH.
- `201 Created`: Successful POST. Must include a `Location` header.
- `204 No Content`: Successful DELETE.
- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Valid JWT, but lacking required roles.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business rule violation (e.g., email already exists).
- `500 Internal Server Error`: Unhandled exception.

## 4. Pagination, Filtering, and Sorting
- Always paginate collections. Use `page` (0-indexed) and `size`.
- **Filtering:** Use query parameters (e.g., `?category=electronics&minPrice=100`).
- **Sorting:** Use `sort` parameter (e.g., `?sort=price,desc`).

## 5. Versioning
- Use URI versioning: `/api/v1/...`
- See `api-versioning.md` for strict backwards compatibility rules.
