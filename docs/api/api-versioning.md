# API Versioning Strategy

## 1. URI Versioning
All REST APIs in the platform utilize **URI Versioning**. This is the most explicit, cache-friendly, and developer-friendly approach.
*   **Format:** `/api/v{major}/{resource}`
*   **Example:** `/api/v1/products`

We do *not* use query parameters (e.g., `?version=1`), custom request headers, or content negotiation (Accept headers) for versioning, to keep routing logic in the API Gateway simple and highly performant.

## 2. When to Version (Breaking Changes)
A new API version (e.g., `v2`) is strictly required when a **breaking change** is introduced. Breaking changes include:
*   Removing or renaming a field in a response payload.
*   Changing the data type of an existing field.
*   Making a previously optional request parameter mandatory.
*   Changing an HTTP status code for a specific scenario.

## 3. When NOT to Version (Non-Breaking Changes)
Minor additions do not require a version bump. Clients must be built to ignore unknown fields. Non-breaking changes include:
*   Adding a new optional field to a request payload.
*   Adding a new field to a response payload.
*   Adding a completely new endpoint.

## 4. Backward Compatibility Strategy
*   **Tolerant Reader Pattern:** Clients must parse JSON resiliently, ignoring unrecognized fields.
*   **Database compatibility:** When migrating a microservice to `v2`, the database schema must support both `v1` and `v2` temporarily. E.g., if a column is renamed, the old column must be kept and synced via triggers or dual-writes until `v1` is fully retired.

## 5. Deprecation Policy
1.  **Announcement:** When `v2` is released, `v1` is marked as `@Deprecated` in the OpenAPI specification.
2.  **Headers:** The API Gateway begins appending a `Deprecation: true` HTTP header to all `v1` responses, along with a `Link` header pointing to the `v2` documentation.
3.  **Grace Period:** `v1` will remain active and fully supported in production for exactly **6 months** following the release of `v2`.
4.  **Sunsetting:** After the grace period, requests to `v1` will return `410 Gone`.
