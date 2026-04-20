#!/bin/bash
# --- AWS EC2 Auto-Healing Startup Script ---
# This script installs Docker and starts your app automatically on boot.

# 1. Update system and set Timezone to IST (India)
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose git curl awscli
sudo timedatectl set-timezone Asia/Kolkata

# 2. Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 3. Create app directory and clone code
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

if [ -d ".git" ]; then
    echo "🔄 Repository already exists, pulling latest changes..."
    git pull origin Sand-box
else
    echo "🚀 Cloning fresh repository..."
    git clone -b Sand-box https://YOUR_TOKEN@github.com/TARENDRA1994/doctors-app.git .
fi

# 4. Detect Public IP and Region for NextAuth and SSM
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
EC2_PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)
EC2_REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/placement/region)

# 5. Fetch Secrets from AWS SSM (The Intelligent Way)
echo "🔍 Detected Region: ${EC2_REGION}"
echo "🔍 Fetching secrets from AWS Parameter Store..."
WHATSAPP_ID=$(aws ssm get-parameter --name "DR_APP_WHATSAPP_ID" --query "Parameter.Value" --output text --region ${EC2_REGION} || echo "")
WHATSAPP_TOKEN=$(aws ssm get-parameter --name "DR_APP_WHATSAPP_TOKEN" --with-decryption --query "Parameter.Value" --output text --region ${EC2_REGION} || echo "")
DB_URL=$(aws ssm get-parameter --name "DR_APP_DB_URL" --with-decryption --query "Parameter.Value" --output text --region ${EC2_REGION} || echo "")
GEMINI_KEY=$(aws ssm get-parameter --name "DR_APP_GEMINI_KEY" --with-decryption --query "Parameter.Value" --output text --region ${EC2_REGION} || echo "")

# 6. Create the Environment File
cat <<EOF > .env.local
DATABASE_URL="${DB_URL}"
NEXTAUTH_SECRET="9cead864b9fd45ca6ccef55f698d868618f350cbeaf01b84d98beb3ebea84503"
NEXTAUTH_URL="http://${EC2_PUBLIC_IP}:3001"
WHATSAPP_PHONE_NUMBER_ID="${WHATSAPP_ID}"
WHATSAPP_ACCESS_TOKEN="${WHATSAPP_TOKEN}"
WHATSAPP_BUSINESS_ACCOUNT_ID="1855039925153041"
GEMINI_API_KEY="${GEMINI_KEY}"
EOF

if [ -z "$WHATSAPP_ID" ]; then echo "⚠️ WARNING: WHATSAPP_ID not found in SSM!"; fi

# 6. Deep Clean and Build
echo "🧹 Cleaning old build cache to free up space..."
sudo docker system prune -a -f --volumes

echo "🏗️ Building and Launching the application..."
sudo docker-compose up --build -d

# 7. Cleanup cron to prevent "No Space Left" errors
echo "0 0 * * * root docker image prune -a -f" | sudo tee -a /etc/crontab
