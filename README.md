# Personal OS

A Personal Operating System — a unified life-management app for **tasks, notes,
and habits**. Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS
v4 + Supabase**, and packaged for Android with **Capacitor**.

---

## Stack

| Layer      | Tech                                             |
|------------|--------------------------------------------------|
| Frontend   | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Auth + DB  | Supabase (Postgres, Row Level Security, Auth)    |
| Mobile     | Capacitor 6 (Android WebView shell)              |
| Build      | Gradle 8.9, AGP 8.5, Kotlin 1.9, JDK 17          |

## Features

- Authentication (email/password) + onboarding flow + session-refresh middleware
- Dashboard with live stats and upcoming events
- Tasks, Notes, Habits — full CRUD
- Routines (ordered step checklists), Calendar (month grid + events)
- Life Areas, Reviews (daily/weekly/monthly), Knowledge Base (tags + search)
- Statistics (charts), global Search, Notifications
- Settings: profile, theme (system/light/dark), backup export/import
- PWA (installable + offline service worker)
- Full Row Level Security across all 11 tables

---

## Getting started (web)

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

### Database

Apply the schema in `supabase/migrations/0001_init.sql` via the Supabase SQL
editor or the CLI (`supabase db push`). It creates the `profiles`, `tasks`,
`notes`, `habits`, and `habit_logs` tables with RLS policies and triggers.

---

## Android build

Prerequisites: **Node 18+, JDK 17, Android SDK** (platform 34, build-tools 34),
and internet access on first run.

```bash
./scripts/build-android.sh      # → release/app.apk  (debug-signed)
./scripts/build-release.sh      # → release/app-release.apk
```

Or step by step:

```bash
npm install
CAPACITOR_BUILD=true npm run build   # static export → ./out
npx cap sync android                 # copy bundle into android/
cd android
./gradlew assembleDebug              # → app/build/outputs/apk/debug/app-debug.apk
```

Open `android/` in **Android Studio** to build/run on a device or emulator.

> **Note on the Gradle wrapper jar:** `android/gradle/wrapper/gradle-wrapper.jar`
> is regenerated automatically the first time you open the project in Android
> Studio, or by running `gradle wrapper --gradle-version 8.9` in `android/`.
> See `android/gradle/wrapper/README.txt`.

---

## Project layout

```
.
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # login + signup
│   ├── dashboard/        # dashboard
│   ├── tasks/            # tasks feature
│   ├── notes/            # notes feature
│   ├── habits/           # habits feature
│   ├── settings/         # account settings
│   └── api/health/       # health check endpoint
├── components/           # UI + layout components
├── lib/                  # Supabase clients, types, utils
├── supabase/migrations/  # SQL schema + RLS
├── android/              # Capacitor Android project (Gradle)
├── scripts/              # build + asset-generation scripts
├── capacitor.config.ts   # Capacitor configuration
└── BUILD_REPORT.md       # generated file inventory
```

## Environment variables

See `.env.example` (dev) and `.env.production.example` (prod). Required:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Server-only:
`SUPABASE_SERVICE_ROLE_KEY`.

## License

Proprietary — all rights reserved.
