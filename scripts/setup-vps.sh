#!/bin/bash

###############################################################################
# Script tự động setup VPS và deploy MentorLink
# Sử dụng: bash setup-vps.sh
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "🚀 MentorLink VPS Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash setup-vps.sh)"
    exit 1
fi

print_info "Starting VPS setup..."

# 1. Update system
print_info "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# 2. Install Docker
print_info "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# 3. Install Docker Compose plugin
print_info "Step 3: Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt install docker-compose-plugin -y
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi

# 4. Install Git
print_info "Step 4: Installing Git..."
if ! command -v git &> /dev/null; then
    apt install git -y
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# 5. Install Nginx
print_info "Step 5: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# 6. Setup Firewall
print_info "Step 6: Configuring UFW firewall..."
apt install ufw -y
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
print_success "Firewall configured"

# 7. Install additional tools
print_info "Step 7: Installing additional tools..."
apt install curl wget nano htop net-tools -y
print_success "Additional tools installed"

# 8. Create project directory
print_info "Step 8: Creating project directory..."
mkdir -p /var/www
mkdir -p /backups/mysql
print_success "Directories created"

# 9. Setup swap (if not exists)
print_info "Step 9: Setting up swap space..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    print_success "Swap space created (2GB)"
else
    print_success "Swap space already exists"
fi

# 10. Optimize system settings
print_info "Step 10: Optimizing system settings..."
cat >> /etc/sysctl.conf << EOF

# MentorLink optimizations
vm.swappiness=10
net.core.somaxconn=1024
net.ipv4.tcp_max_syn_backlog=2048
EOF
sysctl -p
print_success "System optimized"

echo ""
echo "=========================================="
print_success "VPS Setup Completed!"
echo "=========================================="
echo ""
print_info "Next steps:"
echo "1. Clone your project: cd /var/www && git clone YOUR_REPO_URL"
echo "2. Create .env file with production credentials"
echo "3. Run: docker compose up -d"
echo "4. Configure Nginx reverse proxy"
echo ""
print_info "Useful commands:"
echo "  - Check Docker: docker --version"
echo "  - Check containers: docker compose ps"
echo "  - View logs: docker compose logs -f"
echo "  - Restart services: docker compose restart"
echo ""
