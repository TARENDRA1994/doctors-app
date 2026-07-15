#!/bin/bash
# --- SanjeevniBharat AWS EC2 Auto-Healing Startup Script (v2.1) ---
# This script installs Docker and starts your app automatically on boot.

# 1. Install Docker using the Official Convenience Script
echo "🐳 Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# Ensure services are healthy
sudo systemctl enable docker
sudo systemctl start docker &>/dev/null || sudo systemctl restart docker

# Install basic dependencies
sudo apt-get update && sudo apt-get install -y git awscli
sudo timedatectl set-timezone Asia/Kolkata

# 2. Get the latest code from GitHub
echo "📥 Updating codebase..."
if [ ! -d "/home/ubuntu/app" ]; then
    sudo mkdir -p /home/ubuntu/app
    sudo chown ubuntu:ubuntu /home/ubuntu/app
fi

if [ ! -d "/home/ubuntu/app/.git" ]; then
    git clone -b Sand-box https://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@github.com/TARENDRA1994/doctors-app.git /home/ubuntu/app
fi

cd /home/ubuntu/app
git fetch origin Sand-box
git reset --hard origin/Sand-box

# 3. Detect Server Environment
IP_ADDRESS=$(curl -s http://checkip.amazonaws.com)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
export AWS_DEFAULT_REGION=$REGION

# 4. Fetch Secrets from AWS Parameter Store (SSM)
echo "🔐 Fetching clinical secrets..."
export DATABASE_URL=$(aws ssm get-parameter --name "/dr_app/production/DATABASE_URL" --with-decryption --query "Parameter.Value" --output text)
export WHATSAPP_TOKEN=$(aws ssm get-parameter --name "/dr_app/production/WHATSAPP_TOKEN" --with-decryption --query "Parameter.Value" --output text)
export WHATSAPP_ID=$(aws ssm get-parameter --name "/dr_app/production/WHATSAPP_ID" --with-decryption --query "Parameter.Value" --output text)
export NEXTAUTH_SECRET=$(aws ssm get-parameter --name "/dr_app/production/NEXTAUTH_SECRET" --with-decryption --query "Parameter.Value" --output text)
export NEXTAUTH_URL="http://${IP_ADDRESS}:3001"

# 5. Build and Launch using Docker Compose V2
echo "🧹 Cleaning old build cache..."
sudo docker system prune -f --volumes

echo "🏗️ Launching SanjeevniBharat v2 (Premium Landing Page LIVE)..."
sudo docker compose up --build -d

# 6. Setup Daily Cleanup Cron
(crontab -l 2>/dev/null; echo "0 0 * * * docker system prune -a -f") | crontab -
echo "✅ Setup Complete. Application is live at http://${IP_ADDRESS}:3001"
