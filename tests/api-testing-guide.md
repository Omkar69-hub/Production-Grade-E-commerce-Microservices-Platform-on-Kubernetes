# API Testing Guide

This guide explains how to execute the API test suite using Postman and Newman.

## Pre-requisites
*   The E-Commerce platform must be running (locally or in Kubernetes).
*   Node.js installed (for Newman).

## Using Postman (UI)
1.  Open Postman.
2.  Click **Import** and select `tests/api/ecommerce-postman-collection.json`.
3.  Ensure the `baseUrl` variable is set correctly for your environment (e.g., `http://api.ecommerce.local` for Kubernetes Ingress, or `http://localhost:8080` for local API Gateway).
4.  Run the collection. The `Login` request will automatically extract the JWT and place it in the `jwt_token` variable for subsequent requests.

## Using Newman (CLI / CI/CD)

Newman is the CLI runner for Postman collections, perfect for CI/CD pipelines.

### Installation
```bash
npm install -g newman
```

### Execution
```bash
newman run tests/api/ecommerce-postman-collection.json --env-var baseUrl=http://localhost:8080
```

### Generating Reports
To generate an HTML report for Jenkins/GitLab/GitHub Actions:
```bash
npm install -g newman-reporter-html
newman run tests/api/ecommerce-postman-collection.json -r cli,html --reporter-html-export reports/api-report.html
```

## E2E Scenarios Covered
1.  User Registration & Login (Auth Service).
2.  Browsing Products (Product Service).
3.  Adding to Cart (Cart Service).
4.  Placing an Order (Order Service, which implicitly triggers Payment and Notification).
