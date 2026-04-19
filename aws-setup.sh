#!/bin/bash
# --- AWS EC2 Auto-Healing Startup Script ---
# This script installs Docker and starts your app automatically on boot.

# 1. Update system and set Timezone to IST (India)
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git curl
sudo timedatectl set-timezone Asia/Kolkata

# 2. Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 3. Create app directory and clone code
# NOTE: Replace the YOUR_TOKEN section with your actual GitHub Personal Access Token
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app
git clone -b Sand-box https://YOUR_TOKEN@github.com/TARENDRA1994/doctors-app.git .

# 4. Detect Public IP for NextAuth
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# 5. Create the Environment File
cat <<EOF > .env.local
DATABASE_URL="postgresql://postgres.jjwwvcftkwlagswvgjlr:Tarendra%40123dec@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=45"
NEXTAUTH_SECRET="9cead864b9fd45ca6ccef55f698d868618f350cbeaf01b84d98beb3ebea84503"
NEXTAUTH_URL="http://\${EC2_PUBLIC_IP}:3001"
WHATSAPP_PHONE_NUMBER_ID="987295474471556"
WHATSAPP_BUSINESS_ACCOUNT_ID="1855039925153041"
WHATSAPP_ACCESS_TOKEN="EAAUKIIkh7O8BQzbuHmo0wqHNNZCNaWkVkGJ7l6k1hBDiXl0iIN11tjzFbaax9WgRUsZCwaZC4X5lhuVnQItXKqVNAbfgDZB69ieats8ZChemetjKlZAuOXFc8O9cpvSOGi7sbBLWX6X8pOfPhHUejrei7Ye7PoZAP7BfoZB1cKKXzQNCqFMEgOH4dGmJjOsO3gch9AZDZD"
# Gemini API Key (Clinical Nutrition Assistant)
GEMINI_API_KEY="AIzaSyDjg01QSdI-PQViLRmmYs-xRkwQ5NpJRO4"
EOF

# 6. Build and Launch
sudo docker compose up --build -d

# 7. Cleanup cron to prevent "No Space Left" errors
echo "0 0 * * * root docker image prune -a -f" | sudo tee -a /etc/crontab
