# GYMETRA Membership Service Dockerfile
FROM maven:3.9.4-openjdk-17 AS build

WORKDIR /app

# Copiar archivos de configuración Maven
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Descargar dependencias
RUN mvn dependency:go-offline

# Copiar código fuente
COPY src ./src

# Build de la aplicación
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM openjdk:17-jre-slim

WORKDIR /app

# Copiar el jar generado
COPY --from=build /app/target/*.jar app.jar

# Crear usuario no root para seguridad
RUN addgroup --system spring && adduser --system --group spring
USER spring:spring

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
