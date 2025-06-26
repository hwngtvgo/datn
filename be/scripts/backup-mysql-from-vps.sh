#!/bin/bash

# Thông tin VPS (lấy từ deploy-to-vps.sh)
VPS_IP="YOUR_VPS_IP"
VPS_USER="root"
VPS_PASSWORD="YOUR_VPS_PASSWORD"
VPS_PORT="22"

# Thông tin MySQL (từ docker-compose.production.yml)
MYSQL_ROOT_PASSWORD="REDACTED_DB_PASSWORD"
MYSQL_DATABASE="toeic_db"

# Thư mục lưu backup trên local
BACKUP_DIR="./mysql_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="toeic_db_backup_${TIMESTAMP}.sql"

# Màu sắc cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BACKUP DATABASE TỪ VPS ===${NC}"

# Tạo thư mục backup nếu chưa tồn tại
mkdir -p $BACKUP_DIR

# Hàm chạy lệnh trên VPS
run_remote_command() {
    echo -e "${YELLOW}Chạy trên VPS: $1${NC}"
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_IP" "$1"
}

# Hàm download file từ VPS
download_from_vps() {
    echo -e "${YELLOW}Download $1 từ VPS...${NC}"
    sshpass -p "$VPS_PASSWORD" scp -P "$VPS_PORT" -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP:$1" "$2"
}

# 1. Kiểm tra các container đang chạy
echo -e "${YELLOW}1. Kiểm tra các container đang chạy...${NC}"
run_remote_command "docker ps | grep mysql"

# 2. Tạo backup từ container MySQL
echo -e "${YELLOW}2. Tạo backup database từ container MySQL...${NC}"
run_remote_command "docker exec \$(docker ps -qf \"name=mysql\") mysqldump -u root -p${MYSQL_ROOT_PASSWORD} --databases ${MYSQL_DATABASE} --add-drop-database > /tmp/${BACKUP_FILENAME}"

# 3. Kiểm tra kích thước file backup
echo -e "${YELLOW}3. Kiểm tra kích thước file backup...${NC}"
run_remote_command "ls -lh /tmp/${BACKUP_FILENAME}"

# 4. Download file backup về local
echo -e "${YELLOW}4. Download file backup về local...${NC}"
download_from_vps "/tmp/${BACKUP_FILENAME}" "${BACKUP_DIR}/${BACKUP_FILENAME}"

# 5. Xóa file backup tạm trên VPS
echo -e "${YELLOW}5. Xóa file backup tạm trên VPS...${NC}"
run_remote_command "rm /tmp/${BACKUP_FILENAME}"

# 6. Kiểm tra file backup trên local
echo -e "${YELLOW}6. Kiểm tra file backup trên local...${NC}"
ls -lh "${BACKUP_DIR}/${BACKUP_FILENAME}"

echo -e "${GREEN}=== BACKUP HOÀN THÀNH ===${NC}"
echo -e "${GREEN}File backup: ${BACKUP_DIR}/${BACKUP_FILENAME}${NC}"

# Hướng dẫn khôi phục (restore) database từ file backup
echo -e "${YELLOW}Để khôi phục database từ file backup:${NC}"
echo -e "mysql -u [username] -p [database_name] < ${BACKUP_DIR}/${BACKUP_FILENAME}"
echo -e "Hoặc nếu sử dụng Docker:"
echo -e "docker exec -i [container_name] mysql -u [username] -p[password] < ${BACKUP_DIR}/${BACKUP_FILENAME}" 