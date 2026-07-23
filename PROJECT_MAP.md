# Tasdjil - Project Map

## Overview

**Tasdjil** (Arabic: "registration") is a university student registration application for the **University of Setif 1 - Ferhat Abbas**, Algeria. It manages student registration applications for **Master 1**, **Master 2**, and **Licence** programs.

---

## Technology Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Language        | TypeScript (strict mode)                    |
| Frontend        | SvelteKit 5 (Svelte 5 with runes)           |
| Build Tool      | Vite 8                                      |
| Package Manager | Bun                                         |
| Database        | PostgreSQL (via postgres.js)                |
| ORM             | Drizzle ORM                                 |
| Authentication  | Better Auth (email/password, role-based)    |
| Styling         | Tailwind CSS 4 (forms + typography plugins) |
| i18n            | Paraglide.js (Arabic, French, English)      |
| Testing         | Vitest (unit/component) + Playwright (E2E)  |
| Linting         | ESLint (Svelte + TypeScript + Prettier)     |
| Formatting      | Prettier (Svelte + Tailwind plugins)        |

---

## Directory Structure

```
tasdjil/
├── .env.example              # Environment variables template
├── .gitignore
├── drizzle/                  # Database migration files
│   ├── 0000_init.sql
│   └── meta/
├── drizzle.config.ts         # Drizzle ORM configuration
├── docs/                     # Reference data CSV files for seeding
│   ├── Domaines.csv
│   ├── Etablissements.csv
│   ├── Facultes.csv
│   └── Specialites.csv
├── messages/                 # i18n translation files
│   ├── ar.json               # Arabic
│   ├── en.json               # English
│   └── fr.json               # French
├── package.json
├── src/
│   ├── app.d.ts              # Global type declarations
│   ├── app.html              # HTML shell template
│   ├── hooks.client.ts       # Client-side hooks
│   ├── hooks.server.ts       # Server hooks (auth + i18n)
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts       # Better Auth configuration
│   │   │   ├── auth-guard.ts # requireAdmin() guard
│   │   │   └── db/
│   │   │       ├── index.ts      # Database connection
│   │   │       ├── schema.ts     # Application schema
│   │   │       ├── auth.schema.ts # Auth tables
│   │   │       └── seed.ts       # Database seeder
│   │   └── paraglide/        # Auto-generated i18n runtime
│   └── routes/
│       ├── +layout.server.ts # Root layout (user + session)
│       ├── +layout.svelte    # Root layout (header, nav, footer)
│       ├── +page.svelte      # Home page
│       ├── login/            # Login page
│       ├── register/         # Registration page
│       ├── logout/           # Logout action
│       ├── registration-application/ # Student application form
│       │   └── [id]/attachment/      # File attachment endpoint
│       ├── admin/            # Admin panel (all require admin role)
│       │   ├── parameters/   # Application parameters
│       │   ├── sessions/     # Registration session management
│       │   ├── establishments/
│       │   ├── faculties/
│       │   ├── domaines/
│       │   └── specialities/
│       └── demo/             # Demo/example pages
├── static/                   # Static assets
├── tsconfig.json
├── vite.config.ts
└── uploads/                  # Runtime file uploads (gitignored)
```

---

## Source Code Architecture

### Routes (Pages)

| Route                                       | Purpose                       |
| ------------------------------------------- | ----------------------------- |
| `/`                                         | Home page                     |
| `/login`                                    | User login                    |
| `/register`                                 | User registration             |
| `/logout`                                   | Logout action                 |
| `/registration-application`                 | Student application form      |
| `/registration-application/[id]/attachment` | File attachment endpoint      |
| `/admin`                                    | Admin dashboard               |
| `/admin/parameters`                         | Current session configuration |
| `/admin/sessions`                           | Registration session CRUD     |
| `/admin/establishments`                     | Establishment management      |
| `/admin/faculties`                          | Faculty management            |
| `/admin/domaines`                           | Domain/field management       |
| `/admin/specialities`                       | Speciality management         |

### Library (`src/lib/`)

| File                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `server/auth.ts`           | Better Auth configuration (email + password, role field)     |
| `server/auth-guard.ts`     | `requireAdmin()` guard function                              |
| `server/db/index.ts`       | Database connection (postgres.js + drizzle)                  |
| `server/db/schema.ts`      | Application database schema                                  |
| `server/db/auth.schema.ts` | Authentication tables (user, session, account, verification) |
| `server/db/seed.ts`        | Database seeder (reads CSV files, creates admin user)        |

### Hooks

| File              | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `hooks.server.ts` | Paraglide middleware + Better Auth session handler |
| `hooks.client.ts` | Client-side hooks                                  |

---

## Database Schema

### Auth Tables (Better Auth)

- **user** - id, name, email, emailVerified, image, role (admin/adminfac/student), timestamps
- **session** - token-based sessions linked to users
- **account** - OAuth/credential accounts linked to users
- **verification** - Email verification tokens

### Application Tables

| Table                      | Description                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `faculte`                  | University faculties (name + nameAr)                                                                                        |
| `establissement`           | Educational establishments (name + nameAr)                                                                                  |
| `domaine`                  | Study domains/fields, linked to faculty, with level enum (Master1, Master2, Licence)                                        |
| `speciality`               | Specialities within a domain                                                                                                |
| `registration_session`     | Registration periods (name, date range, opened flag)                                                                        |
| `application_parameter`    | Singleton config pointing to current active session                                                                         |
| `registration_application` | Core table: student registration applications with personal info, academic history, 3 speciality choices, acceptance status |
| `task`                     | Simple task table (example/leftover)                                                                                        |

---

## Authentication & Authorization

- **Roles**: `admin`, `adminfac`, `student`
- **Method**: Better Auth with email + password
- **Guard**: `requireAdmin()` in `src/lib/server/auth-guard.ts`
- **Admin Layout Guard**: `src/routes/admin/+layout.server.ts`

---

## Internationalization (i18n)

- **Languages**: Arabic (ar), French (fr), English (en)
- **Strategy**: URL-based locale switching
- **RTL Support**: Arabic uses right-to-left layout direction
- **Files**: `messages/ar.json`, `messages/fr.json`, `messages/en.json`
- **Runtime**: Auto-generated Paraglide runtime in `src/lib/paraglide/`

---

## Configuration Files

| File                   | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `package.json`         | Project manifest, dependencies, scripts          |
| `tsconfig.json`        | TypeScript config (extends SvelteKit's)          |
| `vite.config.ts`       | Vite + SvelteKit + Tailwind + Paraglide + Vitest |
| `drizzle.config.ts`    | Drizzle ORM config (PostgreSQL)                  |
| `eslint.config.js`     | ESLint flat config                               |
| `prettier.config.js`   | Prettier config (tabs, single quotes)            |
| `playwright.config.ts` | Playwright E2E config                            |
| `.env.example`         | Environment variable template                    |

---

## Environment Variables

| Variable             | Purpose                      |
| -------------------- | ---------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Authentication secret key    |
| `ORIGIN`             | Application origin URL       |

---

## Development Commands

| Command               | Purpose                         |
| --------------------- | ------------------------------- |
| `bun run dev`         | Start Vite dev server           |
| `bun run build`       | Production build                |
| `bun run preview`     | Preview production build        |
| `bun run check`       | TypeScript type checking        |
| `bun run lint`        | Prettier check + ESLint         |
| `bun run format`      | Auto-format with Prettier       |
| `bun run test:unit`   | Run Vitest unit/component tests |
| `bun run test:e2e`    | Run Playwright E2E tests        |
| `bun run test`        | Run both unit and E2E tests     |
| `bun run db:push`     | Push schema changes to DB       |
| `bun run db:generate` | Generate Drizzle migrations     |
| `bun run db:migrate`  | Run Drizzle migrations          |
| `bun run db:seed`     | Seed database from CSV data     |
| `bun run db:studio`   | Open Drizzle Studio             |

---

## Seeding

Reference data (faculties, establishments, domains, specialities) is seeded from CSV files in the `docs/` directory. The seed script also creates a default admin user.

```bash
bun run db:seed
```

---

## Deployment

- **Adapter**: `@sveltejs/adapter-auto` (flexible deployment target)
- **Supported**: Vercel, Netlify, Cloudflare, or custom Node.js server
