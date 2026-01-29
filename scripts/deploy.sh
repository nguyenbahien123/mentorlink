#!/bin/bash

###############################################################################
# Script deploy/update nhanh cho MentorLink trên VPS
# Sử dụng: bash deploy.sh
###############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/Group02_MentorLink"

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo "=========================================="
echo "🚀 MentorLink Deployment Script"
echo "=========================================="

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_info "Please clone the project first"
    exit 1
fi

cd $PROJECT_DIR

# 1. Backup database before deployment
print_info "Step 1: Backing up database..."
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_before_deploy_$(date +%Y%m%d_%H%M%S).sql"

if docker ps | grep -q mentorlink-mysql; then
    docker exec mentorlink-mysql mysqldump -uroot -p${DATABASE_PASSWORD:-rootpass} mentor_link > $BACKUP_FILE 2>/dev/null || true
    if [ -f "$BACKUP_FILE" ]; then
        print_success "Database backed up to: $BACKUP_FILE"
    else
        print_info "Database backup skipped (container not ready or password not set)"
    fi
else
    print_info "MySQL container not running, skipping backup"
fi

# 2. Pull latest code
print_info "Step 2: Pulling latest code from Git..."
git pull origin main
print_success "Code updated"

# 3. Stop containers
print_info "Step 3: Stopping containers..."
docker compose down
print_success "Containers stopped"

# 4. Rebuild images
print_info "Step 4: Building new images..."
docker compose build --no-cache
print_success "Images built"

# 5. Start containers
print_info "Step 5: Starting containers..."
docker compose up -d
print_success "Containers started"

# 6. Wait for services to be healthy
print_info "Step 6: Waiting for services to be healthy..."
sleep 10

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    print_success "Containers are running"
else
    print_error "Some containers failed to start"
    docker compose ps
    exit 1
fi

# 7. Show container status
print_info "Step 7: Container status:"
docker compose ps

# 8. Cleanup old images
print_info "Step 8: Cleaning up old images..."
docker image prune -f
print_success "Cleanup completed"

echo ""
echo "=========================================="
print_success "Deployment Completed!"
echo "=========================================="
echo ""
print_info "Check logs with: docker compose logs -f"
print_info "Website: http://103.118.28.130"
echo ""

# Show recent logs
print_info "Recent logs (last 20 lines):"
docker compose logs --tail=20
