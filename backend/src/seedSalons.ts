import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.salon.upsert({
    where: { email: 'beebob@salon.dk' },
    update: {
      owner: 'Benny Bob'
    },
    create: {
      name: 'Beebob',
      owner: 'Benny Bob',
      email: 'beebob@salon.dk',
      address: 'Hovedgade 1, 1234 Byen',
    },
  });

  await prisma.salon.upsert({
    where: { email: 'hairbyl@salon.dk' },
    update: {
      owner: 'Linda L'
    },
    create: {
      name: 'Hair by L',
      owner: 'Linda L',
      email: 'hairbyl@salon.dk',
      address: 'Strøget 2, 5678 Byen',
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