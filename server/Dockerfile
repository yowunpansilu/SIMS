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
# Build the application using the pre-installed Gradle to bypass wrapper download timeouts
ENV GRADLE_USER_HOME=/app/.gradle
RUN --mount=type=cache,target=/app/.gradle gradle :server:bootJar -x test

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/server/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
