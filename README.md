# VIDDL — Universal Video Downloader

**VIDDL** is a modern, high-performance web application that enables users to paste public video URLs, analyze available media resolutions/formats, submit background download jobs, monitor progress in real-time, and manage temporary video file lifecycles.

Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

---

## 🏛️ Architecture Overview

```text
GitHub (Source Repository)
   ↓
Vercel (Edge Serverless Hosting)
   ↓
Next.js (App Router, API Routes & Server Components)
   ↓
Supabase (Auth, PostgreSQL DB & Row Level Security)
   ↓
Processing Provider System (Mock Adapter / External REST Service)
```

---

## ✨ Features

- 🔍 **URL Validation & Security**: SSRF protection preventing internal/private IP scanning (`127.0.0.1`, `10.x`, `172.16.x`, `192.168.x`, `169.254.x`).
- 🎬 **Multi-Extractor Architecture**: Extensible `VideoExtractor` framework (`DirectVideoExtractor`, `HTML5VideoExtractor`).
- ⚡ **Processing Provider Abstraction**: Decoupled backend execution system with `MockProcessingProvider` (for local development) and `ExternalProcessingProvider` (for REST API integration).
- 📊 **Real-time Status Tracking**: Job progress status tracking (`QUEUED` → `PROCESSING` → `COMPLETED` / `FAILED` / `EXPIRED`).
- 👤 **Supabase Auth & RLS**: User authentication with strict Row Level Security policies ensuring users can only read/write their own records.
- 🛡️ **Admin Dashboard**: System metric widgets, storage analytics, and domain allowlist control (`/admin`).
- 🎨 **Modern Dark UI**: Designed with glassmorphism effects, responsive card layouts, and accessible toast notifications.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Validation**: Zod
- **Testing**: Vitest

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Installation

```bash
# Clone repository
git clone https://github.com/your-org/universal-video-downloader.git
cd universal-video-downloader

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

PROCESSING_PROVIDER=mock
PROCESSING_API_URL=https://api.external-processor.com
PROCESSING_API_KEY=your-api-key
```

### 4. Supabase Database Migration

Execute the database migration SQL located in `supabase/migrations/20260903000000_init_schema.sql` inside your Supabase SQL Editor to create tables (`profiles`, `downloads`, `download_formats`, `supported_domains`, `system_logs`) and enable Row Level Security (RLS).

Seed initial supported domains using `supabase/seed.sql`.

### 5. Local Development

Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Run Vitest unit and integration tests:

```bash
# Run tests once
npm run test

# Typecheck
npm run typecheck

# Lint check
npm run lint

# Production build
npm run build
```

---

## ⚖️ Legal & Usage Policy

**IMPORTANT**: VIDDL does **not** implement DRM bypass, paywall bypass, token hijacking, or private authentication scraping. The application only analyzes and processes publicly accessible media streams and HTML5 media elements.
