# Dependency Management

## 1. The Parent POM
All Spring Boot microservices must declare `com.ecommerce:parent-pom` as their parent. 

*   **Why?** The Parent POM centralized dependency management. It ensures that if Auth Service uses Jackson `2.15.2`, Order Service also uses `2.15.2`. This eliminates classpath conflicts during shared library imports.

## 2. Adding Dependencies
*   **Microservice `pom.xml`:** You should rarely define `<version>` tags in a microservice POM. The version should be inherited from the parent `<dependencyManagement>` section or the Spring Boot Starter Parent.
*   **Version Upgrades:** Upgrades (e.g., moving to a new Spring Cloud release train) are performed *once* in the `parent-pom`, tested, and then services inherit the upgrade upon rebuilding.

## 3. The Common Library
*   `com.ecommerce:common-library` is a dependency used by all services. 
*   **Rule:** Do NOT put domain-specific logic in `common-library`. It is strictly for cross-cutting concerns (Global Exception Handlers, Security Context Extractors, Pagination DTOs). Putting Product logic here creates a distributed monolith.
