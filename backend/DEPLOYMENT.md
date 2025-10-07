# Backend Deployment (Docker / Railway / Render)

## Environment Variables
Required:
- `DATABASE_URL` (Postgres / Supabase)
- `NODE_ENV=production`
- `ALLOWED_ORIGINS` (comma separated origins, e.g. `https://bookbee.vercel.app`)
- (Optional) `PORT` (default 4000)

## Build & Run (Docker)
```bash
# Build image
docker build -t bookbee-backend .
# Run container (local test)
docker run -p 4000:4000 \
  -e DATABASE_URL=postgresql://... \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  bookbee-backend
```
Server starts after auto `prisma migrate deploy`.

## Railway / Render
Either point service to repo root with Root Directory = `backend` OR build via Dockerfile.

### If using Buildpacks (no Docker):
Build Command:
```
npm install && npm run build && npm run migrate:deploy && npm run seed
```
Start Command:
```
npm start
```
After first successful deploy, you can remove `&& npm run seed` from build cmd.

### If using Docker:
Railway/Render autodetects `Dockerfile`.
No custom build cmd needed; just ensure env variables are set.

## Seeding
Run once (already idempotent due to upsert):
```
npm run seed
```
(Inside the running service shell or part of first build.)

## Health Check
Endpoint: `GET /` returns simple text.

## Public Endpoints Summary
- `GET /public/salons/:id`
- `GET /public/salons/:id/services`
- `POST /public/salons/:id/bookings`

## Internal Endpoints Summary
CRUD for salons, services, bookings under `/salons`, `/services`, `/bookings`.

## Common Issues
| Symptom | Fix |
|---------|-----|
| 500 on public endpoints | Migrations not applied → run `npx prisma migrate deploy` |
| CORS blocked | Add correct origin to `ALLOWED_ORIGINS` (no trailing slash) |
| 404 salon | Run seed script or create via profile UI |
| Prisma client mismatch | Ensure `postinstall` runs `prisma generate` |

## Post Deployment Hardening (Later)
- Add rate limiting (e.g. express-rate-limit) for public booking
- Add auth layer (JWT / Supabase Auth) around internal routes
- Observability: add structured logging & uptime monitor
