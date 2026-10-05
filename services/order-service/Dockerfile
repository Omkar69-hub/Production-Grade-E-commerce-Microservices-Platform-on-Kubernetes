FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY services/order-service/pom.xml ./pom.xml
COPY services/order-service/src ./src

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

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseZGC", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]