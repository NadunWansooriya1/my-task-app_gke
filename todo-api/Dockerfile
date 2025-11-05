# Stage 1: Build the application
# This stage uses a full Maven and JDK image to build your .jar file
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
# This is done first to cache the dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the rest of the source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final, small image
# This stage uses a lightweight Java Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl (used by the health check in docker-compose.yml)
RUN apk add --no-cache curl

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the port Spring Boot runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]