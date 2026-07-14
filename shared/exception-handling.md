# Exception Handling Guidelines

## 1. Global Exception Handler
Do not use `try/catch` blocks in Controllers to return `ResponseEntity`. Instead, throw custom runtime exceptions from the Service layer. The `@RestControllerAdvice` in the `common-library` will catch them and format them according to RFC 7807 (Problem Details).

## 2. Standard Exceptions
Always throw the specific exception from `com.ecommerce.common.exception`:
*   `ResourceNotFoundException` -> Translates to 404.
*   `ValidationException` -> Translates to 400.
*   `UnauthorizedException` -> Translates to 401.
*   `ForbiddenException` -> Translates to 403.
*   `ConflictException` -> Translates to 409 (e.g., DB constraint violation).

## 3. Checked vs Unchecked
*   We exclusively use **Unchecked Exceptions** (extending `RuntimeException`).
*   Checked exceptions (e.g., `IOException`) must be caught and wrapped in a custom `RuntimeException` (e.g., `SystemException`) to prevent polluting method signatures across the codebase.
