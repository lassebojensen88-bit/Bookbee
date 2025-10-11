# Fix Render Production Error: "prepared statement already exists"

## Problem
Production backend crashes with error:
```
prepared statement "s1" already exists
ConnectorError: QueryError(PostgresError { code: "42P05" })
```

## Root Cause
Supabase uses PgBouncer for connection pooling (port 6543). Prisma's prepared statements conflict when connections are reused.

## Solution
Add `?pgbouncer=true` to your DATABASE_URL in Render.

### Steps:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `bookbee-backend` service
3. Click **Environment** tab
4. Find `DATABASE_URL` variable
5. Click **Edit**
6. Add `?pgbouncer=true` to the end of the URL

**Before:**
```
postgresql://postgres.cwpfylvtjyvwnpfvwgpi:****@aws-1-eu-central-2.pooler.supabase.com:6543/postgres
```

**After:**
```
postgresql://postgres.cwpfylvtjyvwnpfvwgpi:****@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

7. Click **Save Changes**
8. Render will automatically redeploy

## Verification
After deployment completes, test the API:
```powershell
Invoke-WebRequest -Uri "https://bookbee-backend-excw.onrender.com/salons/2"
```

Should return salon data without errors.

## Reference
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [PgBouncer Configuration](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer)
