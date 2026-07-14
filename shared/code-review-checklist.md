# Code Review Checklist

Reviewers MUST verify the following before approving a Pull Request:

## 1. Architecture & Design
- [ ] Does this change belong in this microservice, or does it leak domain boundaries?
- [ ] Are SOLID principles followed?
- [ ] Are DTOs used for all API boundaries (no exposing JPA Entities to controllers)?

## 2. Performance
- [ ] Are there any N+1 query problems introduced in Hibernate?
- [ ] Are appropriate indexes used for new database queries?
- [ ] Are remote HTTP calls or DB calls executed inside tight loops?

## 3. Security
- [ ] Are endpoints properly secured with `@PreAuthorize` where necessary?
- [ ] Are user inputs validated using `@Valid`?
- [ ] Are any secrets accidentally hardcoded?

## 4. Testing
- [ ] Are there JUnit tests covering both happy paths and edge cases/exceptions?
- [ ] Do integration tests use Testcontainers instead of H2 for accurate DB simulation?
- [ ] Does the JaCoCo coverage report meet the 80% threshold?

## 5. Maintainability & Standards
- [ ] Do methods and variables have descriptive names?
- [ ] Is complex logic documented with clear JavaDocs?
- [ ] Is error handling relying on standard Custom Exceptions rather than returning magic strings or numbers?
- [ ] Are there any `TODO` comments left behind? (Must be converted to JIRA tickets).
