import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL!
  if (url.includes("sslmode=require") || url.includes("sslmode=no-verify")) {
    return url
  }
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}sslmode=require`
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
})

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
