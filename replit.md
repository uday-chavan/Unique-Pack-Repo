# Replit.md - Unique Pack Management System

## Overview

This is an internal business management dashboard for a machinery and hardware company called "Unique Pack". The application handles inventory management, sales orders, customer relationships, supplier management, and business analytics. It's built as a full-stack TypeScript application with React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, with custom hooks per domain (use-machines, use-orders, use-crm, use-auth)
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Forms**: React Hook Form with Zod schema validation via @hookform/resolvers
- **Charts**: Recharts for dashboard analytics visualization

### Backend Architecture
- **Framework**: Express 5 running on Node.js with TypeScript
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod schemas for request/response validation
- **Authentication**: Session-based auth using Passport.js with local strategy, passwords hashed with scrypt
- **Session Storage**: MemoryStore (development), with connect-pg-simple available for production PostgreSQL sessions

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in shared/schema.ts with tables for users, machines, suppliers, customers, orders, order_items, transactions, and purchases
- **Validation**: Drizzle-zod generates insert schemas from table definitions
- **Migrations**: Managed via drizzle-kit with `db:push` command

### Code Organization
- `client/src/` - React frontend application
  - `pages/` - Route-level components (Dashboard, Inventory, Orders, Customers, Suppliers)
  - `components/` - Reusable UI components including forms and layout
  - `hooks/` - Custom React hooks for data fetching and mutations
- `server/` - Express backend
  - `routes.ts` - API endpoint handlers
  - `storage.ts` - Database access layer implementing IStorage interface
  - `auth.ts` - Authentication configuration
- `shared/` - Code shared between client and server
  - `schema.ts` - Drizzle table definitions and Zod insert schemas
  - `routes.ts` - API route definitions with type-safe schemas

### Build System
- Development: tsx runs TypeScript directly, Vite handles frontend HMR
- Production: Custom build script using esbuild for server bundle, Vite for client static assets
- Output: Server bundles to dist/index.cjs, client to dist/public/

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **express-session**: Session management
- **passport / passport-local**: Authentication middleware with username/password strategy

### UI/Frontend Libraries
- **@radix-ui/***: Accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **recharts**: Dashboard charts and data visualization
- **date-fns**: Date formatting throughout the application

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (defaults to development value if not set)