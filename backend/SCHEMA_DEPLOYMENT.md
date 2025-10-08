# Schema Deployment Guide

## Problem
Both `db push` and `migrate deploy` timeout over pooled connections during deployment. This indicates that schema read/write operations are too slow over the pooled connection.

## Solution: Local Schema Operations

Instead of running schema operations during deployment (where they timeout), we now run them locally with a direct connection, then deploy the application without schema steps.

## Prerequisites

1. **Direct Database Connection**: Ensure you have a `DIRECT_URL` environment variable pointing to the direct database connection (usually port 5432)
2. **Local Access**: Your local machine must be able to reach the database directly

## Usage

### Step 1: Run Schema Operations Locally

Choose your platform:

**Windows (PowerShell):**
```powershell
# Set your direct database connection
$env:DIRECT_URL = "postgresql://postgres:[password]@[host]:5432/[database]"

# Navigate to backend directory
cd backend

# Run schema deployment
npm run deploy:schema:ps
```

**Linux/Mac/WSL:**
```bash
# Set your direct database connection
export DIRECT_URL="postgresql://postgres:[password]@[host]:5432/[database]"

# Navigate to backend directory
cd backend

# Run schema deployment
npm run deploy:schema
```

### Step 2: Deploy Application

After successful local schema deployment, deploy your application normally. The deployment will now start the server directly without attempting schema operations.

## What the Script Does

1. **Generates Prisma Client** - Ensures the latest schema is used
2. **Checks Migration Status** - Shows current migration state
3. **Deploys Migrations** - Applies any pending migrations using direct connection
4. **Tests Connection** - Verifies the database is accessible and responsive

## Environment Variables

**For Runtime (Production):**
- `DATABASE_URL` - Pooled connection (port 6543) - bruges til applikation runtime
- `DIRECT_URL` - Direct connection (port 5432) - bruges til migrations (kun lokalt)

**Supabase Connection Strings:**
```bash
# Runtime (pooled) - hurtig til normale operationer
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Schema operations (direct) - hurtig til migrations
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

**Note:** På Render skal begge variabler være sat, men `DIRECT_URL` bruges kun lokalt til schema operationer.

## Benefits

1. **No Timeouts** - Direct connection is much faster for schema operations
2. **Reliable Deployments** - Application starts immediately without waiting for schema operations
3. **Better Control** - You can verify schema changes locally before deployment
4. **Debugging** - Easy to troubleshoot schema issues locally

## Troubleshooting

### "Connection timeout" during schema deployment
- Verify `DIRECT_URL` points to port 5432 (direct connection)
- Check firewall/network access to database from your local machine
- Verify database credentials are correct

### "Migration failed"
- Check if there are conflicting schema changes
- Review migration files in `prisma/migrations/`
- Try `npx prisma migrate reset` locally if needed (WARNING: This will delete all data)

### "Database connection test failed"
- Ensure Prisma Client is generated: `npx prisma generate`
- Verify database is accessible and contains expected tables
- Check if schema and actual database are in sync

## Migration Workflow

1. **Development**: Make schema changes in `prisma/schema.prisma`
2. **Create Migration**: `npx prisma migrate dev --name your_migration_name`
3. **Test Locally**: `npm run deploy:schema`
4. **Deploy**: Push code to trigger deployment (schema already applied)

## Reverting to Automatic Schema Operations

If you want to revert to automatic schema operations during deployment:

1. **Dockerfile**: Change CMD back to:
   ```dockerfile
   CMD ["sh","-c","npx prisma migrate deploy && node dist/index.js"]
   ```

2. **render.yaml**: Change startCommand back to:
   ```yaml
   startCommand: npx prisma migrate deploy && node dist/index.js
   ```

3. **package.json**: Use `start` script instead of `start:no-migrate`