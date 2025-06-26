#!/bin/bash

# VPS Quick Aliases
# Thêm vào ~/.bashrc hoặc ~/.zshrc để sử dụng nhanh

VPS_IP="YOUR_VPS_IP"
VPS_PASSWORD="YOUR_VPS_PASSWORD"
VPS_USER="root"
APP_DIR="/opt/toeic-app"

# Base SSH command
alias vps-ssh="sshpass -p '$VPS_PASSWORD' ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP"

# Docker management
alias vps-status="vps-ssh 'cd $APP_DIR && docker-compose ps'"
alias vps-start="vps-ssh 'cd $APP_DIR && docker-compose up -d'"
alias vps-stop="vps-ssh 'cd $APP_DIR && docker-compose down'"
alias vps-restart="vps-ssh 'cd $APP_DIR && docker-compose restart'"
alias vps-logs-be="vps-ssh 'cd $APP_DIR && docker-compose logs backend | tail -20'"
alias vps-logs-fe="vps-ssh 'cd $APP_DIR && docker-compose logs frontend | tail -20'"
alias vps-logs-db="vps-ssh 'cd $APP_DIR && docker-compose logs mysql | tail -20'"

# System monitoring
alias vps-disk="vps-ssh 'df -h'"
alias vps-mem="vps-ssh 'free -h'"
alias vps-ps="vps-ssh 'ps aux | head -20'"
alias vps-top="vps-ssh 'top -bn1 | head -20'"

# Service specific
alias vps-restart-be="vps-ssh 'cd $APP_DIR && docker-compose restart backend'"
alias vps-restart-fe="vps-ssh 'cd $APP_DIR && docker-compose restart frontend'"
alias vps-restart-db="vps-ssh 'cd $APP_DIR && docker-compose restart mysql'"
alias vps-restart-nginx="vps-ssh 'docker restart nginx'"

# Maintenance
alias vps-pull="vps-ssh 'cd $APP_DIR && docker-compose pull'"
alias vps-deploy="vps-ssh 'cd $APP_DIR && docker-compose pull && docker-compose up -d'"
alias vps-prune="vps-ssh 'docker system prune -f'"
alias vps-update="vps-ssh 'apt update && apt list --upgradable'"

# Database
alias vps-db-backup="vps-ssh 'cd $APP_DIR && docker-compose exec mysql mysqldump -u toeic -pREDACTED_DB_PASSWORD toeic_learning > /tmp/backup_\$(date +%Y%m%d_%H%M%S).sql'"
alias vps-db-connect="vps-ssh 'cd $APP_DIR && docker-compose exec mysql mysql -u toeic -pREDACTED_DB_PASSWORD toeic_learning'"

# Network & SSL
alias vps-curl="vps-ssh 'curl -I https://www.toeicsoict.me'"
alias vps-ssl="vps-ssh 'echo | openssl s_client -servername www.toeicsoict.me -connect www.toeicsoict.me:443 2>/dev/null | openssl x509 -noout -dates'"

# Quick one-liners
alias vps-health="vps-ssh 'cd $APP_DIR && docker-compose ps && echo \"=== DISK SPACE ===\" && df -h && echo \"=== MEMORY ===\" && free -h'"

# Function to show all aliases
vps-help() {
    echo "VPS Management Aliases:"
    echo "======================="
    echo "Basic Docker:"
    echo "  vps-status      - Xem trạng thái containers"
    echo "  vps-start       - Start tất cả services"
    echo "  vps-stop        - Stop tất cả services"
    echo "  vps-restart     - Restart tất cả services"
    echo ""
    echo "Logs:"
    echo "  vps-logs-be     - Logs backend"
    echo "  vps-logs-fe     - Logs frontend"
    echo "  vps-logs-db     - Logs database"
    echo ""
    echo "System Monitor:"
    echo "  vps-disk        - Kiểm tra disk space"
    echo "  vps-mem         - Kiểm tra memory"
    echo "  vps-ps          - Process đang chạy"
    echo "  vps-top         - Top processes"
    echo ""
    echo "Service Specific:"
    echo "  vps-restart-be  - Restart backend only"
    echo "  vps-restart-fe  - Restart frontend only"
    echo "  vps-restart-db  - Restart database only"
    echo "  vps-restart-nginx - Restart nginx"
    echo ""
    echo "Maintenance:"
    echo "  vps-pull        - Pull latest images"
    echo "  vps-deploy      - Pull và restart"
    echo "  vps-prune       - Clean up Docker"
    echo "  vps-update      - Check system updates"
    echo ""
    echo "Database:"
    echo "  vps-db-backup   - Backup database"
    echo "  vps-db-connect  - Connect to database"
    echo ""
    echo "Network:"
    echo "  vps-curl        - Test website"
    echo "  vps-ssl         - Check SSL certificate"
    echo ""
    echo "General:"
    echo "  vps-ssh         - SSH vào VPS"
    echo "  vps-health      - Health check tổng quát"
    echo "  vps-help        - Hiển thị help này"
}

echo "VPS aliases đã được load! Gõ 'vps-help' để xem danh sách lệnh." 