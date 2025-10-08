import { PrismaClient } from '@prisma/client';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  console.log('Connecting to DB host preview:', url.replace(/(:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3').slice(0, 80));
  const prisma = new PrismaClient();
  const now = await prisma.$queryRaw`SELECT now()`;
  console.log('DB responded:', now);
  await prisma.$disconnect();
  console.log('SUCCESS: Database reachable.');
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
