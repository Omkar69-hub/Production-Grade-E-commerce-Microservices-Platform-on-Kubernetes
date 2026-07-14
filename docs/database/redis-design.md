# Redis Design & Strategy

## 1. Overview
Redis 7 is utilized for distributed caching, rate limiting, and transient session storage. It is deployed as a highly available cluster.

## 2. Cache Key Strategy
All Redis keys must follow a strict hierarchical namespace pattern to prevent collisions and allow pattern-based eviction if necessary.
*   **Format:** `prefix:domain:entity:identifier`
*   *Examples:*
    *   `cache:products:detail:prod-1234`
    *   `cart:items:user-9876`
    *   `ratelimit:api:ip-192-168-1-1`

## 3. Time-To-Live (TTL) Policy
No key should ever be stored without a TTL to prevent unbounded memory growth.
*   **Product Details:** 24 hours. (Invalidated earlier if updated).
*   **Shopping Cart:** 7 days. (Refreshed on every cart modification).
*   **Rate Limiting Tokens:** 1 second.
*   **Refresh Tokens (Auth):** 7 days.

## 4. Cache Invalidation
*   **Cache-Aside Pattern:** When a Product is updated in PostgreSQL, the Product Service publishes a `ProductUpdated` event. It also immediately issues a `DEL cache:products:detail:{id}` command to Redis.
*   If the direct `DEL` fails, the TTL ensures eventual consistency.

## 5. Cache Warming
During high-traffic events (e.g., Black Friday), a scheduled job will preemptively query the top 10,000 most popular products and populate the Redis cache to prevent the "thundering herd" problem from overwhelming PostgreSQL.
