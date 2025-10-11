# Production Database Migration for Slug Field

## ⚠️ IMPORTANT: Manual Migration Required

Since we're on Supabase with pooled connections, we cannot run automatic migrations from Render.

You have **TWO OPTIONS** to add the `slug` field to production:

---

## Option 1: Supabase Dashboard (Recommended - Easiest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Add slug column with default empty string
ALTER TABLE "Salon" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Create unique index
CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");

-- Generate slugs for existing salons
-- Adjust this based on your existing salon names
UPDATE "Salon" SET "slug" = 'beebo' WHERE "name" = 'BeeBo';
UPDATE "Salon" SET "slug" = 'beebo' WHERE "name" = 'Beebob';
UPDATE "Salon" SET "slug" = 'hairbyl' WHERE "name" = 'Hair by L';

-- Add more UPDATE statements for other salons if needed
```

5. Click **Run** → Should show "Success, no rows returned"
6. Deploy your code to Render (it will now work with the new field)

---

## Option 2: Local Connection to Production DB

If you have access to the direct connection URL (port 5432):

1. Update `.env` with production DIRECT_URL:
   ```
   DIRECT_URL="postgresql://postgres.cwpfylvtjyvwnpfvwgpi:Bookbee12345!@aws-1-eu-central-2.pooler.supabase.com:5432/postgres"
   ```

2. Run migration:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. Run slug generation script:
   ```bash
   node scripts/add-slug-to-salons.js
   ```

**Note:** Port 5432 (direct connection) might not be accessible from local machine due to Supabase security settings.

---

## Verify Migration Worked

Test the new endpoint:
```bash
curl https://bookbee-backend-excw.onrender.com/salons/by-slug/beebo
```

Should return:
```json
{
  "id": 2,
  "name": "BeeBo",
  "slug": "beebo",
  ...
}
```

---

## Then Deploy Code

Once database migration is complete:

### 1. Commit and push changes:
```bash
git add .
git commit -m "Add subdomain support with salon slugs

- Add slug field to Salon model (unique, required)
- Add GET /salons/by-slug/:slug API endpoint
- Create Next.js middleware for subdomain detection
- Update index.tsx to show salon booking page on subdomain
- Add subdomain utility functions
- Migration: backend/prisma/migrations/20251011041540_add_salon_slug/"
git push origin main
```

### 2. Merge to production branch:
```bash
git checkout supabase-migration
git merge main
git push origin supabase-migration
```

### 3. Render will auto-deploy

---

## Testing After Deployment

### Backend Test:
```bash
# Should return BeeBo salon data
curl https://bookbee-backend-excw.onrender.com/salons/by-slug/beebo
```

### Frontend Test (Local):
1. Edit your hosts file (`C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1 beebo.localhost
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit: `http://beebo.localhost:3000`
   - Should show BeeBo's public booking page

### Frontend Test (Production - After DNS Setup):
1. Add domain to Vercel: `bookbee.dk` and `*.bookbee.dk`
2. Update DNS records
3. Visit: `https://beebo.bookbee.dk`

---

## Rollback Plan

If something goes wrong:

### Remove slug column:
```sql
DROP INDEX IF EXISTS "Salon_slug_key";
ALTER TABLE "Salon" DROP COLUMN IF EXISTS "slug";
```

### Revert code:
```bash
git revert HEAD
git push origin main
git checkout supabase-migration
git merge main
git push origin supabase-migration
```

---

## Summary

✅ **Step 1:** Run SQL in Supabase Dashboard to add `slug` column  
✅ **Step 2:** Verify slugs exist with curl test  
✅ **Step 3:** Commit and push code  
✅ **Step 4:** Merge to `supabase-migration` branch  
✅ **Step 5:** Wait for Render deployment  
✅ **Step 6:** Test subdomain routing locally  
✅ **Step 7:** Configure DNS for `bookbee.dk` when ready  

