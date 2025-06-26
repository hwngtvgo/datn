#!/bin/bash

# Cấu hình Docker Hub
DOCKER_USERNAME="hwngtv"
BACKEND_IMAGE="$DOCKER_USERNAME/toeic-backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/toeic-frontend"
TAG="latest"

# Màu sắc cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BUILD VÀ PUSH DOCKER IMAGES ===${NC}"

# Kiểm tra đăng nhập Docker Hub
echo -e "${YELLOW}1. Kiểm tra đăng nhập Docker Hub...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${RED}Vui lòng đăng nhập Docker Hub trước:${NC}"
    echo "docker login"
    exit 1
fi

# Build JAR file với Maven
echo -e "${YELLOW}1.5. Build JAR file với Maven...${NC}"
cd ../
if ./mvnw clean package -DskipTests; then
    echo -e "${GREEN}✅ Build JAR file thành công!${NC}"
else
    echo -e "${RED}❌ Build JAR file thất bại!${NC}"
    exit 1
fi

# Build Backend
echo -e "${YELLOW}2. Build Backend Docker Image...${NC}"
if docker build -t $BACKEND_IMAGE:$TAG .; then
    echo -e "${GREEN}✅ Build backend thành công!${NC}"
else
    echo -e "${RED}❌ Build backend thất bại!${NC}"
    exit 1
fi
cd -

# Build Frontend
echo -e "${YELLOW}3. Build Frontend Docker Image...${NC}"
cd ../../fe
if docker build -t $FRONTEND_IMAGE:$TAG .; then
    echo -e "${GREEN}✅ Build frontend thành công!${NC}"
else
    echo -e "${RED}❌ Build frontend thất bại!${NC}"
    exit 1
fi
cd -

# Push Backend to Docker Hub
echo -e "${YELLOW}4. Push Backend Image lên Docker Hub...${NC}"
if docker push $BACKEND_IMAGE:$TAG; then
    echo -e "${GREEN}✅ Push backend thành công!${NC}"
else
    echo -e "${RED}❌ Push backend thất bại!${NC}"
    exit 1
fi

# Push Frontend to Docker Hub
echo -e "${YELLOW}5. Push Frontend Image lên Docker Hub...${NC}"
if docker push $FRONTEND_IMAGE:$TAG; then
    echo -e "${GREEN}✅ Push frontend thành công!${NC}"
else
    echo -e "${RED}❌ Push frontend thất bại!${NC}"
    exit 1
fi

echo -e "${GREEN}=== HOÀN THÀNH ===${NC}"
echo -e "${GREEN}Backend Image: $BACKEND_IMAGE:$TAG${NC}"
echo -e "${GREEN}Frontend Image: $FRONTEND_IMAGE:$TAG${NC}"

# Hiển thị kích thước images
echo -e "${YELLOW}Kích thước Images:${NC}"
docker images | grep -E "(toeic-backend|toeic-frontend)"

echo -e "${YELLOW}Bây giờ bạn có thể chạy deploy:${NC}"
echo -e "./deploy-to-vps.sh" 