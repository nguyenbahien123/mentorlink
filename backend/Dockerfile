# BƯỚC 1: Build stage - Biên dịch ứng dụng
FROM maven:3.9-eclipse-temurin-17 AS build

# Giải thích: Sử dụng image maven với Java 17 để build ứng dụng
# AS build: Đặt tên cho stage này để sử dụng sau

WORKDIR /app

# Copy file pom.xml trước để tận dụng Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code
COPY src ./src

# Build ứng dụng, skip tests để build nhanh hơn
RUN mvn clean package -DskipTests


# BƯỚC 2: Runtime stage - Chạy ứng dụng
FROM eclipse-temurin:17-jre-alpine

# Giải thích: Sử dụng JRE (không cần JDK đầy đủ) để giảm kích thước image
# Alpine: Linux distribution nhỏ gọn

WORKDIR /app

# Copy file JAR từ build stage
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục uploads (nếu cần lưu file)
RUN mkdir -p /app/uploads/certificates /app/uploads/experiences /app/uploads/tests

# Expose port 8080
EXPOSE 8080

# Chạy ứng dụng - profile sẽ được lấy từ biến môi trường SPRING_PROFILES_ACTIVE
ENTRYPOINT ["java", "-jar", "app.jar"]

#docker run -d --name mentorlink-backend -p 8080:8080 mentorlink-backend:latest