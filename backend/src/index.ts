import express, { Request, Response } from 'express';
import cors from 'cors';
// import { JsonStorage } from './storage'; // Midlertidig: erstattes af Prisma
import prisma from './prismaClient';

const app = express();

app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Admin Backend API is running');
});

// Admin endpoints
// Dummy admin endpoint (empty array)
app.get('/admins', (req: Request, res: Response) => {
  res.json([]);
});

// ========== Salon endpoints (Prisma) ==========
app.get('/salons', async (_req: Request, res: Response) => {
  try {
    const salons = await prisma.salon.findMany({
      include: { services: true }
    });
    res.json(salons);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente saloner' });
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
    const salon = await prisma.salon.create({ data: { name, owner, address, email, type } });
    res.status(201).json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke oprette kunde' });
  }
});

app.patch('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, owner, address, email, type, paid, publicConfig } = req.body;
    const existing = await prisma.salon.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Kunde ikke fundet' });
    if (email && email !== existing.email) {
      const conflict = await prisma.salon.findUnique({ where: { email } });
      if (conflict) return res.status(400).json({ error: 'Email bruges allerede' });
    }
    const salon = await prisma.salon.update({
      where: { id },
      data: { name, owner, address, email, type, paid, publicConfig }
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
    const { startsAt, endsAt, status, notes } = req.body;
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        status,
        notes
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
