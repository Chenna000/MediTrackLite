# ---- Stage 1: Build Spring Boot App ----
FROM maven:3.9.4-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy backend source
COPY backend /app

# Package the application (skip tests for faster builds)
RUN mvn clean package -DskipTests

# ---- Stage 2: Run Spring Boot App ----
FROM eclipse-temurin:17-jdk

# Create working directory
WORKDIR /app

# Copy JAR file from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
