# Testing & Validation Framework

This directory contains the testing and validation assets for the Production-Grade E-Commerce Platform.

## Structure

*   `api/`: Postman collections and environment files for API integration testing.
*   `load/`: K6 scripts for load and performance testing.
*   `security/`: OWASP ZAP baseline scan configurations.
*   `kubernetes/`: Smoke test scripts to validate deployment health.
*   `sonar-project.properties`: Configuration for SonarQube code quality analysis.

## Core Testing Principles

We follow the **Test Pyramid**:
1.  **Unit Tests** (Base): Fast, isolated tests for individual classes/methods (JUnit 5 + Mockito). *Located within each microservice's `src/test/java` directory.*
2.  **Integration Tests** (Middle): Testing interactions with databases and message queues using Testcontainers. *Located within each microservice's `src/test/java` directory.*
3.  **API/E2E Tests** (Top): Validating complete workflows spanning multiple services using Postman/Newman. *Located in `tests/api/`.*

## Quick Start

### 1. Run API Tests (Newman)
```bash
npm install -g newman
newman run tests/api/ecommerce-postman-collection.json
```

### 2. Run Load Tests (K6)
```bash
k6 run tests/load/k6-load-test.js
```

### 3. Run Kubernetes Smoke Tests
```bash
chmod +x tests/kubernetes/smoke-test.sh
./tests/kubernetes/smoke-test.sh
```

## Documentation Guides

For more detailed information, please refer to:
*   [Test Strategy](test-strategy.md)
*   [API Testing Guide](api-testing-guide.md)
*   [Load Testing Guide](load-testing-guide.md)
*   [Kubernetes Validation Guide](kubernetes-validation-guide.md)
