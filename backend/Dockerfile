# Stage 1: Build Java Application
FROM maven:3.9.6-eclipse-temurin-11-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build final executable JAR
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Production JRE Runtime
FROM eclipse-temurin:11-jre-alpine
WORKDIR /app

# Copy built jar file from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose HTTP Port
EXPOSE 8080

# Configure JVM memory limits for Cloud Run environment
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC"

# Execute application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
