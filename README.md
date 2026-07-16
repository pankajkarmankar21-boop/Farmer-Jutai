# Farmer Jutai 🚜

Premium farm-equipment booking app — farmers book services, drivers accept jobs in their own village, admin manages everything with revenue analytics and broadcast notifications.

## ✨ Features
- Mobile + OTP login (role: farmer / driver), separate password login for Admin
- Farmer registration with **unlimited farm plots** — each plot has its own khet address, acres, and its own 7/12 (7-12 utara) upload
- Aadhar front/back upload (camera or gallery/PDF) for both farmers and drivers, RC Book + License for drivers
- Services list with **₹550/acre/year subscription** unlocking 50% off rates on every service
- Booking flow with date + notes
- **Village-isolated job visibility** — a booking is only ever shown to drivers in the same village; other villages/drivers never see it
- **Driver incentive banner** (₹2.5 crore budget, ₹150/job) always visible at the top of the driver app
- Farmer **service history** — every past booking with date, price, status, assigned driver
- Admin → Farmer notification, automatically sent the moment a driver accepts a job (includes driver's name + phone number)
- Admin can broadcast a notification **any time** to: all farmers, all drivers, one village, or one specific person
- Admin dashboard: revenue by service, revenue by village, all bookings, and full farmer/driver details **grouped by village**, with document approve/reject

## 🗄️ 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates all 4 tables, the `documents` storage bucket, and permissive demo RLS policies.
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.

> ⚠️ The schema uses permissive RLS policies (`using (true)`) so the app works instantly with the public anon key. Booking/notification visibility is filtered by the app's queries (by village/mobile), not by RLS. Before a real public launch, add Supabase Auth (phone OTP) and tighten these policies to check `auth.uid()`/`auth.jwt()`.

## 💻 2. Run locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your Supabase URL + anon key
npm run dev
```

Open http://localhost:3000 — demo OTP is `1234`, demo admin password is `admin@123` (both changeable via `.env.local`).

## 🐙 3. Push to GitHub

```bash
git init
git add .
git commit -m "Farmer Jutai app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Or use GitHub Desktop / the GitHub website "upload files" if you prefer not to use the terminal.)

## ▲ 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo
2. In **Environment Variables**, add the same 4 keys from `.env.example` with your real Supabase values
3. Click **Deploy** — done, you'll get a live `https://your-app.vercel.app` URL

Every time you push to `main`, Vercel redeploys automatically.

## 📁 Project structure

```
app/
  layout.js       – fonts + root HTML
  globals.css     – Tailwind + premium background
  page.js         – the entire app (all screens/components)
lib/
  supabaseClient.js – Supabase client
  constants.js      – services, villages, rates, OTP/admin password
  db.js             – every Supabase query used by the app
supabase/
  schema.sql        – run this once in Supabase SQL Editor
```

## 🔒 Production hardening checklist (before going fully live)
- Replace mock OTP with a real SMS provider (Supabase phone auth + Twilio, or MSG91)
- Move admin password check to a server-side API route instead of a public env var
- Tighten RLS policies to be per-user instead of `using (true)`
- Add image compression before upload (large phone photos can be slow on rural networks)
