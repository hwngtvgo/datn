# VPS Management Utilities

Bộ công cụ quản lý VPS và Docker cho dự án TOEIC Learning.

## 📁 Files

- `vps-utils.sh` - Script menu tương tác với đầy đủ tính năng
- `vps-aliases.sh` - Aliases nhanh cho các lệnh thường dùng

## 🚀 Cách sử dụng

### 1. Setup permissions

```bash
chmod +x vps-utils.sh vps-aliases.sh
```

### 2. Sử dụng script menu

```bash
./vps-utils.sh
```

Hoặc sử dụng quick commands:
```bash
./vps-utils.sh status    # Kiểm tra trạng thái
./vps-utils.sh restart   # Restart services
./vps-utils.sh logs      # Xem logs backend
./vps-utils.sh stop      # Stop services
./vps-utils.sh start     # Start services
```

### 3. Setup aliases (khuyến khích)

**⚠️ QUAN TRỌNG: Phải dùng `source` thay vì `./`**

```bash
# Sử dụng tạm thời (mất khi đóng terminal)
source vps-aliases.sh

# Hoặc thêm vào ~/.bashrc để load tự động
echo "source $(pwd)/vps-aliases.sh" >> ~/.bashrc
source ~/.bashrc
```

Sau khi source, test thử:
```bash
vps-help        # Xem danh sách lệnh
vps-status      # Kiểm tra containers
vps-health      # Health check tổng quát
```

## 📋 Danh sách lệnh

### Docker Management
- `vps-status` - Xem trạng thái containers
- `vps-start` - Start tất cả services
- `vps-stop` - Stop tất cả services
- `vps-restart` - Restart tất cả services

### Service Specific
- `vps-restart-be` - Restart backend only
- `vps-restart-fe` - Restart frontend only
- `vps-restart-db` - Restart database only
- `vps-restart-nginx` - Restart nginx

### Logs
- `vps-logs-be` - Logs backend (20 dòng cuối)
- `vps-logs-fe` - Logs frontend (20 dòng cuối)
- `vps-logs-db` - Logs database (20 dòng cuối)

### System Monitoring
- `vps-disk` - Kiểm tra disk space
- `vps-mem` - Kiểm tra memory usage
- `vps-ps` - Process đang chạy
- `vps-top` - Top processes
- `vps-health` - Health check tổng quát

### Maintenance
- `vps-pull` - Pull latest Docker images
- `vps-deploy` - Pull images và restart services
- `vps-prune` - Clean up Docker (xóa unused images/containers)
- `vps-update` - Check system package updates

### Database
- `vps-db-backup` - Backup database với timestamp
- `vps-db-connect` - Connect trực tiếp vào MySQL

### Network & SSL
- `vps-curl` - Test website accessibility
- `vps-ssl` - Check SSL certificate expiry

### General
- `vps-ssh` - SSH vào VPS
- `vps-help` - Hiển thị help

## 🛠️ Ví dụ sử dụng

### Kiểm tra tình trạng hệ thống
```bash
vps-health
```

### Restart backend sau khi deploy
```bash
vps-restart-be
```

### Xem logs khi có lỗi
```bash
vps-logs-be
```

### Backup database
```bash
vps-db-backup
```

### Deploy version mới
```bash
vps-deploy
```

### Troubleshooting
```bash
vps-status      # Xem containers có chạy không
vps-disk        # Kiểm tra disk space
vps-mem         # Kiểm tra memory
vps-logs-be     # Xem lỗi trong logs
```

## 🔧 Customization

Để thay đổi thông tin VPS, sửa các biến ở đầu file:

```bash
VPS_IP="YOUR_VPS_IP"
VPS_PASSWORD="YOUR_VPS_PASSWORD"
VPS_USER="root"
APP_DIR="/opt/toeic-app"
```

## ⚠️ Lưu ý bảo mật

- File chứa password VPS, cần bảo mật
- Không commit files này lên Git public
- Có thể dùng SSH keys thay vì password để bảo mật hơn

## 🚨 Emergency Commands

### Khi website down
```bash
vps-status      # Kiểm tra containers
vps-restart     # Restart tất cả
vps-logs-be     # Xem logs lỗi
```

### Khi hết disk space
```bash
vps-disk        # Kiểm tra dung lượng
vps-prune       # Xóa Docker unused files
```

### Khi memory cao
```bash
vps-mem         # Kiểm tra memory
vps-top         # Xem process nào dùng nhiều
vps-restart     # Restart để giải phóng memory
```

## 📞 Support

Gõ `vps-help` để xem danh sách lệnh đầy đủ. 