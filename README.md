# UniqPack

> An internal business management dashboard for a machinery and hardware company — handling inventory, sales orders, customer relationships, supplier management, GST-compliant invoicing, and business analytics.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Overview

UniqPack (internally "Unique Pack Management System") is a full-stack business management platform built for a machinery and hardware company. It centralizes inventory (machines), sales orders, customer relationships (CRM), supplier records, purchases, and financial transactions in one dashboard, and generates GST-compliant tax invoices and e-Way bills directly from order data.

It's built as a full-stack TypeScript application — React on the frontend, Express on the backend — using PostgreSQL for persistence via Drizzle ORM.

---

## Features

### Inventory (Machines) Management
Track machinery and hardware stock with dedicated pages and hooks (`use-machines`) for browsing, adding, and updating inventory items.

### Sales Order Management
Create and manage sales orders with line items, linked customers, and order status, via the `use-orders` hook and the Orders page.

### Customer Relationship Management (CRM)
Manage customer records and relationships through a dedicated CRM hook (`use-crm`) and Customers page.

### Supplier Management
Track suppliers, including GST-compliance fields — GSTIN, state, and city — needed for e-Way bill generation.

### Purchases and Transactions
Record purchases from suppliers and financial transactions against orders, backed by dedicated `purchases` and `transactions` tables.

### GST Tax Invoice Generation
Generates professional, downloadable GST Tax Invoices directly from the Orders page, including:
- Dynamic GST calculations (CGST/SGST)
- Company PAN and IEC details
- Bank details and terms & conditions
- Auto-calculated 48-hour validity dates
- Part A: supplier, customer, and shipment details
- Part B: vehicle/transport information

Invoices are rendered client-side with `html2canvas` and exported as PDFs with `jsPDF`.

### e-Way Bill Support
Supplier records carry GSTIN, state, and city fields so e-Way bills can be generated alongside tax invoices for shipments.

### Business Analytics Dashboard
A Dashboard page surfaces business-wide analytics and charts built with Recharts.

### Session-Based Authentication
Username/password authentication via Passport.js (local strategy), with passwords hashed using scrypt.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 7 |
| **Routing** | Wouter 3 |
| **State / Data** | TanStack React Query v5 |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS v3 |
| **Forms** | React Hook Form + Zod (via @hookform/resolvers) |
| **Animations** | Framer Motion v11 |
| **Charts** | Recharts |
| **Backend** | Node.js 20+, Express 5, TypeScript (ESM, via tsx) |
| **ORM** | Drizzle ORM (+ drizzle-zod) |
| **Database** | PostgreSQL (via `pg`) |
| **Authentication** | Passport.js (local strategy) + express-session |
| **Password Hashing** | scrypt |
| **Session Storage** | MemoryStore (dev); connect-pg-simple available for production |
| **PDF / Invoices** | html2canvas + jsPDF |
| **File Uploads** | Multer |
| **Build (client)** | Vite |
| **Build (server)** | esbuild (via custom `script/build.ts`) |
| **Dev Runtime** | tsx |

---

## Project Structure

```
UniqPack-Repository/
├── client/
│   └── src/
│       ├── pages/           # Route-level components: Dashboard, Inventory, Orders, Customers, Suppliers
│       ├── components/      # Reusable UI components including forms and layout
│       └── hooks/           # Custom hooks: use-machines, use-orders, use-crm, use-auth
├── server/
│   ├── index.ts             # Express entry point
│   ├── routes.ts            # API endpoint handlers
│   ├── storage.ts           # Database access layer implementing IStorage interface
│   └── auth.ts               # Passport.js authentication configuration
├── shared/
│   ├── schema.ts             # Drizzle table definitions + drizzle-zod insert schemas
│   └── routes.ts             # Type-safe API route definitions (Zod request/response schemas)
├── script/
│   └── build.ts               # Custom esbuild-based server bundle script
├── scripts/                   # Additional utility/build scripts
├── images/                    # Static image assets
├── public/                    # Public static assets
├── Launch.ps1                 # Windows PowerShell launch script
├── Start App.vbs              # Windows one-click app launcher
├── Update App.bat             # Windows update script
├── components.json            # shadcn/ui component configuration
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── replit.md                  # Internal architecture notes
└── package.json
```

---

## Database Schema

UniqPack uses **Drizzle ORM** with a PostgreSQL dialect. Tables are defined in `shared/schema.ts`:

| Table | Purpose |
|---|---|
| `users` | User accounts for authentication |
| `machines` | Machinery / hardware inventory records |
| `suppliers` | Supplier records, including GSTIN, state, and city for GST/e-Way bill compliance |
| `customers` | Customer records for CRM |
| `orders` | Sales orders |
| `order_items` | Line items belonging to a sales order |
| `transactions` | Financial transactions tied to orders |
| `purchases` | Purchase records from suppliers |

Insert schemas are auto-generated from table definitions via `drizzle-zod`, and migrations are managed with `drizzle-kit` via the `db:push` command.

---

## Authentication System

UniqPack uses **session-based authentication**:

- **Strategy**: Passport.js with the local (username/password) strategy
- **Password hashing**: scrypt
- **Session storage**: MemoryStore in development; `connect-pg-simple` available for production PostgreSQL-backed sessions
- **Session secret**: configured via the `SESSION_SECRET` environment variable (falls back to a development default if unset)

---

## API Endpoints

API routes are defined in `server/routes.ts` (handlers) and `shared/routes.ts` (type-safe Zod schemas shared between client and server), organized by domain:

| Domain | Description |
|---|---|
| **Auth** | Login, logout, and current-session user endpoints backed by Passport.js |
| **Machines** | CRUD endpoints for inventory/machinery records |
| **Orders** | CRUD endpoints for sales orders and their line items |
| **Customers** | CRUD endpoints for customer (CRM) records |
| **Suppliers** | CRUD endpoints for supplier records, including GST fields |
| **Purchases** | CRUD endpoints for purchase records against suppliers |
| **Transactions** | CRUD endpoints for financial transactions |

> Exact route paths are defined in `shared/routes.ts` — refer to that file for the authoritative, type-safe list of endpoints and payload schemas.

---

## Document Generation

### Tax Invoices (Orders page)
Each order can generate a downloadable GST Tax Invoice PDF, with dynamic CGST/SGST calculation, company PAN/IEC details, bank details and terms, and an auto-calculated 48-hour validity window.

### e-Way Bills (Orders page)
Alongside the tax invoice, an e-Way Bill PDF can be generated using supplier GSTIN/state/city and vehicle/transport details, downloadable as a separate PDF file.

Both documents are rendered client-side using `html2canvas` for layout capture and `jsPDF` for PDF export.

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- A **PostgreSQL** database
- A `SESSION_SECRET` value for production use

### 1. Clone the repository

```bash
git clone https://github.com/uday-chavan/UniqPack-Repository.git
cd UniqPack-Repository
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/uniqpack

# Sessions
SESSION_SECRET=your-session-secret
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (tsx + Vite HMR) |
| `npm run build` | Build client (Vite) and bundle server (esbuild) via `script/build.ts` |
| `npm run start` | Start production server from `dist/index.cjs` |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Push Drizzle schema to database |

---

## Windows Convenience Scripts

The repository includes a few Windows-oriented helper scripts for non-technical/local desktop use:

- **`Launch.ps1`** — PowerShell script to launch the app
- **`Start App.vbs`** — One-click VBScript launcher
- **`Update App.bat`** — Batch script to pull updates and rebuild

---

## Deployment

Production builds run from `dist/index.cjs` (server) and `dist/public/` (client static assets), produced by the custom `script/build.ts` build pipeline (esbuild for the server, Vite for the client). Set `DATABASE_URL` and `SESSION_SECRET` in your hosting environment before starting the production server.

---

## Notes

- This is an **internal** business tool built for a specific company ("Unique Pack"), not a general-purpose SaaS product.
- GST/e-Way bill fields (GSTIN, state, city) on suppliers exist specifically to support Indian tax-compliance invoice generation.
- User preference in this codebase favors simple, everyday communication style in comments and docs.

---

## License

This project is available under the [MIT License](LICENSE).
