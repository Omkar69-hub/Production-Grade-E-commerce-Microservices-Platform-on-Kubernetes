# API Error Models

All APIs in the Production-Grade E-Commerce Platform adhere strictly to **RFC 7807 (Problem Details for HTTP APIs)**. This ensures standard, parseable, and actionable error responses across all microservices.

## Standard Error Payload Structure

```json
{
  "type": "https://api.ecommerce.com/errors/validation-error",
  "title": "Bad Request",
  "status": 400,
  "detail": "The request payload contains invalid fields.",
  "instance": "/api/v1/orders",
  "timestamp": "2026-07-13T12:00:00Z",
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "errors": []
}
```

## 1. Validation Errors (400 Bad Request)
Returned when path variables, query parameters, or request bodies fail schema validation.

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/validation-error",
  "title": "Bad Request",
  "status": 400,
  "detail": "Input validation failed",
  "instance": "/api/v1/products",
  "traceId": "trace-123",
  "errors": [
    {
      "field": "price",
      "message": "Price must be strictly greater than zero",
      "rejectedValue": -5.0
    }
  ]
}
```

## 2. Authentication Errors (401 Unauthorized)
Returned when a JWT is missing, expired, malformed, or has an invalid signature. Handled strictly by the API Gateway.

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "JWT has expired. Please use refresh token.",
  "instance": "/api/v1/users/me"
}
```

## 3. Authorization Errors (403 Forbidden)
Returned when a valid user attempts to access a resource they do not have permission for (e.g., a `CUSTOMER` trying to access an `ADMIN` endpoint).

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Insufficient permissions to perform this action.",
  "requiredRole": "ADMIN"
}
```

## 4. Resource Not Found (404 Not Found)
Returned when requesting a resource by ID that does not exist.

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Product with ID '999' was not found.",
  "resourceType": "Product",
  "resourceId": "999"
}
```

## 5. Business Validation Errors (409 Conflict / 422 Unprocessable Entity)
Returned when a request is syntactically correct but violates business rules (e.g., out of stock).

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/out-of-stock",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "The requested quantity exceeds available stock.",
  "productId": "prod-123",
  "availableStock": 2,
  "requestedQuantity": 5
}
```

## 6. Internal Server Errors (500 Internal Server Error)
Returned for unhandled exceptions, database timeouts, or unexpected downstream failures. Stack traces are **never** returned to the client.

**Example Response:**
```json
{
  "type": "https://api.ecommerce.com/errors/internal-server-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Please contact support referencing the traceId.",
  "traceId": "fatal-xyz-987"
}
```
