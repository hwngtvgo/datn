#!/bin/bash

# Thông tin VPS
VPS_IP="YOUR_VPS_IP"
VPS_USER="root"
VPS_PASSWORD="YOUR_VPS_PASSWORD"
VPS_PORT="22"

# Màu sắc cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== DEPLOY ỨNG DỤNG TOEIC LÊN VPS ===${NC}"

# Hàm chạy lệnh trên VPS
run_remote_command() {
    echo -e "${YELLOW}Chạy trên VPS: $1${NC}"
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "$1"
}

# Hàm upload file/thư mục lên VPS
upload_to_vps() {
    echo -e "${YELLOW}Upload $1 lên VPS...${NC}"
    sshpass -p "$VPS_PASSWORD" rsync -avz -e "ssh -p $VPS_PORT -o StrictHostKeyChecking=no" "$1" "$VPS_USER@$VPS_IP:$2"
}

# 1. Tạo thư mục trên VPS
echo -e "${YELLOW}1. Tạo thư mục ứng dụng trên VPS...${NC}"
run_remote_command "mkdir -p /opt/toeic-app"

# 2. Upload docker-compose và các file cấu hình
echo -e "${YELLOW}2. Upload docker-compose và file cấu hình...${NC}"
upload_to_vps "../../docker-compose.production.yml" "/opt/toeic-app/docker-compose.yml"
upload_to_vps "../Dumpdatn.sql" "/opt/toeic-app/"

# 3. Cài đặt Docker nếu chưa có
echo -e "${YELLOW}3. Kiểm tra và cài đặt Docker...${NC}"
run_remote_command "
if ! command -v docker &> /dev/null; then
    echo 'Cài đặt Docker...'
    apt update
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    echo 'Docker đã được cài đặt!'
else
    echo 'Docker đã có sẵn'
fi
"

# 4. Cài đặt Docker Compose nếu chưa có
echo -e "${YELLOW}4. Kiểm tra và cài đặt Docker Compose...${NC}"
run_remote_command "
if ! command -v docker-compose &> /dev/null; then
    echo 'Cài đặt Docker Compose...'
    curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo 'Docker Compose đã được cài đặt!'
else
    echo 'Docker Compose đã có sẵn'
fi
"

# 5. Dừng các container cũ nếu có
echo -e "${YELLOW}5. Dừng các container cũ...${NC}"
run_remote_command "cd /opt/toeic-app && docker-compose down || true"

# 6. Cập nhật cấu hình docker-compose.yml để tăng timeout và kích thước file upload
echo -e "${YELLOW}6. Cập nhật cấu hình để tăng timeout và kích thước file upload...${NC}"
run_remote_command "
cd /opt/toeic-app && 
sed -i '/FILE_ALLOWED_EXTENSIONS/a\\      # Cấu hình timeout và kích thước file\\n      SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE: 50MB\\n      SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE: 100MB\\n      SERVER_TOMCAT_CONNECTION_TIMEOUT: 300000\\n      SERVER_TOMCAT_MAX_THREADS: 200\\n      SERVER_CONNECTION_TIMEOUT: 300000' docker-compose.yml
"

# 7. Pull các image mới nhất
echo -e "${YELLOW}7. Pull các Docker image mới nhất...${NC}"
run_remote_command "cd /opt/toeic-app && docker-compose pull"

# 8. Khởi động ứng dụng
echo -e "${YELLOW}8. Khởi động ứng dụng...${NC}"
run_remote_command "cd /opt/toeic-app && docker-compose up -d"

# 9. Kiểm tra trạng thái
echo -e "${YELLOW}9. Kiểm tra trạng thái các container...${NC}"
run_remote_command "cd /opt/toeic-app && docker-compose ps"

# 10. Kiểm tra logs
echo -e "${YELLOW}10. Kiểm tra logs backend...${NC}"
run_remote_command "cd /opt/toeic-app && docker-compose logs backend | tail -20"

echo -e "${GREEN}=== DEPLOY HOÀN THÀNH ===${NC}"
echo -e "${GREEN}Frontend: http://$VPS_IP${NC}"
echo -e "${GREEN}Backend API: http://$VPS_IP:8080${NC}"
echo -e "${GREEN}Swagger UI: http://$VPS_IP:8080/swagger-ui.html${NC}"

echo -e "${YELLOW}Để xem logs realtime:${NC}"
echo -e "sshpass -p '$VPS_PASSWORD' ssh -p $VPS_PORT $VPS_USER@$VPS_IP 'cd /opt/toeic-app && docker-compose logs -f'" 