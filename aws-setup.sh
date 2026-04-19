#!/bin/bash
# --- AWS EC2 Auto-Healing Startup Script ---
# This script installs Docker and starts your app automatically on boot.

# 1. Update system and install Docker
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose git

# 2. Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 3. Create app directory and clone code
# NOTE: Replace the URL below with your actual GitHub repository URL
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app
git clone https://github.com/TARENDRA1994/doctors-app.git .

# 4. Create the Environment File
# NOTE: You MUST paste your actual production variables here
cat <<EOF > .env.local
DATABASE_URL="postgresql://postgres.jjwwvcftkwlagswvgjlr:Tarendra%40123dec@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=45"
NEXTAUTH_SECRET="9cead864b9fd45ca6ccef55f698d868618f350cbeaf01b84d98beb3ebea84503"
NEXTAUTH_URL="http://your-ec2-ip-or-domain"
# Add your WhatsApp tokens and other variables below...
EOF

# 5. Build and Launch the Docker Container
sudo docker-compose up --build -d

# 6. Setup automatic cleanup of old Docker images to save space
echo "0 0 * * * root docker image prune -f" | sudo tee -a /etc/crontab
