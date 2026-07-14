# ADR-011: Why Redis

*   **ADR Number:** 011
*   **Title:** Adoption of Redis for Distributed Caching and Session Storage
*   **Status:** Accepted
*   **Date:** 2026-07-13

## Context
E-commerce platforms are extremely read-heavy. The Product Catalog is queried constantly, while updates to products are relatively infrequent. Additionally, we need a fast, temporary storage layer for the shopping cart.

## Problem Statement
Querying PostgreSQL for every product catalog view will overwhelm the database during peak traffic, increasing latency and infrastructure costs. We need a low-latency, in-memory data store.

## Decision
We will use **Redis** (via Amazon ElastiCache) as our distributed caching layer and temporary data store.

## Alternatives Considered
*   **Memcached:** Rejected. Lacks advanced data structures (Lists, Hashes, Sets) and persistence options that Redis provides.
*   **In-Memory Local Cache (Caffeine/Ehcache):** Rejected for shared state (like carts). While useful for L1 caching, local caches result in cache-misses on subsequent requests routed to different pods, and cause memory bloat in the application containers.

## Advantages
*   **Performance Benefits:** Sub-millisecond read/write latency, vastly improving the customer experience for catalog browsing.
*   **Session/Cart Storage:** Perfect for storing the Shopping Cart, which is transient and requires rapid read/write operations before checkout.
*   **Rate Limiting:** Integrates seamlessly with Spring Cloud Gateway to store rate-limiting token buckets.

## Disadvantages
*   **Cache Invalidation:** The hardest problem in computer science. Keeping the cache synchronized with the primary database requires complex logic (e.g., cache-aside pattern).
*   **Data Loss:** While Redis can persist to disk (AOF/RDB), it is primarily in-memory and sudden failures can result in minor data loss (acceptable for carts, not for orders).

## Risks
*   **Stale Data:** Customers might see outdated prices if cache invalidation fails.
*   **OOM (Out of Memory):** If eviction policies are not set correctly, Redis can crash when full.

## Consequences
Developers must implement the Cache-Aside pattern. When a product is updated in the DB, an event must trigger the invalidation of the corresponding Redis key. Carts will have a Time-To-Live (TTL) to prevent memory exhaustion.

## Operational Impact
Moderate. Managed via AWS ElastiCache, reducing operational burden, but still requires monitoring memory fragmentation and hit rates.

## Performance Impact
Massively positive. Reduces database load and API response times.

## Security Impact
Redis traffic must be encrypted in transit (TLS) and authenticated via Redis AUTH.

## Cost Impact
ElastiCache adds to the monthly AWS bill, but saves money by allowing us to use smaller RDS instances.

## Future Considerations
Explore Redis Streams if we need a lightweight alternative to RabbitMQ for specific use cases.

## References
*   Redis Enterprise Documentation
