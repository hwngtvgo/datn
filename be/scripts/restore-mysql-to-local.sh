#!/bin/bash

# Thông tin MySQL local
LOCAL_CONTAINER="mysql-toeic"  # Tên container MySQL trên máy local
LOCAL_USER="root"
LOCAL_PASSWORD="root"  # Mật khẩu MySQL local
LOCAL_DATABASE="toeic_db"  # Tên database sẽ restore vào - đồng nhất với VPS

# Thư mục chứa file backup
BACKUP_DIR="./mysql_backups"

# Màu sắc cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== RESTORE DATABASE VÀO MYSQL LOCAL ===${NC}"

# Kiểm tra thư mục backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Không tìm thấy thư mục backup: $BACKUP_DIR${NC}"
    exit 1
fi

# Liệt kê các file backup
echo -e "${YELLOW}Các file backup hiện có:${NC}"
ls -lh $BACKUP_DIR

# Hỏi người dùng chọn file backup
echo -e "${YELLOW}Nhập tên file backup (không bao gồm đường dẫn):${NC}"
read -p "$BACKUP_DIR/" BACKUP_FILE

# Kiểm tra file backup
FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
if [ ! -f "$FULL_BACKUP_PATH" ]; then
    echo -e "${RED}Không tìm thấy file backup: $FULL_BACKUP_PATH${NC}"
    exit 1
fi

# Kiểm tra kích thước file
FILE_SIZE=$(stat -c%s "$FULL_BACKUP_PATH")
echo -e "${YELLOW}Kích thước file backup: $(du -h "$FULL_BACKUP_PATH" | cut -f1)${NC}"

# Kiểm tra container MySQL
echo -e "${YELLOW}Kiểm tra container MySQL local...${NC}"
if ! docker ps | grep -q "$LOCAL_CONTAINER"; then
    echo -e "${RED}Container MySQL '$LOCAL_CONTAINER' không chạy hoặc không tồn tại!${NC}"
    echo -e "${RED}Vui lòng đảm bảo container MySQL đang chạy.${NC}"
    exit 1
fi

# Tạo database nếu chưa tồn tại
echo -e "${YELLOW}Tạo database $LOCAL_DATABASE nếu chưa tồn tại...${NC}"
docker exec -i $LOCAL_CONTAINER mysql -u$LOCAL_USER -p$LOCAL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $LOCAL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Xác nhận restore
echo -e "${RED}CẢNH BÁO: Restore sẽ xóa tất cả dữ liệu hiện có trong database $LOCAL_DATABASE.${NC}"
read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    # Restore database
    echo -e "${YELLOW}Đang restore database từ file $BACKUP_FILE...${NC}"
    echo -e "${YELLOW}Quá trình này có thể mất vài phút tùy thuộc vào kích thước file backup.${NC}"
    
    # Thực hiện restore
    cat "$FULL_BACKUP_PATH" | docker exec -i $LOCAL_CONTAINER mysql -u$LOCAL_USER -p$LOCAL_PASSWORD $LOCAL_DATABASE
    
    # Kiểm tra kết quả
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Restore database thành công!${NC}"
        
        # Kiểm tra số lượng bảng
        echo -e "${YELLOW}Kiểm tra số lượng bảng trong database...${NC}"
        docker exec -i $LOCAL_CONTAINER mysql -u$LOCAL_USER -p$LOCAL_PASSWORD -e "SELECT COUNT(*) AS 'Số lượng bảng' FROM information_schema.tables WHERE table_schema = '$LOCAL_DATABASE';" | grep -v "Số lượng bảng"
        
        echo -e "${GREEN}=== RESTORE HOÀN THÀNH ===${NC}"
    else
        echo -e "${RED}Restore database thất bại!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Đã hủy restore database.${NC}"
    exit 0
fi 