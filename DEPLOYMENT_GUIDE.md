# Doctors-App Deployment & Maintenance Guide

## 📋 Quick Reference

**Application**: Medicine Reminder App with WhatsApp Notifications
**Tech Stack**: Next.js 14, Prisma ORM, SQLite, Twilio API
**Deployment**: Vercel (Free), AWS, DigitalOcean, or Self-hosted
**Port**: 3001

---

## 🚀 Deployment Options

### **1. Vercel (Recommended - 5 minutes)**

Best for: Fast deployment, automatic updates, free tier generous

```bash
# Prerequisites: GitHub account

1. Push code to GitHub
2. Go to vercel.com and import repository
3. Add environment variables in Vercel dashboard
4. Click Deploy - Done!
```

**Environment Variables to Add:**
```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=<your-secret-key>
NEXTAUTH_URL=https://your-project.vercel.app
TWILIO_ACCOUNT_SID=AC5f93cd7071e018eb4172b3e392a5f2d0
TWILIO_AUTH_TOKEN=1272bff291db716ff7ec24df19263963
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

### **2. DigitalOcean App Platform**

Best for: Full control, affordable, good support

```bash
1. Create DigitalOcean account
2. Create new App
3. Connect GitHub repo
4. Set environment variables
5. Deploy
6. Domain setup
```

---

### **3. Docker + Any Server**

Best for: Custom requirements, multiple servers

```bash
# Build Docker image
docker build -t doctors-app .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e TWILIO_ACCOUNT_SID="..." \
  doctors-app
```

---

### **4. VPS (AWS, Linode, Hetzner)**

Best for: Scalability, custom configuration

```bash
# On your VPS:

# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repository
git clone https://github.com/YOUR_USERNAME/doctors-app.git
cd doctors-app

# 3. Install dependencies
npm install

# 4. Setup environment
nano .env.local
# Add all environment variables

# 5. Build
npm run build

# 6. Use PM2 for management
npm install -g pm2
pm2 start npm --name "doctors-app" -- start
pm2 startup
pm2 save

# 7. Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure /etc/nginx/sites-available/default
```

---

## 🔧 Production Checklist

Before deploying, ensure:

- [ ] Update `NEXTAUTH_SECRET` to a secure random string
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Change database from SQLite to PostgreSQL (for production):
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

- [ ] Update `NEXTAUTH_URL` to your actual domain
  ```
  NEXTAUTH_URL=https://your-domain.com
  ```

- [ ] Configure Twilio webhook URL in Twilio Console:
  ```
  https://your-domain.com/api/twilio/webhook
  ```

- [ ] Enable HTTPS only
  - [ ] Get SSL certificate (Let's Encrypt is free)
  - [ ] Redirect HTTP to HTTPS

- [ ] Backup your database regularly
  ```bash
  # For PostgreSQL:
  pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

---

## 📁 Project Structure for Reference

```
doctors-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth configuration
│   │   ├── medicines/               # Medicine CRUD endpoints
│   │   ├── patients/                # Patient CRUD endpoints
│   │   ├── reminders/check/         # Reminder checker endpoint
│   │   ├── test-notification/       # Test WhatsApp endpoint
│   │   └── twilio/webhook/          # WhatsApp webhook
│   ├── dashboard/                   # Main dashboard page
│   ├── login/                       # Login page
│   ├── register/                    # Registration page
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth config
│   │   └── reminder-scheduler.ts    # Auto reminder cron job
│   └── layout.tsx                   # Root layout
├── prisma/
│   └── schema.prisma                # Database schema
├── .env.local                       # Environment variables (NOT in git)
├── package.json                     # Dependencies
├── Dockerfile                       # Docker build file
└── README.md                        # Documentation
```

---

## 🔄 Important Services

### **1. Reminder Scheduler**
- Location: `app/lib/reminder-scheduler.ts`
- Purpose: Checks for due medicine reminders every minute
- Sends WhatsApp notifications automatically
- Runs on app startup

### **2. NextAuth Authentication**
- Location: `app/lib/auth.ts`
- Purpose: Doctor login/registration
- Use credentials only (no OAuth)
- Session stored in JWT

### **3. Twilio WhatsApp**
- Sends notifications to patients
- Receives patient responses (taken/snooze)
- Must configure webhook URL in Twilio Console

### **4. Prisma ORM**
- Database layer
- Models: Doctor, Patient, Medicine, MedicineSchedule, ReminderLog
- Run migrations: `npx prisma migrate dev`

---

## 📞 How to Get Help Later

### **If Something Breaks:**

Let me know:
1. **What's happening**: Error message or behavior
2. **When it started**: After which change?
3. **Server logs**: Copy the error from terminal
4. **What you changed**: Did you modify any files?

### **Future Enhancements Ideas:**

- [ ] SMS notifications (in addition to WhatsApp)
- [ ] Patient dashboard (check their medicines)
- [ ] Appointment scheduling
- [ ] Medicine refill reminders
- [ ] Doctor availability calendar
- [ ] Patient medication history
- [ ] Multi-language support (Hindi, etc.)
- [ ] Mobile app (React Native)

### **Common Issues & Solutions:**

#### **App won't start**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
npm start
```

#### **Database error**
```bash
# Reset database
npx prisma migrate reset
npx prisma db push
```

#### **Port 3001 in use**
```bash
# Kill process using port
lsof -ti:3001 | xargs kill -9
```

#### **WhatsApp not sending**
- Check Twilio credentials in `.env.local`
- Verify webhook URL is correct in Twilio Console
- Patient must be opted in to sandbox
- Check server logs for error details

---

## 🔑 Important Files to Keep Safe

- `.env.local` - Your secret credentials (backup separately)
- `prisma/dev.db` - Your database with all data
- Git repository - For version control

---

## 📝 Git Commands for Backup

```bash
# Create GitHub backup
git add .
git commit -m "App working - backup"
git push origin main

# Clone backup locally
git clone https://github.com/YOUR_USERNAME/doctors-app.git backup_$(date +%Y%m%d)
```

---

## 🆘 Contact Information

If you need help:
1. Share your **server logs** (copy from terminal)
2. Share what **changed recently**
3. Share the **error message** exactly
4. Share **environment setup** (which platform, which Node version)

---

## ✅ Deployment Checklist

- [ ] Code backed up in GitHub
- [ ] `.env.local` file created with all credentials
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Built locally and tested (`npm run build && npm start`)
- [ ] All environment variables set on hosting platform
- [ ] Twilio webhook URL configured and verified
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain configured and DNS pointing to server
- [ ] Backup strategy in place
- [ ] Monitoring setup (error alerts)

---

**Happy deploying! 🚀**
