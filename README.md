# PBL Portal

Project-Based Learning portal with:
- a Next.js frontend in the repo root
- an Express + Prisma backend in `server`
- SQLite for local development

## Quick Start

### 1. Install dependencies

From the repo root:

```bash
npm install
```

From the backend folder:

```bash
cd server
npm install
```

### 2. Prepare the backend

From `server`:

```bash
npm run setup
```

This will:
- create or repair `server/.env`
- put the SQLite database in your local temp folder instead of OneDrive
- reset the local demo database
- generate Prisma client
- bootstrap database tables
- seed sample data

### 3. Start the app

Terminal 1, backend:

```bash
npm run server:dev
```

Terminal 2, frontend:

```bash
npm run dev
```

Open `http://localhost:3000`

## Local Environment Files

Frontend example:
- copy `.env.local.example` to `.env.local` if you want to override the API URL

Backend example:
- copy `server/.env.example` to `server/.env`
- or just run `npm run server:env` / `cd server && npm run env`

## Why The Database Uses Temp Storage

SQLite is often unreliable inside synced folders like OneDrive and can throw `disk I/O error`.
To avoid that, local development uses a database file in your Windows temp directory by default.

## Useful Commands

From the repo root:

```bash
npm run server:env
npm run server:setup
npm run server:dev
npm run dev
```

From `server`:

```bash
npm run env
npm run setup
npm run db:bootstrap
npm run dev
```

## Demo Supervisor Logins

After `npm run setup`, you can use:

```text
John Doe: supervisor@muj.manipal.edu / admin
Preeti Narooka: preeti.narooka@muj.manipal.edu / admin
Stuti Pandey: stuti.pandey@muj.manipal.edu / admin
Kanwal Preet Kaur: kanwalpreet.kaur@muj.manipal.edu / admin
```
