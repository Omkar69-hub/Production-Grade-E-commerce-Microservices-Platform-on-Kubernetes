# Testing Guidelines

## 1. Test Pyramid
*   **Unit Tests (70%):** Fast, isolated tests using JUnit 5 and Mockito. Used for Services, Utilities, and custom Validators.
*   **Integration Tests (20%):** Uses `@SpringBootTest` and Testcontainers (Postgres, RabbitMQ, Redis). Used for Repositories and Controllers.
*   **E2E Tests (10%):** Automated post-deployment tests.

## 2. Coverage Requirements
*   Minimum **80%** line coverage is enforced via JaCoCo. Pull requests falling below this threshold will fail the CI pipeline.

## 3. Test Naming Convention
Use the `Given_When_Then` naming strategy to make test intent clear.
*   *Example:* `givenInvalidEmail_whenRegisteringUser_thenThrowsValidationException()`

## 4. Mocking
*   Use `@Mock` and `@InjectMocks` for Unit tests.
*   Use `@MockBean` in Integration tests when you need to stub an external dependency (like a Feign Client) but keep the Spring Context intact.
