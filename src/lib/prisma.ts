import { PrismaClient } from "@prisma/client"
import { Pool, types } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL!

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })

  types.setTypeParser(types.builtins.INT8, (val: string) => parseInt(val, 10))
  types.setTypeParser(types.builtins.NUMERIC, (val: string) => parseFloat(val))
  types.setTypeParser(types.builtins.DATE, (val: string) => val)
  types.setTypeParser(types.builtins.TIMESTAMP, (val: string) => val)
  types.setTypeParser(types.builtins.TIMESTAMPTZ, (val: string) => val)

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma