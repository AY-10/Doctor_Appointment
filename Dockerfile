FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/
RUN apt-get update && apt-get install -y nodejs npm
RUN cd frontend && npm install && npm run build
RUN mkdir -p backend/src/main/resources/static && cp -r frontend/dist/* backend/src/main/resources/static/
WORKDIR /app/backend
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
