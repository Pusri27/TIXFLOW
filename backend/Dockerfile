# Stage 1: Build Java Application
FROM maven:3.9.6-eclipse-temurin-11-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build final executable JAR
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Production JRE Runtime (Hugging Face Spaces Compatible — UID 1000, Port 7860)
FROM eclipse-temurin:11-jre-alpine

# Create non-root user (UID 1000 required by Hugging Face Spaces)
RUN adduser -D -u 1000 user

WORKDIR /app

# Copy built jar file from builder
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R user:user /app

USER user

# Hugging Face Spaces default port (also works with custom PORT env var)
ENV PORT=7860
EXPOSE 7860

# Configure JVM memory limits (safe for 512MB RAM Free Tier such as Render)
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Execute application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
