import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'HealthNuero — Smart Medicine Reminders for Doctors & Patients',
  description: 'HealthNuero helps doctors schedule and send WhatsApp medicine reminders to patients. Track dosages, manage prescriptions, and ensure patients never miss a dose.',
  keywords: 'medicine reminder, doctor, patient, WhatsApp, prescription, dosage tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-medical-pattern min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}