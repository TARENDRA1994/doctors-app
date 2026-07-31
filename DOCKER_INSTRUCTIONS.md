# Docker Deployment Guide for SanjeevaniBharat

This guide explains how to build and run the SanjeevaniBharat application in a separate VM or container using Docker.

## Prerequisites on your VM
1. **Docker**: Ensure Docker is installed. (`sudo apt install docker.io` on Ubuntu)
2. **Environment Variables**: You will need your `.env.local` file values on the new machine.

## Step 1: Transfer Files to the VM
You can clone your git repository onto the VM, or copy the essential files directly. If you are copying files manually, ensure you copy the entire `Doctors-App` folder (excluding `node_modules` and `.next`).

## Step 2: Create a `.env` file for Production
On your VM, create a file named `.env` in the root of the project directory with your production secrets:

```env
# Database (SQLite will be stored inside the container)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your_secure_random_string"
NEXTAUTH_URL="http://your-vm-ip-or-domain:3001"

# Meta WhatsApp
WHATSAPP_PHONE_NUMBER_ID="your_phone_id"
WHATSAPP_ACCESS_TOKEN="your_permanent_or_refreshed_token"
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"
```

## Step 3: Build the Docker Image
Run the following command in the directory containing the `Dockerfile`:

```bash
docker build -t SanjeevaniBharat-app .
```
*This command uses the multi-stage Dockerfile to install dependencies, generate the Prisma client, and create an optimized Next.js standalone build.*

## Step 4: Run the Docker Container
Start the container and map port 3001 to your VM's public port (e.g., mapping to port 80 for standard HTTP, or 3001 to keep it the same). 

We also mount a volume so your SQLite database isn't lost if the container restarts.

```bash
# Create a folder on your VM to store the database permanently
mkdir -p ./data

# Run the container
docker run -d \
  --name SanjeevaniBharat \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/prisma/data \
  SanjeevaniBharat-app
```

> **Note on SQLite:** If you use the command above, you should update your `.env` `DATABASE_URL` to point to the mounted volume: `DATABASE_URL="file:/app/prisma/data/dev.db"`

## Step 5: Verify the Application
Check the logs to ensure the database migrations ran and the server started successfully:

```bash
docker logs -f SanjeevaniBharat
```

You should see:
1. Prisma migrations deploying successfully.
2. The `node-cron` scheduler starting.
3. Next.js starting on port 3001.

You can now access your app at `http://<your-vm-ip>:3001`.

## Step 6: Update Webhooks (If Domain Changed)
Since you moved to a new VM, your IP address or domain has likely changed. Go to your **Meta Developer Dashboard** and update the Webhook URL to point to your new VM's URL:
`http://<your-vm-ip>:3001/api/whatsapp/webhook`
