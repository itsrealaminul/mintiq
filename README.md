# MINTIQ — Micro Earning Platform

বাংলাদেশের #১ মাইক্রো আর্নিং প্ল্যাটফর্ম। বিজ্ঞাপন দেখুন, ভিডিও দেখুন, সার্ভে সম্পন্ন করুন, গেম খেলুন — পয়েন্ট আয় করুন এবং bKash, Nagad-এ সরাসরি টাকা তুলুন।

## Features

- 🎯 **বিজ্ঞাপন দেখুন** — ছোট বিজ্ঞাপন দেখে পয়েন্ট আয়
- 📺 **ভিডিও দেখুন** — ভিডিও দেখে বোনাস পয়েন্ট
- 📝 **সার্ভে** — সার্ভে পূরণ করে বেশি আয়
- 🎮 **গেম** — মজার গেম খেলে পয়েন্ট
- 📋 **মাইক্রো টাস্ক** — ছোট ছোট কাজ করে আয়
- 💰 **উত্তোলন** — bKash, Nagad, Rocket, Bank-এ টাকা তুলুন
- 🏆 **লিডারবোর্ড** — টপ আর্নারদের তালিকা
- 🎁 **রেফারেল** — বন্ধুকে invite করে ১০০ পয়েন্ট বোনাস
- 🏅 **অর্জন** — ব্যাজ সিস্টেম
- 🔥 **দৈনিক বোনাস** — প্রতিদিন লগইন করে বোনাস

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React
- **Deployment:** Vercel

## Setup

### 1. Supabase Setup

1. [supabase.com](https://supabase.com) এ ফ্রি account বানাও
2. New Project তৈরি করো
3. **SQL Editor** এ যাও → `supabase/schema.sql` এর সব কোড paste করে Run করো
4. **Settings → API** থেকে `Project URL` এবং `anon public key` কপি করো

### 2. Environment Variables

`.env.local` ফাইল তৈরি করো:

```bash
cp .env.local.example .env.local
```

তারপর আপনার Supabase credentials দিন:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel
```

বা [vercel.com](https://vercel.com) এ গিয়ে GitHub repo import করো।

## Project Structure

```
mintiq/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── login/              # Auth
│   ├── dashboard/          # User dashboard + all features
│   └── creator/            # Creator dashboard
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Sidebar, MobileNav
├── lib/
│   ├── auth-context.tsx    # Auth provider
│   ├── supabase/           # Supabase client
│   ├── types.ts            # TypeScript types
│   ├── hooks.ts            # Custom hooks
│   └── utils.ts            # Utility functions
├── supabase/
│   └── schema.sql          # Full database schema
└── public/
```

## License

MIT
