# 🚀 Dummy Guide: Deploy bookbee.dk in 15 Minutes

## You have: ✅ bookbee.dk domain purchased

Follow these 3 steps to go live!

---

## STEP 1: Database Migration (3 minutes)

### 1.1 Open Supabase
- Go to: https://supabase.com/dashboard
- Click your project

### 1.2 Run SQL
- Click **"SQL Editor"** in left sidebar
- Click **"New query"** button (top right)
- Copy ALL the SQL from: `backend/prisma/migrations/production_add_slug.sql`
- Paste into the editor
- Click **"Run"** button (or press Ctrl+Enter)

### 1.3 Verify Success
You should see at the bottom:
```
Success. No rows returned
id | name    | slug
---+--------+--------
2  | Beebob | beebob
```

✅ If you see your salon(s) with slugs → SUCCESS!  
❌ If error → Copy the error message and send to me

---

## STEP 2: Deploy Code to Production (2 minutes)

### 2.1 Merge to Production Branch
```powershell
cd "C:\Users\Lasse Bo Jensen\Desktop\Bookingsystem"
git checkout supabase-migration
git merge main
git push origin supabase-migration
```

### 2.2 Wait for Render
- Go to: https://dashboard.render.com
- Click your **bookbee-backend** service
- Wait for deploy to finish (~2 minutes)
- Should see "Live ✅"

### 2.3 Test Backend
```powershell
curl https://bookbee-backend-excw.onrender.com/salons/by-slug/beebob
```

Should return salon data with `"slug": "beebob"`

✅ If data returned → Backend working!

---

## STEP 3: Connect bookbee.dk Domain (10 minutes)

### 3.1 Add Domain to Vercel

1. Go to: https://vercel.com/dashboard
2. Click your **bookbee-flame** project
3. Click **"Settings"** (top menu)
4. Click **"Domains"** (left sidebar)
5. Click **"Add"** button

**Add TWO domains:**

#### First domain:
- Enter: `bookbee.dk`
- Click "Add"
- Vercel will show DNS records

#### Second domain (CRITICAL!):
- Click "Add" again
- Enter: `*.bookbee.dk` (with the asterisk!)
- Click "Add"
- This enables ALL subdomains (beebob.bookbee.dk, etc.)

### 3.2 Copy DNS Records from Vercel

Vercel will show you records like this:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

**Write these down or keep the page open!**

### 3.3 Add DNS Records to Your Domain

**Where did you buy bookbee.dk?**

#### If from **GoDaddy**:
1. Go to: https://dcc.godaddy.com/domains
2. Click your domain "bookbee.dk"
3. Click "DNS" tab
4. Click "Add Record"
5. Add each record from Vercel

#### If from **Namecheap**:
1. Go to: https://ap.www.namecheap.com/domains/list
2. Click "Manage" next to bookbee.dk
3. Go to "Advanced DNS" tab
4. Click "Add New Record"
5. Add each record from Vercel

#### If from **One.com** or other:
1. Log into your domain registrar
2. Find "DNS Settings" or "DNS Management"
3. Add the 3 records from Vercel

**Important: Add ALL 3 records:**
- A record for `@` → `76.76.21.21`
- CNAME for `www` → `cname.vercel-dns.com`
- CNAME for `*` → `cname.vercel-dns.com` ⭐ **Don't forget the wildcard!**

### 3.4 Wait for DNS Propagation

- Usually takes 5-60 minutes
- Sometimes up to 24 hours
- You'll get email from Vercel when ready

**Check status:**
- Go to: https://dnschecker.org
- Enter: `bookbee.dk`
- Should show green checkmarks everywhere

---

## STEP 4: Update Backend CORS (1 minute)

### 4.1 Update Render Environment
1. Go to: https://dashboard.render.com
2. Click **bookbee-backend**
3. Click **"Environment"** (left sidebar)
4. Find **ALLOWED_ORIGINS**
5. Click "Edit" (pencil icon)
6. **Replace the value with:**
   ```
   http://localhost:3000,https://bookbee-flame.vercel.app,https://bookbee.dk,https://beebob.bookbee.dk
   ```
7. Click **"Save Changes"**
8. Wait 30 seconds for restart

---

## ✅ DONE! Test Your Site

### Main Site:
Visit: **https://bookbee.dk**
- Should redirect to dashboard
- Login page works

### Salon Subdomain:
Visit: **https://beebob.bookbee.dk**
- Should show Beebob's booking page
- Nice gradient background
- "Book en tid" button

### Admin Portal:
Visit: **https://bookbee.dk/client/login**
- Login with your salon credentials
- Should work normally

---

## 🎉 SUCCESS CHECKLIST

- [ ] Database migration run (salons have slugs)
- [ ] Code deployed to Render (backend has slug endpoint)
- [ ] bookbee.dk added to Vercel (main + wildcard)
- [ ] DNS records added to registrar (A + 2x CNAME)
- [ ] DNS propagated (dnschecker.org shows green)
- [ ] CORS updated on backend
- [ ] https://bookbee.dk works
- [ ] https://beebob.bookbee.dk works

---

## 📧 Email Template for Your Client

Once everything works, send this to your client:

```
Subject: Din bookingside er klar! 🎉

Hej [Client Name],

Din bookingside er nu live på internettet!

🌐 Din bookingside: https://beebob.bookbee.dk

Del dette link med dine kunder så de kan booke tid 24/7.

👤 Admin login: https://bookbee.dk/client/login
Email: [deres email]
Password: [deres password]

Her kan du:
- Se alle bookinger i kalenderen
- Tilføje/redigere services
- Administrere bookinger

Mvh,
[Dit navn]
```

---

## ❓ Troubleshooting

### "This site can't be reached" when visiting bookbee.dk?
→ DNS not propagated yet. Wait 10-30 more minutes.

### "Salon not found" on beebob.bookbee.dk?
→ Backend not deployed yet. Check Render is "Live"

### CORS error in browser console?
→ Update ALLOWED_ORIGINS on Render (Step 4)

### Vercel says "Domain not configured"?
→ Make sure you added BOTH `bookbee.dk` AND `*.bookbee.dk`

---

## 🚨 Need Help?

If anything doesn't work:
1. Take a screenshot of the error
2. Tell me which step failed
3. Copy any error messages

I'll help you fix it! 🛟

---

**Total time: ~15 minutes** (most of it is waiting for DNS)

**Cost: ~$12/year** for the domain, everything else is FREE! 🎉
