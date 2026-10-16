FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/build/libs/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
