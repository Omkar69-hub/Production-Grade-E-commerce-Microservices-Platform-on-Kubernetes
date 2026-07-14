# Common Library

This library contains shared DTOs, Exceptions, Constants, and Configuration classes used across all microservices.

## Usage
Add this as a dependency in your microservice's `pom.xml`:

```xml
<dependency>
    <groupId>com.ecommerce</groupId>
    <artifactId>common-library</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

## Structure
- `com.ecommerce.common.handler`: Global Exception Handler
- `com.ecommerce.common.security`: JWT Utilities
- `com.ecommerce.common.dto`: Base DTOs
