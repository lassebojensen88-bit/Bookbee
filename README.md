# Bookingsystem

Monorepo med:
- `backend/` (Express + (kommende) Prisma/Postgres/Supabase)
- `frontend/` (Next.js klient + client portal + offentlig landing page per salon)

## Første opsætning
```bash
# Backend
cp backend/.env.example backend/.env
# Udfyld værdier fra Supabase

# Frontend
cp frontend/.env.example frontend/.env
```

## Scripts
Backend:
```bash
cd backend
npm install
npm run dev
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Migrering til Supabase (plan)
1. Skift Prisma provider til postgresql
2. Tilføj modeller (Service, Booking)
3. Kør `npx prisma migrate dev`
4. Importer eksisterende salons (fra JSON storage) én gang
5. Refaktor endpoints til Prisma
6. Tilføj services + bookings endpoints
7. Frontend adapter (API > localStorage fallback)
8. Fjern localStorage senere

## Branch strategi
- `main` – stabil, klar til deploy
- `dev` – aktiv udvikling
- `feature/*` – midlertidige grene

## Environment variabler
Se `.env.example` i backend og frontend mapper.

## Næste skridt
- Opret GitHub repo og push
- Implementer Postgres schema
- API endpoints for services & bookings

