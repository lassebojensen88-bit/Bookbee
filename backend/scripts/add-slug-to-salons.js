// Script to add slug field to existing salons
// Run this locally with: node scripts/add-slug-to-salons.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate URL-friendly slug from salon name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function addSlugsToSalons() {
  try {
    console.log('🔄 Fetching salons without slugs...');
    
    const salons = await prisma.salon.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    });

    console.log(`📋 Found ${salons.length} salons needing slugs`);

    for (const salon of salons) {
      let slug = generateSlug(salon.name);
      let counter = 1;

      // Ensure unique slug
      while (true) {
        const existing = await prisma.salon.findUnique({
          where: { slug: slug }
        });

        if (!existing) break;
        
        slug = `${generateSlug(salon.name)}-${counter}`;
        counter++;
      }

      await prisma.salon.update({
        where: { id: salon.id },
        data: { slug }
      });

      console.log(`✅ Salon "${salon.name}" → slug: "${slug}"`);
    }

    console.log('\n🎉 All salons now have slugs!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSlugsToSalons();
