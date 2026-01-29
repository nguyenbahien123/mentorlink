# Hướng Dẫn Cấu Hình HTTPS cho MentorLink

## 📋 Tổng Quan
Tài liệu này hướng dẫn chi tiết cách cấu hình HTTPS cho hệ thống MentorLink, bao gồm:
- Cài đặt SSL certificate (Let's Encrypt)
- Cấu hình Nginx cho HTTPS
- Cập nhật environment variables
- Kiểm tra và verify cấu hình

---

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Environment Variables**
Đã cập nhật các file `.env` để hỗ trợ HTTPS:

#### `.env` (Root)
```bash
# PayOS URLs
PAYOS_RETURN_URL=https://mentorlink.io.vn/api/bookings/payos-return
PAYOS_CANCEL_URL=https://mentorlink.io.vn/find-mentor?bookingSuccess=false
```

#### `frontend/.env`
```bash
VITE_API_URL=https://mentorlink.io.vn/api
```

### 2. **Backend Configuration**

#### CORS Configuration (`CorsConfig.java`)
Đã thêm hỗ trợ cho:
- `https://mentorlink.io.vn`
- `https://*.mentorlink.io.vn`
- HTTPS localhost cho development

#### WebSocket Configuration (`WebSocketConfig.java`)
Đã cập nhật allowed origins để bao gồm HTTPS URLs.

#### Cookie Security (`AuthenticationController.java`)
Đã bật `secure` flag cho cookies:
```java
cookie.setSecure(true); // Cookies chỉ được gửi qua HTTPS
```

#### Application Configuration Files
- `application.yml`: Default URLs đã chuyển sang HTTPS
- `application-prod.yml`: Frontend URL sử dụng HTTPS
- `application-dev.yml`: Vẫn giữ HTTP cho local development

### 3. **Nginx Configuration**
Đã cấu hình hoàn chỉnh với:
- HTTP to HTTPS redirect
- SSL/TLS settings tối ưu
- Security headers (HSTS, CSP, etc.)
- OCSP Stapling
- WebSocket support qua HTTPS

---

## 🔐 Cài Đặt SSL Certificate

### Option 1: Let's Encrypt (Miễn phí, Khuyến nghị)

#### Bước 1: Cài đặt Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Bước 2: Lấy SSL Certificate
```bash
# Tự động cấu hình Nginx
sudo certbot --nginx -d mentorlink.io.vn -d www.mentorlink.io.vn

# Hoặc chỉ lấy certificate (manual)
sudo certbot certonly --nginx -d mentorlink.io.vn -d www.mentorlink.io.vn
```

#### Bước 3: Verify Certificate
```bash
sudo certbot certificates
```

#### Bước 4: Setup Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot tự động tạo cron job hoặc systemd timer
# Kiểm tra:
sudo systemctl status certbot.timer
```

### Option 2: Cloudflare SSL (Nếu sử dụng Cloudflare)
1. Đăng nhập Cloudflare Dashboard
2. Chọn domain → SSL/TLS
3. Chọn mode: **Full (strict)**
4. Tạo Origin Certificate cho server
5. Cài đặt certificate vào Nginx

---

## 🔧 Cấu Hình Chi Tiết

### 1. Nginx Configuration

File `nginx.conf` đã được cấu hình sẵn với 2 server blocks:

#### HTTP Server (Port 80) - Cho Local Development
```nginx
server {
    listen 80;
    server_name localhost 127.0.0.1 103.118.28.130;
    # ... configuration ...
}
```

#### HTTPS Server (Port 443) - Cho Production
```nginx
server {
    listen 443 ssl http2;
    server_name mentorlink.io.vn www.mentorlink.io.vn;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mentorlink.io.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mentorlink.io.vn/privkey.pem;
    # ... more configuration ...
}
```

#### HTTP to HTTPS Redirect
```nginx
server {
    listen 80;
    server_name mentorlink.io.vn www.mentorlink.io.vn;
    
    # Cho phép Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect tất cả traffic sang HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### 2. Deploy Nginx Configuration

```bash
# Backup cấu hình hiện tại
sudo cp /etc/nginx/sites-available/mentorlink /etc/nginx/sites-available/mentorlink.backup

# Copy cấu hình mới
sudo cp nginx.conf /etc/nginx/sites-available/mentorlink

# Test cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Environment Variables cho Production

Tạo file `.env` trên server production:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password

# Brevo Email
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your@email.com
BREVO_SENDER_NAME=MentorLink

# JWT Keys
JWT_ACCESS_KEY=your_access_key
JWT_REFRESH_KEY=your_refresh_key
JWT_RESET_KEY=your_reset_key
JWT_SECRET_KEY=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PayOS - HTTPS URLs
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_RETURN_URL=https://mentorlink.io.vn/api/bookings/payos-return
PAYOS_CANCEL_URL=https://mentorlink.io.vn/find-mentor?bookingSuccess=false

# Frontend API - HTTPS
VITE_API_URL=https://mentorlink.io.vn/api
```

---

## ✅ Kiểm Tra & Verification

### 1. Test SSL Certificate
```bash
# Kiểm tra SSL certificate
openssl s_client -connect mentorlink.io.vn:443 -servername mentorlink.io.vn

# Kiểm tra SSL rating
# Truy cập: https://www.ssllabs.com/ssltest/
# Nhập domain: mentorlink.io.vn
```

### 2. Test HTTPS Redirect
```bash
# Kiểm tra HTTP redirect sang HTTPS
curl -I http://mentorlink.io.vn
# Kết quả mong đợi: HTTP 301 → Location: https://mentorlink.io.vn

# Kiểm tra HTTPS response
curl -I https://mentorlink.io.vn
# Kết quả mong đợi: HTTP 200 OK + Strict-Transport-Security header
```

### 3. Test Application

#### A. Frontend
```bash
# Kiểm tra trang chủ
curl -k https://mentorlink.io.vn/

# Kiểm tra API endpoint
curl -k https://mentorlink.io.vn/api/health
```

#### B. Backend API
```bash
# Test login endpoint
curl -X POST https://mentorlink.io.vn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### C. WebSocket
Mở trình duyệt và test chat functionality:
- URL WebSocket: `wss://mentorlink.io.vn/chat-websocket`

### 4. Verify Security Headers
```bash
curl -I https://mentorlink.io.vn
```

Các headers cần có:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### 5. Test Browser Compatibility
Mở trình duyệt và kiểm tra:
1. https://mentorlink.io.vn
2. Kiểm tra icon khóa (🔒) trên address bar
3. View certificate details
4. Kiểm tra Console không có lỗi Mixed Content

---

## 🚨 Troubleshooting

### Problem 1: CORS Errors với HTTPS
**Triệu chứng:** `Access-Control-Allow-Origin` errors trong browser console

**Giải pháp:**
```java
// Kiểm tra CorsConfig.java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "https://mentorlink.io.vn",
    "https://*.mentorlink.io.vn"
));
```

### Problem 2: Mixed Content Warnings
**Triệu chứng:** Trình duyệt block HTTP resources trên HTTPS page

**Giải pháp:**
- Đảm bảo tất cả API calls sử dụng HTTPS
- Kiểm tra external resources (CDN, images) sử dụng HTTPS
- Cập nhật hardcoded URLs trong code

### Problem 3: WebSocket Connection Failed
**Triệu chứng:** Chat không hoạt động qua HTTPS

**Giải pháp:**
```javascript
// Frontend phải sử dụng wss:// thay vì ws://
const socket = new SockJS('https://mentorlink.io.vn/api/chat-websocket');
```

### Problem 4: Cookies Not Working
**Triệu chứng:** Authentication bị lỗi, cookies không được gửi

**Giải pháp:**
```java
// Đảm bảo cookie có secure flag
cookie.setSecure(true);

// Và SameSite attribute
response.addHeader("Set-Cookie", String.format(
    "refreshToken=%s; Path=/; HttpOnly; Secure; Max-Age=%d; SameSite=Lax",
    refreshToken, maxAge
));
```

### Problem 5: SSL Certificate Renewal Failed
**Giải pháp:**
```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Renew manually
sudo certbot renew --standalone

# Start Nginx
sudo systemctl start nginx

# Hoặc sử dụng webroot plugin
sudo certbot renew --webroot -w /var/www/certbot
```

---

## 🔄 Chuyển Đổi Development ↔ Production

### Development (Local với HTTP)
```bash
# .env
VITE_API_URL=http://localhost:8080/api
PAYOS_RETURN_URL=http://localhost:8080/api/bookings/payos-return
PAYOS_CANCEL_URL=http://localhost:3000/find-mentor?bookingSuccess=false

# AuthenticationController.java
cookie.setSecure(false); // Development only
```

### Production (Server với HTTPS)
```bash
# .env
VITE_API_URL=https://mentorlink.io.vn/api
PAYOS_RETURN_URL=https://mentorlink.io.vn/api/bookings/payos-return
PAYOS_CANCEL_URL=https://mentorlink.io.vn/find-mentor?bookingSuccess=false

# AuthenticationController.java
cookie.setSecure(true); // Production with HTTPS
```

---

## 📚 Tài Liệu Tham Khảo

1. **Let's Encrypt:**
   - https://letsencrypt.org/getting-started/
   - https://certbot.eff.org/

2. **Nginx SSL Configuration:**
   - https://nginx.org/en/docs/http/configuring_https_servers.html
   - https://ssl-config.mozilla.org/

3. **Security Best Practices:**
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
   - https://owasp.org/www-project-secure-headers/

4. **SSL Testing Tools:**
   - https://www.ssllabs.com/ssltest/
   - https://securityheaders.com/

---

## 📝 Checklist Triển Khai HTTPS

- [ ] Cài đặt Certbot trên server
- [ ] Lấy SSL certificate cho domain
- [ ] Cập nhật Nginx configuration với HTTPS
- [ ] Deploy Nginx config và test
- [ ] Cập nhật file `.env` production với HTTPS URLs
- [ ] Rebuild và deploy backend application
- [ ] Rebuild và deploy frontend application
- [ ] Verify HTTPS redirect hoạt động
- [ ] Test tất cả API endpoints qua HTTPS
- [ ] Test WebSocket connections qua WSS
- [ ] Kiểm tra cookies hoạt động đúng
- [ ] Test payment flow với PayOS
- [ ] Verify security headers
- [ ] Test trên các trình duyệt khác nhau
- [ ] Setup auto-renewal cho SSL certificate
- [ ] Backup cấu hình
- [ ] Document cho team

---

## 🎯 Kết Luận

Hệ thống MentorLink đã được cấu hình đầy đủ để hỗ trợ HTTPS với:
- ✅ SSL/TLS encryption
- ✅ Secure cookies
- ✅ CORS configuration cho HTTPS
- ✅ WebSocket over HTTPS (WSS)
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Auto-redirect HTTP → HTTPS

**Lưu ý:** Đảm bảo test kỹ lưỡng trên staging environment trước khi deploy lên production!
