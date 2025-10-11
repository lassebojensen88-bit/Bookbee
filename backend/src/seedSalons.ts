import { PrismaClient } from '@prisma/client';
// Seed script: Kører sikre upserts til basis salon data i prod/stage

const prisma = new PrismaClient();

async function main() {

  await prisma.salon.upsert({
    where: { email: 'beebob@salon.dk' },
    update: {
      owner: 'Benny Bob'
    },
    create: {
      name: 'Beebob',
      slug: 'beebob',
      owner: 'Benny Bob',
      email: 'beebob@salon.dk',
      address: 'Hovedgade 1, 1234 Byen',
      type: 'frisør'
    },
  });

  await prisma.salon.upsert({
    where: { email: 'hairbyl@salon.dk' },
    update: {
      owner: 'Linda L'
    },
    create: {
      name: 'Hair by L',
      slug: 'hairbyl',
      owner: 'Linda L',
      email: 'hairbyl@salon.dk',
      address: 'Strøget 2, 5678 Byen',
      type: 'frisør'
    },
  });

  console.log('Salons seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });