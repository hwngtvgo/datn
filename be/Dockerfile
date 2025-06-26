# Single-stage build from pre-built JAR
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# Set working directory
WORKDIR /app

# Copy pre-built jar
COPY target/*.jar app.jar

# Create upload directories
RUN mkdir -p uploads/audio uploads/images logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 