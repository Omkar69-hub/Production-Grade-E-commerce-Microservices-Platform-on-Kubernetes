# Validation Guidelines

## 1. Bean Validation (JSR 380)
Always use standard `jakarta.validation.constraints` annotations on DTOs representing request bodies.
*   `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Email`.

## 2. Controller Enforcement
Always prefix request body parameters with `@Valid` in the Controller to trigger validation before the method executes.
```java
@PostMapping
public ResponseEntity<Void> create(@Valid @RequestBody CreateUserDto dto) { ... }
```

## 3. Centralized Validation Messages
Do not hardcode validation error messages in annotations. Use `messages.properties` to allow for i18n and standardized wording.
*   *Bad:* `@NotBlank(message = "First name is required")`
*   *Good:* `@NotBlank(message = "{validation.user.firstname.required}")`

## 4. Custom Validators
For complex rules (e.g., ensuring an end date is after a start date), create custom constraint annotations and validators (implementing `ConstraintValidator`) rather than polluting the Service layer with `if/throw` statements.
