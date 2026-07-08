import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';

const ollama = createOpenAI({
  baseURL: 'http://host.docker.internal:11434/v1',
  apiKey: 'ollama', // Required by OpenAI SDK but ignored by Ollama
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const doctorId = parseInt(session.user.id);

    const { messages } = await req.json();

    const result = await streamText({
      // @ts-expect-error - Type mismatch between ai SDK and provider versions
      model: ollama('llama3.1'),
      maxSteps: 5,
      messages,
      system: `You are a helpful, professional AI medical assistant for a doctor. You help them analyze their patients, schedules, clinical data, and clinic performance. You have tools to fetch real data from their database. IMPORTANT: Only use tools if the user asks a specific question that requires fetching data. If the user just greets you (e.g. "hi", "hello"), simply greet them back warmly without calling any tools. Be concise and accurate.`,
      tools: {
        getPatientStatistics: tool({
          description: 'Get total patient count, optionally filtered by month and disease.',
          parameters: z.object({
            monthName: z.string().optional().describe('The name of the month (e.g., June, July). If not provided, returns all-time stats.'),
            disease: z.string().optional().describe('Specific disease to filter by (e.g., Fever, Diabetes).'),
          }),
          execute: async ({ monthName, disease }) => {
            const whereClause: any = { doctorId };
            
            if (disease) {
              whereClause.disease = { contains: disease, mode: 'insensitive' };
            }

            const patients = await prisma.patient.findMany({
              where: whereClause,
              select: { id: true, name: true, disease: true, createdAt: true },
            });

            if (monthName) {
              const targetMonth = new Date(Date.parse(monthName +" 1, 2026")).getMonth();
              const filtered = patients.filter(p => p.createdAt.getMonth() === targetMonth);
              return { 
                count: filtered.length, 
                details: `Found ${filtered.length} patients with ${disease || 'any disease'} in ${monthName}.`,
                patientNames: filtered.map(p => p.name)
              };
            }

            return { 
              count: patients.length, 
              details: `Found ${patients.length} total patients with ${disease || 'any disease'}.`,
              patientNames: patients.map(p => p.name)
            };
          },
        }),
        getFeedbackAnalysis: tool({
          description: 'Get recent patient feedback and health scores to analyze clinic performance drops or improvements.',
          parameters: z.object({}),
          execute: async () => {
            const feedbacks = await prisma.feedback.findMany({
              where: { doctorId },
              include: { patient: { select: { name: true } } },
              orderBy: { createdAt: 'desc' },
              take: 10,
            });

            return {
              recentFeedbacks: feedbacks.map(f => ({
                patient: f.patient.name,
                status: f.status,
                notes: f.notes || 'No notes',
                date: f.createdAt.toISOString().split('T')[0]
              })),
              summary: `Found ${feedbacks.length} recent feedbacks.`
            };
          }
        }),
        getAppointments: tool({
          description: 'Get appointments based on status (PENDING, CONFIRMED, etc) or by date range.',
          parameters: z.object({
            status: z.string().optional().describe('Filter by status like PENDING or CONFIRMED')
          }),
          execute: async ({ status }) => {
            const where: any = { doctorId };
            if (status) where.status = status.toUpperCase();
            
            const appts = await prisma.appointment.findMany({
              where,
              include: { patient: { select: { name: true, mobileNumber: true } } },
              orderBy: { createdAt: 'desc' },
              take: 20
            });
            return {
              count: appts.length,
              appointments: appts.map(a => ({
                patient: a.patient.name,
                phone: a.patient.mobileNumber,
                time: a.proposedTime,
                status: a.status
              }))
            };
          }
        }),
        getQueueTokens: tool({
          description: 'Get today\'s live queue tokens for the clinic.',
          parameters: z.object({}),
          execute: async () => {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            const tokens = await prisma.queueToken.findMany({
              where: { 
                doctorId,
                date: { gte: startOfDay, lte: endOfDay }
              },
              orderBy: { tokenNumber: 'asc' }
            });
            return {
              count: tokens.length,
              tokens: tokens.map(t => ({
                number: t.tokenNumber,
                patient: t.patientName,
                status: t.status
              }))
            };
          }
        }),
        getClinicalData: tool({
          description: 'Get recent clinical data for patients (vitals, lab reports, or diet plans).',
          parameters: z.object({
            type: z.enum(['vitals', 'labReports', 'dietPlans']).describe('The type of clinical data to fetch')
          }),
          execute: async ({ type }) => {
            if (type === 'vitals') {
              const vitals = await prisma.vital.findMany({
                where: { patient: { doctorId } },
                include: { patient: { select: { name: true } } },
                orderBy: { timestamp: 'desc' },
                take: 10
              });
              return vitals.map(v => ({ patient: v.patient.name, type: v.type, value: v.value, unit: v.unit }));
            }
            if (type === 'labReports') {
              const reports = await prisma.labReport.findMany({
                where: { patient: { doctorId } },
                include: { patient: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10
              });
              return reports.map(r => ({ patient: r.patient.name, aiSummary: r.aiSummary || 'No summary', doctorSummary: r.doctorSummary || 'No summary' }));
            }
            if (type === 'dietPlans') {
              const plans = await prisma.dietPlan.findMany({
                where: { doctorId },
                include: { patient: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10
              });
              return plans.map(p => ({ patient: p.patient.name, plan: p.planContent }));
            }
            return { error: 'Unknown data type' };
          }
        })
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
