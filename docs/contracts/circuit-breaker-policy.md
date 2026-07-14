# Circuit Breaker & Fallback Policy

## 1. Circuit Breaker Configuration
We use Resilience4j to wrap all synchronous inter-service calls.

*   **Failure Rate Threshold:** 50%
*   **Minimum Number of Calls:** 10 (The circuit won't trip unless at least 10 calls have been made in the sliding window).
*   **Sliding Window Size:** 20 calls.
*   **Wait Duration in Open State:** 10 seconds. (After 10 seconds, the circuit transitions to HALF_OPEN to test if the downstream service has recovered).

## 2. Fallback Strategy
When a circuit is OPEN (or a timeout occurs), the service must execute a fallback method instead of throwing a raw exception to the user.

*   **Example (Order -> Product):** If the Product Service is down during a catalog browsing request, the API Gateway (or BFF) might return a cached version of the products from Redis.
*   **Example (Failing Fast):** If the Cart Service is down during checkout, the Order Service cannot proceed. It must fail fast, returning a user-friendly error: "Checkout is temporarily unavailable. Please try again later."
