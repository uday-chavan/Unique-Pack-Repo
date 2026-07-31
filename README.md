# FlowHub

> An AI-powered productivity command center that converts emails into tasks, tracks time saved, and surfaces actionable insights — all connected to your Gmail inbox.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Overview

FlowHub is a full-stack productivity platform designed for knowledge workers and teams. It connects to Gmail via OAuth, reads incoming emails, uses **Google Gemini AI** to classify and extract tasks, and tracks how much time the automation saves you. It supports subscription-based access via **Razorpay** and sends email notifications via **Resend**.

The application is desktop-only (requires a 16:9 or 16:10 screen at 1024px minimum width) and is deployable to Railway with zero configuration changes.

---

## Features

### Gmail Integration and Email-to-Task Conversion
Connect your Gmail account via OAuth 2.0. FlowHub monitors your inbox for actionable emails and uses Gemini AI to extract one or more tasks from each message — capturing title, priority, estimated time, and due date automatically.

### AI Task Analysis
Every notification and email is passed through Gemini AI to:
- Classify priority: urgent, important, or normal
- Generate a plain-English summary
- Estimate time to handle
- Produce actionable insights and suggested actions

### Task Management
Full CRUD task board with:
- Priority levels: urgent, important, normal
- Status tracking: pending, in progress, completed, paused
- Estimated and actual time tracking
- Source app attribution (Gmail, Slack, Notion, etc.)
- Due dates and start/complete timestamps

### Time Saved Dashboard
Persistent, cumulative tracking of productivity gains:
- Total minutes saved across all time
- Email conversions count
- AI tasks created
- Urgent tasks handled
- Tasks completed

### Priority Email Senders
Whitelist specific sender email addresses as high-priority. Emails from these senders are always flagged as urgent regardless of content.

### Emails Converted View
Full history of every email that has been converted to tasks, including sender, subject, received date, snippet, and conversion status.

### AI Insights
Automatically generated recommendations surfaced to users:
- Deadline alerts
- Workflow optimization suggestions
- Wellness reminders

### Google Calendar Sync
Calendar service that reads and writes events to Google Calendar, enabling task-to-event synchronization.

### Subscription and Payments via Razorpay
Tiered subscription model (free, basic, premium, enterprise) with:
- One-time payments and UPI AutoPay recurring subscriptions
- Razorpay webhook verification
- Full payment and subscription lifecycle tracking

### Notifications
Browser and email notifications for task reminders, deadline alerts, and system events. Email delivery via Resend API.

### Smart Scheduler
Background scheduler that auto-assigns tasks based on workload capacity, available hours, and priority.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Routing** | Wouter 3 |
| **State / Data** | TanStack React Query v5 |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS v3 |
| **Animations** | Framer Motion v11 |
| **Charts** | Recharts |
| **Backend** | Node.js 20+, Express 4, TypeScript (ESM) |
| **ORM** | Drizzle ORM |
| **Database** | Neon (serverless PostgreSQL) |
| **Authentication** | JWT (access + refresh tokens) + HTTP-only cookies |
| **Password Hashing** | bcryptjs (12 salt rounds) |
| **AI Model** | Google Gemini 2.5 Flash (via @google/genai SDK) |
| **Gmail OAuth** | Google APIs (googleapis + openid-client) |
| **Calendar** | Google Calendar API |
| **Payments** | Razorpay (one-time + UPI AutoPay subscriptions) |
| **Email Sending** | Resend API |
| **Notifications** | Nodemailer (SMTP) + Resend |
| **Build (client)** | Vite |
| **Build (server)** | esbuild |
| **Deployment** | Railway (railway.json included) |

---

## Project Structure

```
FlowHub-Main-Repository-main/
├── client/
│   └── src/
│       ├── App.tsx                 # Root router, auth guard, user switching logic
│       ├── pages/
│       │   ├── Landing.tsx         # Public landing + login/register page
│       │   ├── dashboard.tsx       # Main productivity dashboard
│       │   ├── EmailsConverted.tsx # History of email-to-task conversions
│       │   ├── TimeSaved.tsx       # Cumulative time-saved analytics
│       │   ├── PriorityEmails.tsx  # Manage priority sender whitelist
│       │   ├── Feedback.tsx        # User feedback form
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── dashboard/          # Dashboard section components
│       │   ├── auth/               # Login/register forms
│       │   ├── AppUpdateModal.tsx  # Deployment-change modal
│       │   ├── TextLoop.tsx        # Animated text component
│       │   └── ui/                 # shadcn/ui components
│       ├── hooks/
│       │   └── useAuth.tsx         # Auth state + current user hook
│       └── lib/
│           └── queryClient.ts
├── server/
│   ├── index.ts                    # Express entry point
│   ├── routes.ts                   # All API + auth route definitions (3200+ lines)
│   ├── auth.ts                     # JWT generation, verification, middleware, rate limiting
│   ├── storage.ts                  # DatabaseStorage class (data access layer)
│   ├── db.ts                       # Drizzle + Neon connection
│   ├── openai.ts                   # Gemini AI functions (named openai.ts for legacy reasons)
│   ├── calendarService.ts          # Google Calendar read/write service
│   ├── scheduler.ts                # Smart task scheduler (background)
│   ├── notificationScheduler.ts    # Task reminder notification scheduler
│   ├── tokenStorage.ts             # Secure encrypted Gmail token storage
│   └── vite.ts                     # Dev: Vite middleware; Prod: serves dist/
├── shared/
│   └── schema.ts                   # Drizzle tables + Zod schemas + TS types
├── migrations/                     # Drizzle SQL migration files
├── railway.json                    # Railway deployment config
├── RAILWAY_DEPLOYMENT.md
├── LOCAL_SETUP_GUIDE.md
├── drizzle.config.ts
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Database Schema

FlowHub uses **13 tables** with UUID primary keys:

| Table | Purpose |
|---|---|
| `users` | User accounts (email, name, hashed password, profile image, role) |
| `tasks` | Tasks with priority, status, time estimates, source app, due dates |
| `notifications` | In-app notifications with AI summaries and actionable insights |
| `connected_apps` | OAuth-connected third-party apps per user (Gmail, Slack, etc.) |
| `user_metrics` | Daily focus score, workload capacity, stress level, progress |
| `ai_insights` | AI-generated recommendations (deadline alerts, optimizations, wellness) |
| `user_usage` | Monthly AI task creation and interaction counts for plan enforcement |
| `credentials` | Encrypted OAuth tokens and API keys per user per service |
| `plans` | Subscription plan definitions (free / basic / premium / enterprise) |
| `payments` | Payment records with Razorpay IDs, UPI details, signature verification |
| `subscriptions` | Recurring subscription state with UPI mandate tracking |
| `encrypted_gmail_tokens` | AES-encrypted Gmail OAuth tokens (one row per user) |
| `priority_emails` | Whitelist of high-priority sender email addresses per user |
| `converted_emails` | Full history of every email converted to tasks |
| `accumulated_time_saved` | Cumulative lifetime productivity metrics per user |

### Enums

| Enum | Values |
|---|---|
| `task_priority` | urgent, important, normal |
| `task_status` | pending, in_progress, completed, paused |
| `notification_type` | urgent, important, normal, informational, browser_notification, email_converted |
| `app_type` | gmail, slack, notion, trello, zoom, calendar, manual, system |
| `plan_type` | free, basic, premium, enterprise |
| `payment_status` | pending, completed, failed, refunded |
| `payment_provider` | razorpay, cashfree, phonepe, paytm, manual |
| `payment_method` | upi, card, netbanking, wallet |
| `subscription_status` | active, pending, canceled, paused |

---

## Authentication System

FlowHub uses **stateless JWT authentication** with HTTP-only cookies — no sessions or session stores:

- **Access token**: 7-day expiry, stored in HTTP-only `accessToken` cookie
- **Refresh token**: 30-day expiry, stored in HTTP-only `refreshToken` cookie (path-scoped to `/auth`)
- **Deployment invalidation**: Every token embeds a `deploymentTimestamp`; tokens from previous deployments are automatically rejected
- **Rate limiting**: 5 failed attempts per 15-minute window per IP (in-memory)
- **Password hashing**: bcryptjs with 12 salt rounds
- **Demo account**: `demo@flowhub.com` with no password required for instant demo access

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user (name, email, password) |
| `POST` | `/auth/login` | No | Login with email + password |
| `POST` | `/auth/logout` | No | Clear auth cookies |
| `POST` | `/auth/refresh` | No | Rotate access token via refresh cookie |
| `GET` | `/auth/me` | Yes | Get current user |
| `GET` | `/api/auth/me` | Yes | API alias for current user |
| `PUT` | `/api/auth/profile` | Yes | Update name, email, profile picture |

### Tasks
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Yes | List all tasks for user |
| `POST` | `/api/tasks` | Yes | Create a task |
| `PATCH` | `/api/tasks/:id` | Yes | Update task fields |
| `DELETE` | `/api/tasks/:id` | Yes | Delete a task |

### Notifications
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Yes | List notifications |
| `PATCH` | `/api/notifications/:id/read` | Yes | Mark as read |
| `PATCH` | `/api/notifications/:id/dismiss` | Yes | Dismiss notification |

### Gmail / Email
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/auth/gmail` | Yes | Initiate Gmail OAuth flow |
| `GET` | `/auth/gmail/callback` | No | OAuth callback; stores encrypted token |
| `POST` | `/api/gmail/fetch-tasks` | Yes | Fetch emails and convert to tasks via AI |
| `GET` | `/api/priority-emails` | Yes | List priority sender whitelist |
| `POST` | `/api/priority-emails` | Yes | Add a priority sender |
| `DELETE` | `/api/priority-emails/:id` | Yes | Remove a priority sender |
| `GET` | `/api/converted-emails` | Yes | List email conversion history |

### AI and Insights
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/ai-insights` | Yes | List AI-generated insights |
| `PATCH` | `/api/ai-insights/:id/apply` | Yes | Mark insight as applied |
| `PATCH` | `/api/ai-insights/:id/dismiss` | Yes | Dismiss insight |
| `POST` | `/api/ai/analyze-notification` | Yes | Run AI analysis on a notification |
| `POST` | `/api/ai/optimize-workflow` | Yes | Get AI workflow optimization suggestions |

### Metrics and Analytics
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user-metrics` | Yes | Get today's user metrics |
| `POST` | `/api/user-metrics` | Yes | Update metrics |
| `GET` | `/api/time-saved` | Yes | Get cumulative time-saved stats |

### Payments and Subscriptions
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/plans` | No | List available subscription plans |
| `POST` | `/api/payments/create-order` | Yes | Create Razorpay payment order |
| `POST` | `/api/payments/verify` | Yes | Verify payment signature |
| `POST` | `/api/subscriptions/create` | Yes | Create recurring UPI AutoPay subscription |
| `GET` | `/api/subscriptions/current` | Yes | Get active subscription |
| `POST` | `/api/webhooks/razorpay` | No | Razorpay webhook handler |

### System
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Server health check |

---

## Background Services

### Smart Scheduler (`server/scheduler.ts`)
Runs in the background to automatically assign and schedule tasks based on user workload capacity, available hours, and priority weights. Rebalances the schedule when new tasks are added.

### Notification Scheduler (`server/notificationScheduler.ts`)
Monitors task due dates and fires browser and email notifications at configurable intervals before deadlines.

### Calendar Service (`server/calendarService.ts`)
Bidirectional Google Calendar integration — reads upcoming events to detect conflicts and writes completed task scheduling decisions back as calendar entries.

### Token Storage (`server/tokenStorage.ts`)
Handles AES encryption/decryption of Gmail OAuth tokens before persisting them to the `encrypted_gmail_tokens` table. Tokens are never stored in plaintext.

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- A **Neon PostgreSQL** database (or any PostgreSQL database)
- A **Google Cloud project** with Gmail API, Google Calendar API, and OAuth 2.0 credentials enabled
- A **Google Gemini API key** (free tier at [aistudio.google.com](https://aistudio.google.com))
- A **Razorpay** account (for payment features)
- A **Resend** API key (for email notifications)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/FlowHub.git
cd FlowHub-Main-Repository-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/flowhub

# Auth
JWT_SECRET=your-minimum-32-character-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Google OAuth (Gmail + Calendar)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/gmail/callback

# Gemini AI
GEMINI_API_KEY=AIza...

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=notifications@yourdomain.com
NOTIFICATION_EMAIL=your@email.com

# Token Encryption
TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5000**.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build client (Vite) + bundle server (esbuild) |
| `npm run start` | Start production server from `dist/` |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run clean` | Remove build artifacts and caches |
| `npm run railway:deploy` | Build and start for Railway deployment |

---

## Deployment

FlowHub is pre-configured for **Railway**. A `railway.json` file is included with the correct build and start commands.

Set all environment variables in the Railway dashboard under the project's "Variables" tab. Railway automatically provides `RAILWAY_STATIC_URL` which FlowHub uses to construct the correct Google OAuth redirect URI.

See `RAILWAY_DEPLOYMENT.md` for the full step-by-step Railway setup guide.

---

## Notes

- The application enforces a minimum screen width of 1024px and a landscape/wide aspect ratio. Mobile devices are not yet supported.
- Demo login is available at `demo@flowhub.com` (no password required).
- Tokens from previous deployments are automatically invalidated to prevent session bleed across redeploys.

---

## License

This project is open source and available under the [MIT License](LICENSE).
