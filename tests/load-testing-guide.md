# Load Testing Guide

This guide explains how to run performance tests against the E-Commerce platform using K6.

## Pre-requisites
*   Install K6 (https://k6.io/docs/get-started/installation/).
*   The target environment should resemble production as closely as possible. Do not run heavy load tests against a local minikube cluster unless testing minimal thresholds.

## Running the Test

The default script simulates ramping up to 100 concurrent users over several minutes.

```bash
# Basic run
k6 run tests/load/k6-load-test.js

# Run with a custom Base URL
k6 run -e BASE_URL=http://api.ecommerce.local tests/load/k6-load-test.js
```

## Understanding Results

K6 will output a summary in the terminal. Key metrics to observe:
*   `http_req_duration`: The time taken for the entire request. We target `p(95) < 500ms`.
*   `http_req_failed`: The percentage of failed requests. We target `< 1.00%`.
*   `iterations`: Total complete executions of the default function.

## CI/CD Integration
If the thresholds defined in the script (`options.thresholds`) are violated, K6 will exit with a non-zero code, failing the CI/CD pipeline step.
