# ==========================================
# Stage 1: Build
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy notification-service Maven project
COPY shared /shared
RUN mvn -f /shared/parent-pom/pom.xml install -N
RUN mvn -f /shared/common-library/pom.xml install -DskipTests
COPY services/notification-service/pom.xml ./pom.xml
COPY services/notification-service/src ./src

# Build the application
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Runtime
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
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
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=180s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Configurable JVM options (defaults to ZGC, can be overridden with SerialGC for low-memory staging)
ENV JAVA_OPTS="-XX:+UseZGC -Xms256m -Xmx512m"

# Start application with signal-forwarding exec
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
