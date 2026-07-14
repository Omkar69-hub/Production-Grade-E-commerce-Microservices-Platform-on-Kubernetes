import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  // 1. Load Products (Simulates browsing)
  let productRes = http.get(`${BASE_URL}/api/products`);
  check(productRes, {
    'Products loaded successfully (200)': (r) => r.status === 200,
  });
  
  sleep(1); // User think time

  // Note: For endpoints requiring auth, we'd need to add a setup() function
  // to fetch a JWT token first, or simulate anonymous cart additions if supported.
  
  // 2. Example: Simulate searching for a specific product
  let searchRes = http.get(`${BASE_URL}/api/products/1`);
  check(searchRes, {
    'Product details loaded (200)': (r) => r.status === 200,
  });

  sleep(2);
}
