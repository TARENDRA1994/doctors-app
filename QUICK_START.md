# Quick Start Guide - Doctors App

## ⚡ Get Running in 2 Minutes

### **Step 1: Setup Environment**
```bash
cp .env.example .env.local
# Fill in your Twilio credentials
```

### **Step 2: Install & Build**
```bash
npm install
npx prisma db push
npm run build
```

### **Step 3: Run**
```bash
npm run dev
# Open http://localhost:3001
```

---

## 🔑 Required Environment Variables

Get these from:
- **Twilio**: https://console.twilio.com
- **NextAuth**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3001"
TWILIO_ACCOUNT_SID="<your-account-sid>"
TWILIO_AUTH_TOKEN="<your-auth-token>"
TWILIO_WHATSAPP_NUMBER="+14155238886"
```

---

## 🧪 Test WhatsApp Notifications

```bash
node -e "
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.messages.create({
  from: 'whatsapp:+14155238886',
  to: 'whatsapp:+918878914647',
  body: 'Test message'
}).then(msg => console.log('Sent:', msg.sid));
"
```

---

## 📊 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/doctors/register` | Doctor registration |
| POST | `/api/auth/[...nextauth]` | Authentication |
| GET | `/api/patients` | Get doctor's patients |
| POST | `/api/patients` | Add patient |
| POST | `/api/medicines` | Add medicine & schedule |
| POST | `/api/test-notification` | Send test WhatsApp |
| POST | `/api/reminders/check` | Check due reminders |
| POST | `/api/twilio/webhook` | Receive patient responses |

---

## 🗄️ Database Schema

```
Doctor
├── id, name, email, password
├── whatsappNumber (formatted as +91...)
├── mobileNumber, clinicName
└── Relations: patients, medicines, reminderLogs

Patient
├── id, name, mobileNumber (with +91)
├── age, disease, doctorId
└── Relations: medicines

Medicine
├── id, name, dosage, frequency
├── reminderTime, startDate, endDate
├── doctorId, patientId
└── Relations: schedules, reminderLogs

MedicineSchedule
├── id, medicineId, scheduledAt
├── status (pending/sent/taken/snoozed/missed)
└── Relations: medicine, reminderLogs

ReminderLog
├── id, medicineId, scheduleId, doctorId
├── action (sent/taken/snoozed), timestamp
└── Relations: medicine, schedule, doctor
```

---

## 🔄 How It Works

1. **Doctor registers** with WhatsApp number
2. **Doctor adds patient** with their WhatsApp number
3. **Doctor schedules medicine** for patient on specific time
4. **System checks every minute** if reminder is due
5. **Sends WhatsApp notification** to patient
6. **Patient replies** with "taken" or "snooze"
7. **System logs** the response and updates status

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| Notifications not sent | Check `.env.local`, phone numbers with +91 |
| Database error | `npx prisma migrate reset` |
| WhatsApp not working | Verify Twilio webhook URL configured |
| Scheduler not running | Restart app, check server logs |

---

## 📚 Related Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - How to deploy to production
- [Twilio Docs](https://www.twilio.com/docs) - WhatsApp API reference
- [Next.js Docs](https://nextjs.org/docs) - Next.js framework
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM

---

For more help, see `DEPLOYMENT_GUIDE.md` 🚀
