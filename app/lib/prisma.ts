import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Sanitize engine type to avoid validation errors on Windows
  const engineType = process.env.PRISMA_CLIENT_ENGINE_TYPE?.trim();
  if (!engineType || (engineType !== 'library' && engineType !== 'binary')) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
  }
  
  return new PrismaClient({
    log: ['query'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
