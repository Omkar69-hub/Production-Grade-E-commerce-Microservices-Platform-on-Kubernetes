FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY shared /shared
RUN mvn -f /shared/parent-pom/pom.xml install -N
RUN mvn -f /shared/common-library/pom.xml install -DskipTests
COPY services/cart-service/pom.xml ./pom.xml
COPY services/cart-service/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
RUN apk --no-cache add curl

COPY --from=builder /app/target/*.jar app.jar

RUN chown spring:spring app.jar

USER spring:spring

ENV SERVER_PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=180s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Configurable JVM options (defaults to ZGC, can be overridden with SerialGC for low-memory staging)
ENV JAVA_OPTS="-XX:+UseZGC -Xms256m -Xmx512m"

# Start application with signal-forwarding exec
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
