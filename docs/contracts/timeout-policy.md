# Timeout & Retry Policies (Synchronous Calls)

## 1. Timeout Policy
Network calls within the Kubernetes cluster are generally fast, but thread exhaustion or database locks in a downstream service can cause cascading failures. We enforce strict timeouts on all synchronous REST calls.

*   **Connection Timeout:** 500ms (Time to establish TCP handshake).
*   **Read Timeout:** 2000ms (Time waiting for the server to send data).

If a downstream service takes longer than 2 seconds to respond, the call is aborted, and a `503 Service Unavailable` (or a fallback response) is returned.

## 2. Retry Policy
Retries are only safe for **idempotent** operations (GET, PUT, DELETE). We use Spring Retry for internal HTTP calls.

*   **Max Attempts:** 3
*   **Backoff:** Exponential (Multiplier: 2.0). Initial interval: 500ms. Max interval: 2000ms.
*   **Conditions:** Only retry on HTTP `502`, `503`, `504`, or `IOException`.
*   **Non-Retriable:** Never retry on HTTP `400` (Bad Request), `401`, `403`, or `404`. Never retry `POST` requests unless they contain a strict idempotency key that the downstream service respects.
