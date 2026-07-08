import { createOllama } from 'ollama-ai-provider';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { NextResponse } from 'next/server';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
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
      model: ollama('llama3'),
      messages,
      system: `You are a helpful, professional AI medical assistant for a doctor. You help them analyze their patients, schedules, and clinic performance. You can use tools to fetch real data from their database. Be concise and accurate.`,
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
                details: `Found ${filtered.length} patients with ${disease || 'any disease'} in ${monthName}.` 
              };
            }

            return { 
              count: patients.length, 
              details: `Found ${patients.length} total patients with ${disease || 'any disease'}.` 
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
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
