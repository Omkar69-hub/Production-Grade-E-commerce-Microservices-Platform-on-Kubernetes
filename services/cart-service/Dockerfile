# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring

# Install curl for healthchecks
RUN apk --no-cache add curl

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the app.jar to the non-root user
RUN chown spring:spring app.jar

# Use the non-root user
USER spring:spring

# Standardize on port 8080 inside the container
ENV SERVER_PORT=8080
EXPOSE 8080

# Define a healthcheck using curl against the actuator health endpoint
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application with production JVM options
ENTRYPOINT ["java", "-XX:+UseZGC", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
