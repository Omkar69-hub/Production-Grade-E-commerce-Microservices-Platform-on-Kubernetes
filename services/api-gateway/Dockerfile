# ==========================================
# Stage 1: Build
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy API Gateway Maven project
COPY services/api-gateway/pom.xml ./pom.xml
COPY services/api-gateway/src ./src

# Build the application
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Runtime
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Give ownership to non-root user
RUN chown spring:spring app.jar

# Run as non-root user
USER spring:spring

# Application port
ENV SERVER_PORT=8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start application
ENTRYPOINT ["java", "-XX:+UseZGC", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]