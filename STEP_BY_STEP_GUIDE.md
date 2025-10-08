# 🚀 Step-by-Step Guide: Lokal Schema Deployment

## 📋 Oversigt
Denne guide løser timeout problemer med `db push` og `migrate deploy` ved at flytte schema operationer fra deployment-tiden til lokal udviklingstid.

---

## 🔧 Del 1: Setup Environment Variabler

### Step 1: Find dine Supabase forbindelsesstrenge

1. Gå til dit **Supabase Dashboard**
2. Vælg dit projekt
3. Gå til **Settings** → **Database**
4. Find **Connection string** sektionen

### Step 2: Kopier begge connection strings

Du skal bruge **URI** formatet for begge:

**Pooled Connection (Port 6543):**
```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection (Port 5432):**
```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Step 3: Sæt environment variabler lokalt

**Windows PowerShell:**
```powershell
# Åbn PowerShell som Administrator (valgfrit)
# Navigér til dit projekt
cd "C:\Users\Lasse Bo Jensen\Desktop\Bookingsystem\backend"

# Sæt DATABASE_URL (pooled - til runtime)
$env:DATABASE_URL = "postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Sæt DIRECT_URL (direct - til migrations)
$env:DIRECT_URL = "postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Verificer at de er sat korrekt
echo "DATABASE_URL length: $($env:DATABASE_URL.Length)"
echo "DIRECT_URL length: $($env:DIRECT_URL.Length)"
```

---

## 🗄️ Del 2: Test Database Forbindelser

### Step 4: Test direkte forbindelse

```powershell
# Test om DIRECT_URL virker
npm run test:pg
```

**Forventet output:** Information om database forbindelse og tabeller.

### Step 5: Test pooled forbindelse

```powershell
# Skift midlertidigt til pooled connection for test
$tempUrl = $env:DATABASE_URL
$env:DATABASE_URL = $env:DIRECT_URL
npm run test:db
$env:DATABASE_URL = $tempUrl
```

---

## 📦 Del 3: Kør Lokal Schema Deployment

### Step 6: Generer ny migration (hvis nødvendigt)

Hvis du har lavet ændringer i `prisma/schema.prisma`:

```powershell
# Opret ny migration
npx prisma migrate dev --name "din_migration_navn"
```

### Step 7: Kør lokal schema deployment

```powershell
# Kør det nye schema deployment script
npm run deploy:schema:ps
```

**Forventet output:**
```
🚀 Starting local schema deployment...
📊 Database URL length: [tal]
🔗 Using direct connection for schema operations

🔧 Generating Prisma Client...
✅ Prisma Client generated successfully

📋 Checking migration status...
Migration status check completed

📦 Deploying migrations...
✅ Migrations deployed successfully

🏥 Testing database connection...
Salons in database: [antal]

🎉 Schema deployment completed successfully!
💡 You can now deploy your application without schema operations.
```

---

## 🚀 Del 4: Deploy Applikation

### Step 8: Commit og push ændringer

```powershell
# Add alle ændringer
git add .

# Commit ændringerne
git commit -m "feat: implement local schema deployment to fix timeout issues"

# Push til din branch
git push origin supabase-migration
```

### Step 9: Verificer deployment på Render

1. Gå til **Render Dashboard**
2. Find din `bookbee-backend` service
3. Check at den nye deployment starter **uden** migration timeout
4. Verificer at `/health` endpoint svarer

---

## 🔧 Del 5: Setup Environment Variabler på Render

### Step 10: Sæt environment variabler på Render

1. Gå til **Render Dashboard** → **bookbee-backend**
2. Gå til **Environment** tab
3. Sæt disse variabler:

```
DATABASE_URL = postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL = postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Note:** `DIRECT_URL` bruges ikke på Render, men skal være sat for kompabilitet.

---

## ✅ Del 6: Fremtidig Workflow

### Når du laver schema ændringer:

```powershell
# 1. Lav ændringer i prisma/schema.prisma

# 2. Opret migration
npx prisma migrate dev --name "beskrivelse_af_ændring"

# 3. Test lokalt
npm run dev

# 4. Deploy schema lokalt
npm run deploy:schema:ps

# 5. Commit og push
git add .
git commit -m "feat: add new schema changes"
git push origin supabase-migration
```

---

## 🆘 Troubleshooting

### Problem: "Connection timeout"
**Løsning:**
```powershell
# Check dine environment variabler
echo $env:DIRECT_URL
echo $env:DATABASE_URL

# Verificer at DIRECT_URL bruger port 5432
```

### Problem: "Migration failed"
**Løsning:**
```powershell
# Check migration status
npx prisma migrate status

# Se hvilke migrationer der mangler
npx prisma migrate resolve --help
```

### Problem: "Database connection test failed"
**Løsning:**
```powershell
# Regenerer Prisma Client
npx prisma generate

# Test forbindelse manuelt
npx prisma studio
```

---

## 🎯 Checkliste

- [ ] Environment variabler sat (`DATABASE_URL` og `DIRECT_URL`)
- [ ] Database forbindelser testet
- [ ] Schema deployment kørt lokalt
- [ ] Applikation deployed uden timeout
- [ ] Render environment variabler opdateret
- [ ] Health endpoint verificeret

---

## 📚 Hurtig Reference

**Kommandoer du vil bruge ofte:**
```powershell
# Sæt environment variabler
$env:DATABASE_URL = "din_pooled_connection_string"
$env:DIRECT_URL = "din_direct_connection_string"

# Deploy schema lokalt
npm run deploy:schema:ps

# Test forbindelser
npm run test:pg
npm run test:db

# Udvikling
npm run dev
```

**Vigtige filer:**
- `prisma/schema.prisma` - Database schema
- `scripts/deploy-schema.ps1` - Schema deployment script
- `SCHEMA_DEPLOYMENT.md` - Detaljeret dokumentation