import NextAuth, { DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'
import type { NextAuthOptions } from 'next-auth'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscriptionStatus: string
      isAdmin: boolean
      role: 'DOCTOR' | 'PATIENT'
      mobileNumber?: string
    } & DefaultSession["user"]
  }

  interface User {
    subscriptionStatus: string
    planType: string
    isAdmin: boolean
    role: 'DOCTOR' | 'PATIENT'
    mobileNumber?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscriptionStatus: string
    planType: string
    isAdmin: boolean
    role: 'DOCTOR' | 'PATIENT'
    mobileNumber?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        mobileNumber: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.password) return null

        // DOCTOR LOGIN
        if (credentials.email) {
          const doctor = await prisma.doctor.findUnique({
            where: { email: credentials.email }
          })
          if (!doctor) return null
          const isPasswordValid = await bcrypt.compare(credentials.password, doctor.password)
          if (!isPasswordValid) return null

          const doctorAny = doctor as any
          return {
            id: doctor.id.toString(),
            name: doctor.name,
            email: doctor.email,
            subscriptionStatus: doctorAny.subscriptionStatus,
            planType: doctorAny.planType,
            isAdmin: doctorAny.isAdmin,
            role: 'DOCTOR'
          }
        }

        // PATIENT LOGIN
        if (credentials.mobileNumber) {
          const patient = await prisma.patientUser.findUnique({
             where: { mobileNumber: credentials.mobileNumber }
          })
          if (!patient) return null
          const isPasswordValid = await bcrypt.compare(credentials.password, patient.password)
          if (!isPasswordValid) return null

          return {
            id: patient.id.toString(),
            name: patient.name || 'Patient',
            mobileNumber: patient.mobileNumber,
            subscriptionStatus: 'ACTIVE',
            planType: 'PATIENT',
            isAdmin: false,
            role: 'PATIENT'
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
        (session.user as any).planType = token.planType;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).role = token.role;
        (session.user as any).mobileNumber = token.mobileNumber;
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.subscriptionStatus = (user as any).subscriptionStatus
        token.planType = (user as any).planType
        token.isAdmin = (user as any).isAdmin
        token.role = (user as any).role
        token.mobileNumber = (user as any).mobileNumber
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  },
}