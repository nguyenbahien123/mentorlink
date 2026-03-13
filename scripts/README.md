# 🛠️ Deployment Scripts

Thư mục này chứa các script tự động hóa việc deploy và quản lý VPS.

## 📜 Danh Sách Scripts

### 1. `setup-vps.sh` - Setup VPS lần đầu
**Mục đích**: Cài đặt tất cả dependencies cần thiết trên VPS Ubuntu mới

**Chạy trên**: VPS (Ubuntu 20.04+)

**Sử dụng**:
```bash
# Trên VPS
wget https://raw.githubusercontent.com/YOUR_USERNAME/Group02_MentorLink/main/scripts/setup-vps.sh
sudo bash setup-vps.sh
```

**Script này sẽ**:
- Update hệ thống
- Cài Docker & Docker Compose
- Cài Git, Nginx
- Cấu hình UFW firewall
- Tạo swap space
- Tối ưu hệ thống

---

### 2. `deploy.sh` - Deploy/Update ứng dụng
**Mục đích**: Pull code mới, rebuild và restart containers

**Chạy trên**: VPS (sau khi đã setup)

**Sử dụng**:
```bash
# Trên VPS
cd /var/www/Group02_MentorLink
bash scripts/deploy.sh
```

**Script này sẽ**:
- Backup database trước khi deploy
- Pull code mới từ Git
- Stop containers hiện tại
- Rebuild images
- Start containers mới
- Cleanup old images
- Hiển thị logs

---

### 3. `set-brevo-env.ps1` - Setup Brevo config (Windows)
**Mục đích**: Cập nhật Brevo API key an toàn trên máy local

**Chạy trên**: Windows (PowerShell)

**Sử dụng**:
```powershell
# Trên Windows
.\scripts\set-brevo-env.ps1
# Hoặc restart Docker sau khi update
.\scripts\set-brevo-env.ps1 -Restart
```

---

## 🔐 Bảo Mật

⚠️ **Quan trọng**:
- Tất cả các script đều KHÔNG chứa thông tin nhạy cảm
- Credentials được lấy từ file `.env` (không commit vào Git)
- Luôn kiểm tra script trước khi chạy với quyền root
- Backup database trước mọi thao tác quan trọng

---

## 📝 Ghi Chú

### Quyền thực thi
Scripts cần quyền thực thi. Nếu gặp lỗi "permission denied":
```bash
chmod +x scripts/*.sh
```

### Logs
Scripts sẽ ghi logs chi tiết. Nếu có lỗi, đọc kỹ output để debug.

### Rollback
Nếu deployment mới có vấn đề:
```bash
# Restore database từ backup
docker exec -i mentorlink-mysql mysql -uroot -pPASSWORD mentor_link < /backups/mysql/backup_YYYYMMDD.sql

# Checkout code cũ
git checkout COMMIT_HASH
docker compose up -d --build
```

---

## 🆘 Troubleshooting

### Script không chạy được
```bash
# Kiểm tra syntax
bash -n scripts/setup-vps.sh

# Chạy với debug mode
bash -x scripts/setup-vps.sh
```

### Docker command không hoạt động
```bash
# Restart Docker service
systemctl restart docker

# Check Docker status
systemctl status docker
```

### Permission denied khi chạy script
```bash
# Thêm quyền execute
chmod +x scripts/*.sh

# Hoặc chạy với sudo
sudo bash scripts/setup-vps.sh
```

---

## 📚 Tài Liệu Liên Quan

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Hướng dẫn deploy chi tiết
- [DEPLOY-COMMANDS.md](../DEPLOY-COMMANDS.md) - Quick reference commands
- [README.md](../README.md) - Project documentation
