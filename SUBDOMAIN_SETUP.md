# Subdomain Setup Guide for bookbee.dk

## Overview
This guide explains how to set up subdomain-based multi-tenancy for your booking system.

**URL Structure:**
- `bookbee.dk` → Main site (admin dashboard)
- `beebo.bookbee.dk` → BeeBo salon's public booking page
- `hairsalon.bookbee.dk` → Another salon's public booking page

Each salon gets their own subdomain based on their `slug` field.

---

## Step 1: Buy Domain

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Purchase `bookbee.dk`
3. Note down the registrar's nameservers

---

## Step 2: Add Domain to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **bookbee-flame** project
3. Click **Settings** → **Domains**
4. Add `bookbee.dk`
5. Vercel will show you DNS records to add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Step 3: Add Wildcard Subdomain to Vercel

**CRITICAL:** You need to add wildcard subdomain support.

1. In Vercel Domains settings, click **Add Domain**
2. Enter: `*.bookbee.dk`
3. Vercel will provide a CNAME record:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

This allows all subdomains (beebo.bookbee.dk, hairsalon.bookbee.dk, etc.) to work.

---

## Step 4: Update DNS at Your Registrar

Go to your domain registrar's DNS management page and add these records:

| Type  | Name | Value                     | TTL  |
|-------|------|---------------------------|------|
| A     | @    | 76.76.21.21               | 3600 |
| CNAME | www  | cname.vercel-dns.com      | 3600 |
| CNAME | *    | cname.vercel-dns.com      | 3600 |

**Note:** The wildcard `*` CNAME is essential for subdomain routing to work.

---

## Step 5: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Usually happens within 15-60 minutes
- Check status: https://dnschecker.org/

Test your domains:
```bash
# Should resolve to Vercel
nslookup bookbee.dk
nslookup beebo.bookbee.dk
nslookup anythingelse.bookbee.dk
```

---

## Step 6: Update Backend ALLOWED_ORIGINS

Since salons will access from different subdomains, update Render environment variable:

1. Go to Render Dashboard → bookbee-backend → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   http://localhost:3000,https://bookbee-flame.vercel.app,https://bookbee.dk,https://*.bookbee.dk
   ```
3. Save and redeploy

---

## Step 7: Test Subdomain Routing

### Production Test:
1. Visit `https://bookbee.dk` → Should redirect to dashboard
2. Visit `https://beebo.bookbee.dk` → Should show BeeBo's public booking page
3. Visit `https://nonexistent.bookbee.dk` → Should show "Salon not found" error

### Local Development Test:
For local testing with subdomains, you can use:

1. **Edit hosts file** (requires admin):
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Mac/Linux: `/etc/hosts`
   
   Add:
   ```
   127.0.0.1 beebo.localhost
   127.0.0.1 hairsalon.localhost
   ```

2. **Or use localhost.run** (no config needed):
   ```bash
   cd frontend
   npm run dev
   # In another terminal:
   ssh -R 80:localhost:3000 localhost.run
   ```
   You'll get a URL like `https://abc123.localhost.run` that supports subdomains

---

## How It Works

### 1. Middleware Detection
`frontend/middleware.ts` runs on every request and:
- Extracts subdomain from hostname
- Passes it as query param to pages
- Example: `beebo.bookbee.dk` → `query.subdomain = "beebo"`

### 2. Page Rendering
`pages/index.tsx`:
- No subdomain → Redirect to `/dashboard`
- Subdomain present → Fetch salon by slug from API
- Show salon's public booking page

### 3. Backend API
`backend/src/index.ts`:
- Endpoint: `GET /salons/by-slug/:slug`
- Returns salon data for the subdomain

---

## Managing Salon Slugs

### Via API:
```bash
# Create new salon with slug
POST /salons
{
  "name": "New Salon",
  "slug": "newsalon",  # Auto-generated from name if not provided
  "owner": "...",
  "email": "...",
  ...
}

# Update existing salon's slug
PATCH /salons/2
{
  "slug": "new-slug"
}
```

### Slug Generation Rules:
- Lowercase
- Danish characters: æ→ae, ø→oe, å→aa
- Spaces/special chars → dashes
- Auto-deduplication if exists (adds -1, -2, etc.)

Examples:
- "BeeBo" → "beebo"
- "Hair by L" → "hair-by-l"
- "Salon Åbent" → "salon-aabent"

---

## Troubleshooting

### Subdomain not working?
1. Check Vercel has wildcard domain `*.bookbee.dk` added
2. Verify DNS CNAME for `*` exists and points to Vercel
3. Clear browser DNS cache: `chrome://net-internals/#dns`
4. Wait longer for DNS propagation

### CORS errors?
- Check Render backend ALLOWED_ORIGINS includes `https://*.bookbee.dk`
- Or add specific subdomains: `https://beebo.bookbee.dk,https://hairsalon.bookbee.dk`

### "Salon not found" on subdomain?
1. Check salon has a slug in database:
   ```bash
   # Test endpoint
   curl https://bookbee-backend-excw.onrender.com/salons/by-slug/beebo
   ```
2. If missing, run migration script:
   ```bash
   cd backend
   node scripts/add-slug-to-salons.js
   ```

---

## Next Steps

1. ✅ Buy `bookbee.dk` domain
2. ✅ Add to Vercel (main + wildcard)
3. ✅ Update DNS records at registrar
4. ✅ Update Render ALLOWED_ORIGINS
5. ✅ Test subdomains work
6. ✅ Share subdomain URLs with salon owners!

Example email to salon:
```
Hi BeeBo,

Your booking page is now live at:
https://beebo.bookbee.dk

Share this link with your customers to let them book appointments online!

Admin login: https://bookbee.dk/client/login
```

---

## Production Checklist

Before going live:
- [ ] Domain purchased and DNS configured
- [ ] Wildcard subdomain working on Vercel
- [ ] All salons have unique slugs assigned
- [ ] Backend CORS updated for subdomains
- [ ] Test booking flow on subdomain
- [ ] SSL certificates valid for wildcard
- [ ] Share subdomain URLs with clients
