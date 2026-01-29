# MentorLink - Nền Tảng Kết Nối Giáo Viên

> Ứng dụng web kết nối mentors và students, hỗ trợ booking, chat, thanh toán, ...

**⚠️ Security Note**: All sensitive data has been removed. This repo is safe for GitHub. See [CLEANUP-STATUS.md](CLEANUP-STATUS.md) for details.

> Ứng dụng web kết nối mentors và students, hỗ trợ booking, chat, thanh toán, ...

---

## � Deploy Hướng Dẫn

👉 **[GETTING-STARTED.md](GETTING-STARTED.md)** - Đọc đây trước tiên

### Lựa Chọn Hướng Dẫn:
- **[DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md)** ⭐ - 5 bước siêu dễ
- **[DEPLOY-CHECKLIST-SIMPLE.md](DEPLOY-CHECKLIST-SIMPLE.md)** - Checklist in ra
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Hướng dẫn chi tiết
- **[DEPLOY-NO-GITHUB.md](DEPLOY-NO-GITHUB.md)** - Deploy không GitHub
- **[SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md)** - Bảo mật

---

## 🚀 Bắt Đầu Deploy Ngay (Chọn 1 Trong 4)

### ⭐ **RECOMMENDED** - Siêu Đơn Giản (5 bước)
👉 **[DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md)**
- Copy-paste từng lệnh
- ~20 phút (lần đầu)
- Không cần GitHub

### 📋 Với Checklist In Ra
👉 **[DEPLOY-CHECKLIST-SIMPLE.md](DEPLOY-CHECKLIST-SIMPLE.md)**
- In ra và ticked mỗi bước
- Visual step-by-step
- Dễ theo dõi nhất

### 📸 Với Visual Guide
👉 **[DEPLOY-VISUAL.md](DEPLOY-VISUAL.md)**
- Mô tả chi tiết mỗi step
- Thấy screen output trước
- Không bỡ ngỡ gì

### 🔐 An Toàn & Không GitHub
👉 **[DEPLOY-NO-GITHUB.md](DEPLOY-NO-GITHUB.md)**
- SCP/Zip (không push GitHub)
- Chi tiết 2 phương pháp
- Giải thích bảo mật

---

## 🖥️ Deployment

Để deploy lên VPS, xem hướng dẫn trong [DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md).

⚠️ **Note**: VPS credentials được cấp riêng - KHÔNG push lên GitHub

---

## 📁 Project Structure

```
Group02_MentorLink/
├── frontend/                 # React + Vite
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── docker-compose.yml        # Development
├── docker-compose.prod.yml   # Production
├── nginx.conf                # Reverse proxy
├── scripts/
│   ├── setup-vps.sh         # VPS setup (run once)
│   ├── deploy.sh            # Auto deploy script
│   └── deploy-to-vps.ps1    # Windows PowerShell script
├── .env.example             # Template (NO secrets)
├── .env.production          # Production template
├── DEPLOY-SIMPLE.md         # ⭐ START HERE
├── DEPLOY-NO-GITHUB.md      # No GitHub method
└── DEPLOYMENT.md            # Full guide
```

---

## 🔧 Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** / Custom CSS
- **Axios** for API
- **TinyMCE** for rich text
- **Responsive design**

### Backend
- **Spring Boot 3.x**
- **MySQL 8.0**
- **Spring Security + JWT**
- **WebSocket** for real-time chat
- **Cloudinary** for file upload
- **Brevo** for email
- **PayOS** for payments
- **Swagger/OpenAPI**

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** reverse proxy
- **UFW** firewall

---

## 📝 Environment Variables

### Cần Chuẩn Bị (Lấy từ service providers)

```
BREVO_API_KEY          # Email service (https://app.brevo.com)
PAYOS_CLIENT_ID        # Payment gateway (https://my.payos.vn)
PAYOS_API_KEY
PAYOS_CHECKSUM_KEY
CLOUDINARY_CLOUD_NAME  # File upload (https://cloudinary.com)
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
JWT_*                  # Security keys (generate new)
```

### Bạn CÓ THỂ bỏ qua tạm thời:
- Nếu không có keys, deploy vẫn được, setup sau cũng được
- Các tính năng tương ứng sẽ bị disabled tạm thời

---

## 🐳 Development (Local Machine)

### Cài Đặt

```bash
# Clone project
git clone https://github.com/YOUR_USERNAME/Group02_MentorLink.git
cd Group02_MentorLink

# Copy env template
cp .env.example .env
nano .env  # Điền thông tin nếu có

# Run with Docker
docker compose up -d

# Hoặc run Spring Boot + Node.js manually
# Frontend: cd frontend && npm install && npm run dev
# Backend: cd backend && mvn spring-boot:run
```

### Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- MySQL: localhost:3306

---

## 🌍 Production (VPS)

### Quick Deploy

```bash
# 1. Local: Zip code
.\deploy-to-vps.ps1

# 2. VPS: Setup & deploy
ssh root@YOUR_VPS_IP
cd /var/www
unzip /tmp/mentor-code.zip -d Group02_MentorLink
cd Group02_MentorLink
bash scripts/setup-vps.sh
cp .env.production .env
nano .env  # Điền thông tin
docker compose up -d --build
```

**Website**: http://YOUR_VPS_IP_OR_DOMAIN

### Update Code

```bash
# Update lần sau
./deploy-to-vps.ps1  # Local

# SSH to VPS
cd /var/www/Group02_MentorLink
unzip /tmp/mentor-code.zip -d . && docker compose up -d --build
```

---

## 🔍 Kiểm Tra Hoạt Động

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Xem containers
docker compose ps

# Xem logs
docker compose logs -f

# Test API
curl http://YOUR_VPS_IP_OR_DOMAIN/api/health

# Xem resource usage
docker stats
```

---

## 📚 Documentation Files

| File | Dùng Cho |
|------|---------|
| **DEPLOY-SIMPLE.md** | ⭐ Bắt đầu (5 steps) |
| **DEPLOY-NO-GITHUB.md** | Deploy không GitHub |
| **DEPLOYMENT.md** | Chi tiết đầy đủ |
| **DEPLOYMENT-CHECKLIST.md** | Checklist |
| **DEPLOY-COMMANDS.md** | Quick reference |
| **DEPLOY-GUIDE.md** | Workflow overview |
| **scripts/README.md** | Scripts documentation |

---

## 🔐 Security Notes

⚠️ **IMPORTANT**:
- ✅ `.env` file ignored (not in git)
- ✅ Use `.env.example` as template (no real secrets)
- ✅ Generate new JWT keys for production
- ✅ Strong database password required
- ✅ Rotate API keys if exposed
- ✅ Enable SSL/HTTPS with Let's Encrypt

---

## 🛠️ Troubleshooting

### Containers không start?
```bash
docker compose logs backend
docker compose logs mysql
```

### Website không truy cập?
```bash
docker compose ps
systemctl status nginx
ufw status
```

### Database connection failed?
```bash
docker compose exec mysql mysql -uroot -p
```

Xem chi tiết → [DEPLOY-COMMANDS.md](DEPLOY-COMMANDS.md)

---

## 📞 Support

1. **Check logs**: `docker compose logs -f`
2. **Read guides**: [DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md)
3. **Check commands**: [DEPLOY-COMMANDS.md](DEPLOY-COMMANDS.md)

---

## 📋 Checklist Trước Deploy

- [ ] `.env` đã được prepare (nếu có keys)
- [ ] VPS credentials sẵn sàng
- [ ] Code đã test trên local
- [ ] Đã backup database (nếu có)
- [ ] Firewall/security ready

---

## 🎯 Quick Links

- 🚀 **[DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md)** - Start deploying now!
- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - Full documentation
- 🔧 [DEPLOY-COMMANDS.md](DEPLOY-COMMANDS.md) - Commands reference
- 📋 [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Checklist
- 🛡️ [DEPLOY-NO-GITHUB.md](DEPLOY-NO-GITHUB.md) - Safe deployment

---

## 📝 Project Info

- **Created**: January 2026
- **Status**: Active Development
- **License**: MIT
- **Team**: Group 02

---

**👉 Ready to deploy? Start with [DEPLOY-SIMPLE.md](DEPLOY-SIMPLE.md)!** 🚀
