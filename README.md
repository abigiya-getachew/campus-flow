# CampusFlow

**Know what to do next.** CampusFlow is a student academic management and productivity platform that organizes courses, assignments, grades, and study plans into one clean workspace, with a priority engine that always surfaces the next right move.

Built as a full-stack TypeScript application: React 19 + Vite frontend, Express + MongoDB (Mongoose) backend, JWT authentication.

---

## Tech Stack

| Layer     | Technology                                                                 |
| --------- | -------------------------------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite 6, Tailwind CSS v4, wouter, framer-motion, lucide-react, sonner |
| Backend   | Node.js, Express 4, TypeScript (run via tsx)                                |
| Database  | MongoDB Atlas (Mongoose 8)                                                  |
| Auth      | JWT (jsonwebtoken), bcryptjs password hashing                               |
| Tooling   | pnpm workspaces (independent `client/` and `server/` packages)              |

## Features

- **Marketing landing page** — hero with animated product mockup, features, dashboard showcase, how-it-works timeline, CTA, footer
- **Authentication** — register, login, logout, JWT sessions (7-day expiry), protected `/app` route, session restore on reload
- **Student dashboard** — overview with a "next move" recommendation, priority-ranked assignment ledger, weekly schedule, course cards, grade tracking, rule-based study planner
- **Responsive UI** — mobile-first, works from 375px up

> **Current state (honest scope):** authentication is fully backed by MongoDB. Dashboard academic data (assignments, courses, grades) is still client-side seed data persisted in `localStorage`; server persistence for it is on the roadmap.

## Project Structure

```
Campus Flow/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI primitives, ProtectedRoute, landing sections
│   │   ├── contexts/        # AuthContext (JWT + fetch), ThemeContext
│   │   ├── pages/           # Landing, Login, Register, Home (dashboard), NotFound
│   │   └── lib/utils.ts
│   └── vite.config.ts       # dev proxy: /api → http://localhost:5000
├── server/                  # Express + MongoDB API
│   ├── index.ts             # app entry: env → DB connect → routes → static SPA
│   ├── env.ts               # dotenv loader
│   ├── models/User.ts       # Mongoose user schema (hashed password)
│   ├── routes/auth.ts       # /api/auth/register · /login · /me
│   ├── middleware/auth.ts   # JWT bearer verification
│   └── .env                 # local config (git-ignored)
├── PRD.md
└── DesignBrief.md
```

## Getting Started (Development)

### Prerequisites

- Node.js 20+ (tested on 24)
- pnpm 9+
- A MongoDB Atlas cluster (free tier works)

### 1. Install dependencies

```bash
cd client && pnpm install
cd ../server && pnpm install
```

### 2. Configure the server environment

Create `server/.env` (see `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campusflow"
JWT_SECRET=<long-random-string>
CORS_ORIGIN="http://localhost:5173"
```

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server **refuses to start** if `MONGODB_URI` is missing or `JWT_SECRET` is still the placeholder.

### 3. Run both apps

```bash
# terminal 1 — API on http://localhost:5000
cd server && pnpm dev

# terminal 2 — frontend on http://localhost:5173
cd client && pnpm dev
```

The Vite dev server proxies `/api/*` to the backend, so the frontend always calls same-origin URLs — no CORS configuration needed in development.

## API Reference

Base URL: `/api/auth` — all responses are JSON `{ message }` on error.

| Method | Endpoint          | Auth     | Success                | Errors                                  |
| ------ | ----------------- | -------- | ---------------------- | --------------------------------------- |
| POST   | `/api/auth/register` | —     | `201 { token, user }`  | `400` validation · `409` email taken     |
| POST   | `/api/auth/login`    | —     | `200 { token, user }`  | `400` validation · `401` bad credentials |
| GET    | `/api/auth/me`       | Bearer | `200 { user }`         | `401` missing/expired/invalid token      |

**Request bodies**

```jsonc
// register
{ "name": "Hana T.", "email": "hana@example.com", "password": "min8chars" }
// login
{ "email": "hana@example.com", "password": "min8chars" }
```

**User shape:** `{ "id": "<mongo _id>", "name": "...", "email": "..." }` — never includes the password hash.

Auth header for protected routes: `Authorization: Bearer <token>`.

## Production Deployment

The server is a single deployable service: it serves the API **and** the built frontend from `client/dist`.

### Build

```bash
cd client && pnpm install && pnpm build     # → client/dist
cd ../server && pnpm install                # API runs TypeScript directly via tsx
```

### Start

```bash
cd server && pnpm start                     # serves API + SPA on $PORT
```

### Environment variables (production)

| Variable        | Required | Notes                                                        |
| --------------- | -------- | ------------------------------------------------------------ |
| `MONGODB_URI`   | yes      | Atlas connection string                                      |
| `JWT_SECRET`    | yes      | unique per environment; rotating it logs everyone out         |
| `PORT`          | no       | platform usually injects it (defaults to 3000)               |
| `NODE_ENV`      | no       | set `production`                                             |
| `CORS_ORIGIN`   | no       | only needed if the frontend is hosted on a **different** origin; comma-separated list allowed |

### Platform notes

- **Render / Railway / Fly.io (single service):** build command `cd client && pnpm install && pnpm build && cd ../server && pnpm install`, start command `cd server && pnpm start`. Set the env vars above. Because frontend and API share one origin, leave `CORS_ORIGIN` unset or matching.
- **Split hosting (e.g. Vercel frontend + separate API):** the client calls relative `/api/*` URLs, so add a rewrite/proxy on the frontend host pointing `/api/*` to the API origin, **or** set `CORS_ORIGIN` on the API to the frontend URL. The rewrite approach is preferred — no CORS surface.
- **MongoDB Atlas:** add your deployment platform's outbound IPs to the network allowlist (or `0.0.0.0/0` for dynamic-IP hosts — acceptable for a portfolio project, not for sensitive data). Use a dedicated DB user with least privilege.

### Deployment checklist

- [ ] `MONGODB_URI` points at the production cluster/database
- [ ] Fresh random `JWT_SECRET` set (never the example value)
- [ ] `client/dist` built from the same commit being deployed
- [ ] Atlas IP allowlist updated for the host
- [ ] Smoke test: register → login → reload `/app` → logout

## Security Notes

- Passwords hashed with bcrypt (cost 10); the hash is `select: false` in Mongoose and never returned by any endpoint
- JWTs expire after 7 days; the client stores the token in `localStorage` and validates it via `/api/auth/me` on every app load
- API routes are matched **before** the SPA catch-all, and unknown `/api/*` paths return JSON 404s instead of `index.html`
- `server/.env` is git-ignored; `server/.env.example` documents the shape without secrets

## Roadmap

- Persist assignments, courses, and grades to MongoDB per user (replace `localStorage` seed data)
- Password reset + email verification
- Logout confirmation menu (avatar click currently logs out immediately)
- Code-split the client bundle (currently ~520 kB minified)

## License

Private portfolio project — all rights reserved unless stated otherwise.
