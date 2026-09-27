import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";
import { serverConfig } from "@/lib/config/server";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({
    connectionString: serverConfig.database.url,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

let client = globalForPrisma.prisma;

if (!client || !(client as any)._runtimeDataModel?.models?.Blog?.fields?.some((f: any) => f.name === "scheduledAt")) {
  client = createPrismaClient();
}

if (!serverConfig.isProduction) {
  globalForPrisma.prisma = client;
}

const prisma: PrismaClient = client;

export default prisma;
