import { promises as fs } from 'fs';
import path from 'path';

interface Salon {
  id: number;
  name: string;
  owner: string;
  email: string;
  address: string;
  type: string;
  paid: boolean;
  createdAt: Date;
}

const DATA_FILE = path.join(__dirname, '..', 'data', 'salons.json');

export class JsonStorage {
  private static async ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  static async getSalons(): Promise<Salon[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const salons = JSON.parse(data);
      // Convert createdAt back to Date objects
      return salons.map((salon: any) => ({
        ...salon,
        createdAt: new Date(salon.createdAt)
      }));
    } catch {
      return [];
    }
  }

  static async saveSalons(salons: Salon[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(salons, null, 2));
  }

  static async createSalon(data: Omit<Salon, 'id' | 'createdAt'>): Promise<Salon> {
    const salons = await this.getSalons();
    const id = salons.length > 0 ? Math.max(...salons.map(s => s.id)) + 1 : 1;
    const newSalon: Salon = {
      ...data,
      id,
      createdAt: new Date()
    };
    salons.push(newSalon);
    await this.saveSalons(salons);
    return newSalon;
  }

  static async updateSalon(id: number, data: Partial<Omit<Salon, 'id' | 'createdAt'>>): Promise<Salon | null> {
    const salons = await this.getSalons();
    const index = salons.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    salons[index] = { ...salons[index], ...data };
    await this.saveSalons(salons);
    return salons[index];
  }

  static async deleteSalon(id: number): Promise<boolean> {
    const salons = await this.getSalons();
    const index = salons.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    salons.splice(index, 1);
    await this.saveSalons(salons);
    return true;
  }
}