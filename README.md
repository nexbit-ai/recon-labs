## Recon Labs

Recon Labs is a **modern finance and operations workspace** for marketplace and commerce businesses.  
It brings together reconciliation, reporting, workflows, and AI assistants into a single application backed by an API service layer.
---

### Core Capabilities

- **Marketplace reconciliation**
  - Central `MarketplaceReconciliation` and `TransactionSheet` experiences
  - Upload marketplace exports and internal ledgers
  - Compare transactions, highlight variances, and surface unreconciled items

- **Operational finance workspace**
  - Checklist-style workflows for month‑end close and recurring tasks
  - Recent activity feeds and reports
  - Document upload and bookkeeping views

- **AI workflows**
  - AI‑assisted reconciliation flows
  - Assistant and AI workflow pages for semi‑automated investigation

- **Authentication & security**
  - Stytch B2B email/password authentication
  - Protected routes and session monitoring
  - Environment‑driven JWT and API configuration

- **Typed API service layer**
  - Centralized API client, token management, React hooks, and endpoint definitions
  - Environment‑aware configuration with feature flags

For deeper details on specific subsystems, see:

- `src/services/api/README.md` – API client, hooks, and configuration
- `src/services/auth/README.md` – Stytch authentication integration
- `AUTHENTICATION_SETUP.md` – end‑to‑end auth wiring
- `JWT_IMPLEMENTATION_SUMMARY.md` – JWT details
- `STYTCH_SETUP.md` / `STYTCH_METADATA_LOGGING.md` – Stytch project setup and logging

---

### Tech Stack

- **Frontend**
  - React 19 + TypeScript
  - React Router
  - Material UI (MUI) and Emotion
  - Recharts and Framer Motion
- **Tooling**
  - Vite
  - TypeScript

---

### Getting Started

#### 1. Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (this repo ships with a `package-lock.json`)

#### 2. Clone and install

```bash
git clone <your-repo-url>
cd recon-labs
npm install
```

#### 3. Environment configuration

Environment is managed via **Vite** and `VITE_*` variables.  
Use `env.example` / `.env.example` as a reference and create a local `.env`:

```bash
cp env.example .env
```

Key variables (see `src/config/environment.ts` and auth/API docs for full list):

- **Stytch**
  - `VITE_STYTCH_PROJECT_ID`
  - `VITE_STYTCH_SECRET`
  - `VITE_STYTCH_PUBLIC_TOKEN`
- **API**
  - `VITE_API_BASE_URL`
  - `VITE_API_KEY`
  - `VITE_ORG_ID`
- **JWT / app**
  - `VITE_JWT_SECRET` or `VITE_STAGING_JWT_SECRET` (depending on `VITE_APP_ENVIRONMENT`)
  - `VITE_JWT_EXPIRATION`
  - `VITE_APP_ENVIRONMENT` (e.g. `development`, `production`, or `Staging`)

Additional optional flags and endpoints are documented in:

- `src/services/api/README.md`
- `src/services/auth/README.md`

#### 4. Run the app

```bash
npm run dev
```

By default Vite runs on `http://localhost:5173`.

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

---

### Project Structure (high level)

```text
src/
  App.tsx                 # App shell, theme, routing, Stytch provider, protected routes
  main.tsx                # Vite entry point
  config/
    environment.ts        # Environment and feature configuration
  components/             # Shared layout, filters, session monitor, etc.
  contexts/
    UserContext.tsx       # User and org context
  pages/                  # Route-level screens (reconciliation, AI, reports, auth, etc.)
  services/
    api/                  # API client, hooks, endpoints, token management
    auth/                 # Stytch auth integration
  assets/                 # Logos and sample CSVs
```

Some notable pages:

- `MarketplaceReconciliation.tsx` – main reconciliation experience
- `TransactionSheet.tsx` – transaction grid / reconciliation sheet
- `Dashboard.tsx`, `Reports.tsx`, `Checklist.tsx`, `OperationsCentre.tsx` – core workspace views
- `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `Authenticate` flow – auth screens

---

### Authentication Overview

- `App.tsx` wires `StytchB2BProvider`, an `Authenticate` handler route, and `ProtectedRoute` wrappers.
- `SessionMonitor` and `UserProvider` coordinate session state and org context.
- Environment configuration for Stytch and JWT is centralized in `src/config/environment.ts`.

To set up or troubleshoot auth, see:

- `AUTHENTICATION_SETUP.md`
- `STYTCH_SETUP.md`
- `src/services/auth/README.md`

---

### API Layer Overview

The API layer lives under `src/services/api/` and provides:

- A central `apiService` HTTP client with interceptors and retry logic
- A `tokenManager` for access/refresh token handling
- Typed endpoint modules (`endpoints.ts`, `types.ts`)
- React hooks (`hooks.ts`) for queries, mutations, pagination, and uploads
- Environment‑driven configuration and feature flags (`config.ts`)

Usage examples, config reference, and best practices are documented in `src/services/api/README.md`.

---

### Contributing

- **Branches**
  - Create feature branches from `main` (e.g. `feature/ai-reconciliation-panel`)
- **Typical workflow**
  - Ensure you have a working `.env` (auth + API)
  - Run `npm run dev` and exercise the affected flows
  - Keep docs in `AUTHENTICATION_SETUP.md`, `JWT_IMPLEMENTATION_SUMMARY.md`, and the service‑level READMEs up to date when you touch those areas