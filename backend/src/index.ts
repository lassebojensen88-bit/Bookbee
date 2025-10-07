import express, { Request, Response } from 'express';
import cors from 'cors';
import { JsonStorage } from './storage';

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

// Salon endpoints
app.get('/salons', async (req: Request, res: Response) => {
  try {
    const salons = await JsonStorage.getSalons();
    res.json(salons);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente saloner' });
  }
});

// Opdater salon detaljer
app.patch('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, owner, address, email, type } = req.body;
    
    const salon = await JsonStorage.updateSalon(id, {
      ...(name && { name }),
      ...(owner && { owner }),
      ...(address && { address }),
      ...(email && { email }),
      ...(type && { type })
    });
    
    if (!salon) {
      return res.status(404).json({ error: 'Kunde ikke fundet' });
    }
    
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke opdatere kunde' });
  }
});

// Opdater betalingsstatus for kunde
app.patch('/salons/:id/paid', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { paid } = req.body;
    if (typeof paid !== 'boolean') {
      return res.status(400).json({ error: 'Betalingsstatus (paid) skal være boolean' });
    }
    const salon = await JsonStorage.updateSalon(id, { paid });
    if (!salon) {
      return res.status(404).json({ error: 'Kunde ikke fundet' });
    }
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke opdatere betalingsstatus' });
  }
});

// Opdater kunde detaljer
app.patch('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, owner, address, email, type } = req.body;
    
    // Validate required fields
    if (!name || !owner || !address || !email || !type) {
      return res.status(400).json({ error: 'Alle felter skal udfyldes' });
    }
    
    // Check if email conflicts with another salon
    const allSalons = await JsonStorage.getSalons();
    const existingSalon = allSalons.find(s => s.email === email && s.id !== id);
    if (existingSalon) {
      return res.status(400).json({ error: 'En anden kunde bruger allerede denne email' });
    }
    
    const salon = await JsonStorage.updateSalon(id, { name, owner, address, email, type });
    if (!salon) {
      return res.status(404).json({ error: 'Kunde ikke fundet' });
    }
    res.json(salon);
  } catch (error) {
    res.status(404).json({ error: 'Kunde ikke fundet' });
  }
});

// Slet kunde endpoint
app.delete('/salons/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const success = await JsonStorage.deleteSalon(id);
    if (!success) {
      return res.status(404).json({ error: 'Kunde ikke fundet' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke slette kunde' });
  }
});

// Opret kunde endpoint
app.post('/salons', async (req: Request, res: Response) => {
  try {
    const { name, owner, address, email, type } = req.body;
    if (!name || !owner || !address || !email || !type) {
      return res.status(400).json({ error: 'Alle felter skal udfyldes' });
    }
    
    // Check if email already exists
    const allSalons = await JsonStorage.getSalons();
    const existingSalon = allSalons.find(s => s.email === email);
    if (existingSalon) {
      return res.status(400).json({ error: 'En kunde med denne email findes allerede' });
    }
    
    const newSalon = await JsonStorage.createSalon({
      name,
      owner,
      address,
      email,
      type,
      paid: false
    });
    res.status(201).json(newSalon);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke oprette kunde' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
