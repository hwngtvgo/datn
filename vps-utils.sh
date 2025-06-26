#!/bin/bash

# VPS Management Utility Script
# Các lệnh thông dụng để quản lý VPS và Docker

VPS_IP="YOUR_VPS_IP"
VPS_PASSWORD="YOUR_VPS_PASSWORD"
VPS_USER="root"
APP_DIR="/opt/toeic-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to execute command on VPS
execute_vps_cmd() {
    local cmd="$1"
    echo -e "${BLUE}[VPS] Đang thực thi: $cmd${NC}"
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "$cmd"
}

# Function to show menu
show_menu() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    VPS & Docker Management Utility    ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo "1.  Kiểm tra trạng thái các container"
    echo "2.  Khởi động lại tất cả services"
    echo "3.  Dừng tất cả services"
    echo "4.  Khởi động tất cả services"
    echo "5.  Xem logs backend (20 dòng cuối)"
    echo "6.  Xem logs frontend (20 dòng cuối)"
    echo "7.  Xem logs mysql (20 dòng cuối)"
    echo "8.  Xem logs nginx (20 dòng cuối)"
    echo "9.  Pull images mới và restart"
    echo "10. Rebuild backend từ source"
    echo "11. Kiểm tra disk space"
    echo "12. Kiểm tra memory usage"
    echo "13. Kiểm tra network connectivity"
    echo "14. Backup database"
    echo "15. Clean up Docker (prune)"
    echo "16. Xem process đang chạy"
    echo "17. Restart nginx"
    echo "18. Kiểm tra SSL certificate"
    echo "19. Update system packages"
    echo "20. Reboot VPS"
    echo "0.  Thoát"
    echo -e "${GREEN}========================================${NC}"
}

# 1. Check container status
check_status() {
    execute_vps_cmd "cd $APP_DIR && docker-compose ps"
}

# 2. Restart all services
restart_all() {
    echo -e "${YELLOW}Đang khởi động lại tất cả services...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose restart"
}

# 3. Stop all services
stop_all() {
    echo -e "${YELLOW}Đang dừng tất cả services...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose down"
}

# 4. Start all services
start_all() {
    echo -e "${YELLOW}Đang khởi động tất cả services...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose up -d"
}

# 5-8. View logs
view_backend_logs() {
    execute_vps_cmd "cd $APP_DIR && docker-compose logs backend | tail -20"
}

view_frontend_logs() {
    execute_vps_cmd "cd $APP_DIR && docker-compose logs frontend | tail -20"
}

view_mysql_logs() {
    execute_vps_cmd "cd $APP_DIR && docker-compose logs mysql | tail -20"
}

view_nginx_logs() {
    execute_vps_cmd "docker logs nginx 2>&1 | tail -20"
}

# 9. Pull and restart
pull_and_restart() {
    echo -e "${YELLOW}Đang pull images mới và restart...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose pull && docker-compose up -d"
}

# 10. Rebuild backend
rebuild_backend() {
    echo -e "${YELLOW}Đang rebuild backend...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose pull backend && docker-compose up -d backend"
}

# 11. Check disk space
check_disk() {
    execute_vps_cmd "df -h"
}

# 12. Check memory
check_memory() {
    execute_vps_cmd "free -h"
}

# 13. Check network
check_network() {
    execute_vps_cmd "curl -I https://www.toeicsoict.me"
}

# 14. Backup database
backup_database() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${YELLOW}Đang backup database...${NC}"
    execute_vps_cmd "cd $APP_DIR && docker-compose exec mysql mysqldump -u toeic -pREDACTED_DB_PASSWORD toeic_learning > /tmp/$backup_file && echo 'Backup saved to /tmp/$backup_file'"
}

# 15. Docker cleanup
docker_cleanup() {
    echo -e "${YELLOW}Đang cleanup Docker...${NC}"
    execute_vps_cmd "docker system prune -f"
}

# 16. Check processes
check_processes() {
    execute_vps_cmd "ps aux | head -20"
}

# 17. Restart nginx
restart_nginx() {
    execute_vps_cmd "docker restart nginx"
}

# 18. Check SSL
check_ssl() {
    execute_vps_cmd "echo | openssl s_client -servername www.toeicsoict.me -connect www.toeicsoict.me:443 2>/dev/null | openssl x509 -noout -dates"
}

# 19. Update system
update_system() {
    echo -e "${YELLOW}Đang update system packages...${NC}"
    execute_vps_cmd "apt update && apt upgrade -y"
}

# 20. Reboot VPS
reboot_vps() {
    echo -e "${RED}CẢNH BÁO: Bạn có chắc muốn reboot VPS? (y/N)${NC}"
    read -r confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        execute_vps_cmd "reboot"
    else
        echo "Đã hủy reboot."
    fi
}

# Quick commands (can be called directly)
quick_restart() {
    restart_all
}

quick_status() {
    check_status
}

quick_logs() {
    view_backend_logs
}

# Main menu loop
main() {
    # Check if argument provided for quick commands
    case "$1" in
        "status") quick_status; exit 0 ;;
        "restart") quick_restart; exit 0 ;;
        "logs") quick_logs; exit 0 ;;
        "stop") stop_all; exit 0 ;;
        "start") start_all; exit 0 ;;
    esac

    while true; do
        show_menu
        echo -n "Chọn tùy chọn (0-20): "
        read -r choice
        
        case $choice in
            1) check_status ;;
            2) restart_all ;;
            3) stop_all ;;
            4) start_all ;;
            5) view_backend_logs ;;
            6) view_frontend_logs ;;
            7) view_mysql_logs ;;
            8) view_nginx_logs ;;
            9) pull_and_restart ;;
            10) rebuild_backend ;;
            11) check_disk ;;
            12) check_memory ;;
            13) check_network ;;
            14) backup_database ;;
            15) docker_cleanup ;;
            16) check_processes ;;
            17) restart_nginx ;;
            18) check_ssl ;;
            19) update_system ;;
            20) reboot_vps ;;
            0) echo -e "${GREEN}Tạm biệt!${NC}"; exit 0 ;;
            *) echo -e "${RED}Lựa chọn không hợp lệ!${NC}" ;;
        esac
        
        echo
        echo -e "${BLUE}Nhấn Enter để tiếp tục...${NC}"
        read -r
        clear
    done
}

# Make the script executable and run
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 