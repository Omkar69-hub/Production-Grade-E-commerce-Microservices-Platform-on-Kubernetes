# Rate Limiting Strategy

## 1. Overview
To protect backend microservices from DDoS attacks, brute-force attempts, and noisy neighbors, we enforce strict rate limiting at the **API Gateway** layer using the Redis-backed Token Bucket algorithm provided by Spring Cloud Gateway.

## 2. Throttling Strategy

### 2.1 Anonymous Requests (IP-Based)
Unauthenticated users are rate-limited based on their source IP address (extracted from the `X-Forwarded-For` header injected by the AWS ALB).
*   **Replenish Rate:** 10 requests per second.
*   **Burst Capacity:** 20 requests.
*   *Use Case:* Browsing the product catalog, viewing product details.

### 2.2 Authenticated Requests (User ID-Based)
Authenticated users are rate-limited based on their `userId` (extracted from the JWT `sub` claim). This prevents a malicious user from bypassing IP rate limits using a proxy network.
*   **Replenish Rate:** 30 requests per second.
*   **Burst Capacity:** 50 requests.
*   *Use Case:* Adding to cart, managing profile, placing orders.

### 2.3 Sensitive Endpoints (Strict Limits)
Endpoints susceptible to brute-force or credential stuffing (e.g., login, registration) have aggressively strict limits, calculated per IP address.
*   **Target:** `/api/v1/auth/login` and `/api/v1/auth/register`
*   **Replenish Rate:** 1 request per second.
*   **Burst Capacity:** 5 requests.

## 3. Rate Limit Headers
When a request is accepted, the API Gateway returns standard rate-limit headers to inform the client:
*   `X-RateLimit-Remaining`: Tokens remaining in the bucket.
*   `X-RateLimit-Burst-Capacity`: Maximum burst capacity.
*   `X-RateLimit-Replenish-Rate`: Tokens added per second.

## 4. Error Handling
When the bucket is empty, the API Gateway intercepts the request and immediately returns:
*   **HTTP Status:** `429 Too Many Requests`
*   The response body adheres to the RFC 7807 standard error model.
