# Enterprise Coding Standards

## 1. SOLID Principles
Every developer must adhere strictly to SOLID principles:
- **S**ingle Responsibility Principle: Classes and methods should have only one reason to change.
- **O**pen/Closed Principle: Open for extension, closed for modification.
- **L**iskov Substitution Principle: Subtypes must be substitutable for their base types.
- **I**nterface Segregation Principle: Client-specific interfaces are better than general-purpose ones.
- **D**ependency Inversion Principle: Depend on abstractions, not concretions.

## 2. Naming Conventions
- **Packages:** `com.ecommerce.{service}.{module}` (e.g., `com.ecommerce.order.domain`). Always lowercase.
- **Classes/Interfaces:** PascalCase. Use descriptive nouns.
- **Methods:** camelCase. Use strong verbs (e.g., `calculateTotal`, `findOrderById`).
- **Constants:** UPPER_SNAKE_CASE.
- **Variables:** camelCase. Keep names descriptive; avoid single-letter variables except in very short loops.

## 3. Dependency Injection
- Always use **Constructor Injection** via `@RequiredArgsConstructor` (Lombok) instead of `@Autowired` field injection. Field injection makes unit testing difficult and hides dependency bloat.

## 4. Immutability
- Prefer immutable data structures. Use `final` for variables that should not change.
- DTOs and Requests/Responses should use `@Value` or `record` types where possible, or `@Data` with strict control.

## 5. Clean Code & Code Formatting
- Follow standard Java format conventions (e.g., Google Java Style Guide).
- Maximum line length is 120 characters.
- Keep methods short (under 20-30 lines ideally).
- Avoid deep nesting (max 2-3 levels of indentation).

## 6. Documentation
- Use JavaDoc for all public APIs, interfaces, and complex business logic.
- Avoid obvious comments (e.g., `// Gets the user` above a `getUser()` method). Comments should explain *why*, not *what*.
