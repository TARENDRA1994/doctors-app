# MediReminder - Doctor Medicine Reminder App

A comprehensive web application for doctors to manage patients and send automated medicine reminders via WhatsApp.

**Status**: ✅ Working - Fully Functional

---

## ✨ Features

### 👨‍⚕️ Doctor Features
- ✅ Secure registration & login (NextAuth)
- ✅ Patient management (add, view, organize)
- ✅ Medicine scheduling with custom reminders
- ✅ Automated WhatsApp notifications via Twilio
- ✅ Dashboard with overview & analytics
- ✅ Test notification button
- ✅ Reminder history & activity logs

### 👤 Patient Features  
- ✅ Receive WhatsApp medicine reminders
- ✅ Reply "taken" to mark medicine taken
- ✅ Reply "snooze 15 minutes" to reschedule
- ✅ Automatic response logging

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | SQLite + Prisma ORM |
| Auth | NextAuth.js (JWT) |
| WhatsApp | Twilio WhatsApp Sandbox API |
| Scheduler | node-cron (Every minute checks) |
| Deployment | Vercel, Docker, or Self-hosted |

---

## 📋 Project Structure

```
doctors-app/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # NextAuth routes
│   │   ├── medicines/         # Medicine CRUD
│   │   ├── patients/          # Patient CRUD
│   │   ├── reminders/check/   # Reminder checker
│   │   ├── test-notification/ # Test WhatsApp
│   │   └── twilio/webhook/    # WhatsApp responses
│   ├── dashboard/             # Main dashboard
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # NextAuth config
│   │   └── reminder-scheduler.ts  # Auto-scheduler
│   └── layout.tsx
├── prisma/                    # Database schema
│   ├── schema.prisma
│   └── migrations/
├── public/                    # Static files
├── .env.example               # Environment template
├── Dockerfile                 # Docker configuration
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
├── QUICK_START.md             # Quick reference
└── package.json
```

---

## 🚀 Quick Start

### **Local Development (2 minutes)**

1. **Clone and setup**:
```bash
git clone https://github.com/YOUR_USERNAME/doctors-app.git
cd doctors-app
npm install
```

2. **Create environment file**:
```bash
cp .env.example .env.local
# Edit .env.local and add your Twilio credentials
```

3. **Setup database**:
```bash
npx prisma migrate dev
```

4. **Run development server**:
```bash
npm run dev
```

5. **Open app**:
```
http://localhost:3001
```

### **Test Features**:
- Register as doctor with WhatsApp number
- Add a patient with their WhatsApp number
- Click "Send Test Notification" button
- Check WhatsApp on the Twilio Sandbox chat

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | Auto | `file:./prisma/dev.db` |
| `NEXTAUTH_SECRET` | Generate | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Your domain | `http://localhost:3001` |
| `TWILIO_ACCOUNT_SID` | Twilio Console | `AC5f93cd7071e018eb...` |
| `TWILIO_AUTH_TOKEN` | Twilio Console | `1272bff291db716ff7e...` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio Console | `+14155238886` |

---

## 🔄 How It Works

```
1. Doctor registers/logs in
   ↓
2. Doctor adds patient with WhatsApp number (+91)
   ↓
3. Doctor schedules medicine with reminder time
   ↓
4. System checks every minute if reminder is due
   ↓
5. Sends WhatsApp message to patient via Twilio
   ↓
6. Patient replies "taken" or "snooze"
   ↓
7. System logs response and updates schedule
```

---

## 📱 WhatsApp Sandbox Setup

Reminders are sent via **Twilio WhatsApp Sandbox** (free, for testing).

To receive messages:
1. Get the sandbox code from **Twilio Console > Messaging > WhatsApp Sandbox**
2. Send from WhatsApp: `join [SANDBOX_CODE]` to `+1 415 523 8886`
3. Wait for confirmation
4. Now you'll receive medicine reminders!

---

## 🚀 Deployment

### **Option 1: Vercel (Recommended)**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#1-vercel-recommended---5-minutes)

### **Option 2: Self-hosted (AWS, DigitalOcean, etc)**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#4-vps-aws-linode-hetzner)

### **Option 3: Docker**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#3-docker-for-any-cloud-platform)

---

## 🗄 Database Schema

**Doctor**: id, name, email, password, whatsappNumber, clinicName, mobileNumber
**Patient**: id, name, mobileNumber, age, disease, doctorId
**Medicine**: id, name, dosage, frequency, reminderTime, doctorId, patientId  
**MedicineSchedule**: id, medicineId, scheduledAt, status (pending/sent/taken/snoozed)
**ReminderLog**: id, medicineId, doctorId, action, timestamp

---

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick reference guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Twilio Docs](https://www.twilio.com/docs/whatsapp) - WhatsApp API reference
- [Next.js Docs](https://nextjs.org/docs) - Next.js framework docs
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Notifications not sending | Check phone numbers have `+91` prefix, patient opted in sandbox |
| Database error | Run `npx prisma migrate reset` |
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` or change port in `package.json` |
| WhatsApp not connected | Verify webhook URL in Twilio Console, check server logs |
| Login not working | Check `NEXTAUTH_SECRET` is set, browser cookies enabled |

---

## 📝 Available Scripts

```bash
npm run dev          # Development server (port 3001)
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Check code quality
npx prisma studio   # Open database UI
npx prisma migrate dev  # Create database migration
```

---

## 👨‍💻 Development Tips

- **Phone numbers**: Always include country code (+91 for India)
- **Testing reminders**: Schedule for 2-3 minutes from now  
- **WhatsApp test**: Use `/api/test-notification` endpoint
- **Database**: Check `prisma.sqlite` in Prisma Studio with `npx prisma studio`
- **Logs**: Check terminal for detailed error messages

---

## 🔐 Security Notes

- ✅ Passwords hashed with bcrypt
- ✅ Sessions secured with JWT
- ✅ NextAuth protects API routes
- ✅ Environment variables not in git
- ⚠️ SQLite okay for dev, use PostgreSQL for production

---

## 🎯 Future Enhancements

- [ ] Patient dashboard (view their medicines)
- [ ] SMS notifications (Nexmo/Vonage)
- [ ] Doctor appointments
- [ ] Refill reminders
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Analytics & reports
- [ ] Doctor availability calendar

---

## 📄 License

This project is private. Contact the developer for licensing information.

---

## 🙋 Support

If you need help:

1. **Check** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for common issues
2. **See** [QUICK_START.md](./QUICK_START.md) for quick reference
3. **Share** server logs when reporting issues
4. **Describe** what changed recently
5. **Include** exact error messages

---

**Made with ❤️ for healthcare**

1. Register as a doctor
2. Add patients with their WhatsApp-enabled mobile numbers
3. Schedule medicines for patients with dosage, frequency, and reminder times
4. The system automatically sends WhatsApp messages to patients when medicines are scheduled
5. Patients receive reminders at scheduled times and can reply with actions

## API Endpoints

- `POST /api/doctors/register` - Register a new doctor
- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/patients` - Manage patients
- `GET/POST /api/medicines` - Manage medicines
- `POST /api/reminders/check` - Check and send due reminders
- `POST /api/twilio/webhook` - Handle incoming WhatsApp messages

## Database Schema

- **Doctors**: Doctor information and credentials
- **Patients**: Patient details linked to doctors
- **Medicines**: Medicine details with scheduling info
- **MedicineSchedules**: Individual reminder schedules
- **ReminderLogs**: Log of all reminder actions

## Deployment

The application runs on port 3001 by default. For production deployment:

1. Set up a production database (PostgreSQL recommended)
2. Configure Twilio WhatsApp Business API
3. Set up a cron job to call `/api/reminders/check` periodically
4. Configure the Twilio webhook to point to `/api/twilio/webhook`

## License

This project is for educational purposes.