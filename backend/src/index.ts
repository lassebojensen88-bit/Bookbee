import express, { Request, Response } from 'express';
// Debug: log limited DB URL info if present (kan fjernes senere)
try {
  const raw = process.env.DATABASE_URL || '';
  const masked = raw ? raw.replace(/(:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3') : '(empty)';
  console.log('[BOOT] CWD=', process.cwd());
  console.log('[BOOT] DATABASE_URL len=', raw.length, 'preview=', masked.slice(0, 60));
} catch (e) {
  console.log('[BOOT] debug error', e);
}
import cors from 'cors';
// import { JsonStorage } from './storage'; // Midlertidig: erstattes af Prisma
import prisma from './prismaClient';

// Helper function to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const app = express();

// Dynamisk CORS: Lokalt + (kommasepareret) ALLOWED_ORIGINS fra env
const localPattern = /^http:\/\/localhost:\d+$/;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // mobile apps / curl
    if (localPattern.test(origin)) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: ' + origin));
  }
}));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Admin Backend API is running');
});

// Simpel health endpoint til platform health checks
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Admin endpoints
// Dummy admin endpoint (empty array)
app.get('/admins', (req: Request, res: Response) => {
  res.json([]);
});

// ========== Salon endpoints (Prisma) ==========
app.get('/salons', async (_req: Request, res: Response) => {
  try {
    const salons = await prisma.salon.findMany();
    res.json(salons);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente saloner' });
  }
});

// Hent enkelt salon (inkl services) – bruges til profil / public page
app.get('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) return res.status(404).json({ error: 'Salon ikke fundet' });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente salon' });
  }
});

// Hent salon by slug (til subdomain routing)
app.get('/salons/by-slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const salon = await prisma.salon.findUnique({ where: { slug } });
    if (!salon) return res.status(404).json({ error: 'Salon ikke fundet' });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente salon' });
  }
});

app.post('/salons', async (req: Request, res: Response) => {
  try {
    const { name, owner, address, email, type } = req.body;
    if (!name || !owner || !address || !email || !type) {
      return res.status(400).json({ error: 'Alle felter skal udfyldes' });
    }
    const existing = await prisma.salon.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'En kunde med denne email findes allerede' });
    }
    
    // Generate unique slug
    let slug = generateSlug(name);
    let counter = 1;
    while (await prisma.salon.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
    
    const salon = await prisma.salon.create({ data: { name, slug, owner, address, email, type } });
    res.status(201).json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke oprette kunde' });
  }
});

app.patch('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, owner, address, email, type, paid, publicConfig, slug } = req.body;
    const existing = await prisma.salon.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Kunde ikke fundet' });
    if (email && email !== existing.email) {
      const conflict = await prisma.salon.findUnique({ where: { email } });
      if (conflict) return res.status(400).json({ error: 'Email bruges allerede' });
    }
    // Check slug uniqueness if provided and different
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.salon.findUnique({ where: { slug } });
      if (slugConflict) return res.status(400).json({ error: 'Slug bruges allerede' });
    }
    const salon = await prisma.salon.update({
      where: { id },
      data: { name, slug, owner, address, email, type, paid, publicConfig }
    });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke opdatere kunde' });
  }
});

app.delete('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  await prisma.booking.deleteMany({ where: { salonId: id } });
  await prisma.service.deleteMany({ where: { salonId: id } });
    await prisma.salon.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke slette kunde' });
  }
});

// ========== Service endpoints ==========
app.get('/salons/:salonId/services', async (req: Request, res: Response) => {
  try {
    const salonId = Number(req.params.salonId);
  const services = await prisma.service.findMany({ where: { salonId } });
    res.json(services);
  } catch {
    res.status(500).json({ error: 'Kunne ikke hente services' });
  }
});

app.post('/salons/:salonId/services', async (req: Request, res: Response) => {
  try {
    const salonId = Number(req.params.salonId);
    const { name, description, durationMin, price } = req.body;
    if (!name || !durationMin || price == null) {
      return res.status(400).json({ error: 'Manglende felter (kræver name, durationMin, price)' });
    }
    const service = await prisma.service.create({
      data: { salonId, name, description, durationMin: Number(durationMin), price: price.toString() }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke oprette service' });
  }
});

app.patch('/services/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, durationMin, price, active } = req.body;
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, durationMin, price: price?.toString(), active }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke opdatere service' });
  }
});

app.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  await prisma.booking.deleteMany({ where: { serviceId: id } });
  await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke slette service' });
  }
});

// ========== Booking endpoints ==========
app.get('/salons/:salonId/bookings', async (req: Request, res: Response) => {
  try {
    const salonId = Number(req.params.salonId);
    const bookings = await prisma.booking.findMany({
      where: { salonId },
      include: { service: true }
    });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Kunne ikke hente bookinger' });
  }
});

app.post('/salons/:salonId/bookings', async (req: Request, res: Response) => {
  try {
    const salonId = Number(req.params.salonId);
    const { serviceId, customerName, customerEmail, startsAt, endsAt, notes } = req.body;
    if (!serviceId || !customerName || !startsAt || !endsAt) {
      return res.status(400).json({ error: 'Manglende felter (serviceId, customerName, startsAt, endsAt)' });
    }
    // Simple overlap check
  const overlap = await prisma.booking.findFirst({
      where: {
        salonId,
        OR: [
          { startsAt: { lte: new Date(endsAt) }, endsAt: { gte: new Date(startsAt) } }
        ]
      }
    });
    if (overlap) {
      return res.status(409).json({ error: 'Tidsrummet er allerede booket' });
    }
  const booking = await prisma.booking.create({
      data: {
        salonId,
        serviceId: Number(serviceId),
        customerName,
        customerEmail,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        notes
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke oprette booking' });
  }
});

app.patch('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { startsAt, endsAt, status, notes, serviceId } = req.body;
  const booking = await prisma.booking.update({
      where: { id },
      data: {
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        status,
        notes,
        serviceId: serviceId ? Number(serviceId) : undefined
      }
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke opdatere booking' });
  }
});

app.delete('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke slette booking' });
  }
});

// ========== Public (unauthenticated) endpoints ==========
// Return minimal salon data + active services + publicConfig
app.get('/public/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) return res.status(404).json({ error: 'Salon ikke fundet' });
    const services = await prisma.service.findMany({ where: { salonId: id, active: true } });
    res.json({
      id: salon.id,
      name: salon.name,
      address: salon.address,
      type: salon.type,
      publicConfig: salon.publicConfig || null,
      services: services.map((s: any) => ({ id: s.id, name: s.name, durationMin: s.durationMin, price: s.price, active: s.active }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Kunne ikke hente offentlig salon data' });
  }
});

// Only active services list
app.get('/public/salons/:id/services', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const services = await prisma.service.findMany({ where: { salonId: id, active: true } });
  res.json(services.map((s: any) => ({ id: s.id, name: s.name, durationMin: s.durationMin, price: s.price })));
  } catch (e) {
    res.status(500).json({ error: 'Kunne ikke hente services' });
  }
});

// Public booking creation (no auth). Later: rate limiting / captcha / double opt-in.
app.post('/public/salons/:id/bookings', async (req: Request, res: Response) => {
  try {
    const salonId = Number(req.params.id);
    const { serviceId, customerName, customerEmail, startsAt } = req.body;
    if (!serviceId || !customerName || !startsAt) {
      return res.status(400).json({ error: 'Manglende felter (serviceId, customerName, startsAt)' });
    }
    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service || service.salonId !== salonId || !service.active) {
      return res.status(400).json({ error: 'Ugyldig service' });
    }
    const start = new Date(startsAt);
    const endsAt = new Date(start.getTime() + service.durationMin * 60000);
    const overlap = await prisma.booking.findFirst({
      where: {
        salonId,
        OR: [
          { startsAt: { lte: endsAt }, endsAt: { gte: start } }
        ]
      }
    });
    if (overlap) return res.status(409).json({ error: 'Tidsrummet er allerede booket' });
    const booking = await prisma.booking.create({
      data: {
        salonId,
        serviceId: service.id,
        customerName,
        customerEmail,
        startsAt: start,
        endsAt,
        status: 'SCHEDULED'
      }
    });
    res.status(201).json({ id: booking.id, startsAt: booking.startsAt, endsAt: booking.endsAt, serviceId: booking.serviceId, status: booking.status });
  } catch (e) {
    res.status(500).json({ error: 'Kunne ikke oprette booking' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
