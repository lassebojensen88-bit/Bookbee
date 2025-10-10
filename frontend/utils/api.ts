// Simple API helper layer. Later we can swap to SWR/React Query.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bookbee-backend-excw.onrender.com';

export interface Salon {
  id: number;
  name: string;
  owner: string;
  email: string;
  address: string;
  type: string;
  paid: boolean;
  createdAt: string;
  publicConfig?: any;
}

export interface Service {
  id: number;
  salonId: number;
  name: string;
  description?: string | null;
  durationMin: number;
  price: string; // Decimal as string
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  salonId: number;
  serviceId: number;
  customerName: string;
  customerEmail?: string | null;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  // Handle 204 No Content responses (e.g., DELETE operations)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json();
}

// Salons
export const listSalons = () => request<Salon[]>(`/salons`);
export const getSalon = async (id: number) => request<Salon>(`/salons/${id}`);
export const createSalon = (data: Partial<Pick<Salon, 'name' | 'owner' | 'address' | 'email' | 'type' | 'paid'>>) =>
  request<Salon>(`/salons`, { method: 'POST', body: JSON.stringify(data) });
export const updateSalon = (id: number, data: Partial<Pick<Salon, 'name' | 'owner' | 'address' | 'email' | 'type' | 'paid' | 'publicConfig'>>) =>
  request<Salon>(`/salons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteSalon = (id: number) => request<void>(`/salons/${id}`, { method: 'DELETE' });

// Services
export const listServices = (salonId: number) => request<Service[]>(`/salons/${salonId}/services`);
export const createService = (salonId: number, data: { name: string; description?: string; durationMin: number; price: string; }) =>
  request<Service>(`/salons/${salonId}/services`, { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id: number, data: Partial<Pick<Service, 'name' | 'description' | 'durationMin' | 'price' | 'active'>>) =>
  request<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteService = (id: number) => request<void>(`/services/${id}`, { method: 'DELETE' });

// Bookings
export const listBookings = (salonId: number) => request<Booking[]>(`/salons/${salonId}/bookings`);
export const createBooking = (salonId: number, data: { serviceId: number; customerName: string; customerEmail?: string; startsAt: string; endsAt: string; notes?: string; }) =>
  request<Booking>(`/salons/${salonId}/bookings`, { method: 'POST', body: JSON.stringify(data) });
export const updateBooking = (id: number, data: Partial<Pick<Booking, 'startsAt' | 'endsAt' | 'status' | 'notes'>>) =>
  request<Booking>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteBooking = (id: number) => request<void>(`/bookings/${id}`, { method: 'DELETE' });

// Utility hook examples (simple). Could be replaced by SWR later.
import { useEffect, useState } from 'react';

export function useSalons() {
  const [data, setData] = useState<Salon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { listSalons().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return { data, error, loading };
}

export function useServices(salonId: number | null) {
  const [data, setData] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!salonId);
  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    listServices(salonId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [salonId]);
  return { data, error, loading };
}

export function useBookings(salonId: number | null) {
  const [data, setData] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!salonId);
  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    listBookings(salonId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [salonId]);
  return { data, error, loading };
}
