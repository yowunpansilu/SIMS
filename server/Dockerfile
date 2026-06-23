# Build stage
FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew .
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY server/build.gradle.kts server/
COPY server/src server/src
COPY client client
# Give execution rights on the gradle wrapper
RUN chmod +x ./gradlew
# Build the application
RUN ./gradlew :server:bootJar -x test

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/server/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
