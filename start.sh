#!/bin/bash

# Quick start guide for MentorLink Docker Compose

echo "=== MentorLink Docker Compose Setup ==="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found in root directory"
    echo "Please copy backend/.env to ./ (root directory) as .env"
    exit 1
fi

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

echo "✓ Docker found"
echo "✓ docker-compose found"
echo ""

echo "Starting containers..."
docker-compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 5

echo ""
echo "=== Services Status ==="
docker-compose ps

echo ""
echo "=== Access Points ==="
echo "Frontend:   http://localhost:3000"
echo "Backend:    http://localhost:8080/api"
echo "MySQL:      localhost:3307"
echo ""
echo "✓ Services started successfully!"
