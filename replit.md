# Hostel Management System - HostelPro Local

## Overview

HostelPro Local is an offline Hostel Management System built as a full-stack web application. The system manages tenants (customers), rooms, payments, staff, and maintenance records for hostel operations. It uses a monorepo architecture with Express.js backend and React frontend, storing data locally in SQLite for offline functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with Vite as the build tool and development server
- TypeScript for type safety across the application
- Client runs on port 5173 in development mode

**UI Framework & Styling**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows "New York" style variant with utility-focused approach
- Custom theme system supporting light/dark modes via context provider
- Responsive layout with sidebar navigation pattern (16rem width sidebar + flexible content area)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and API synchronization
- Query client configured with infinite stale time and disabled automatic refetching (offline-first approach)
- Form state managed with React Hook Form with Zod validation via @hookform/resolvers

**Routing**
- Wouter for lightweight client-side routing
- Primary routes: Dashboard (/), Bookings (/bookings), Rooms (/rooms), Guests (/guests), Payments (/payments)

**Component Structure**
- Reusable presentational components: StatCard, BookingCard, RoomCard, GuestListItem, PaymentRow
- Dialog-based forms for data entry (AddCustomerDialog, NewBookingDialog)
- Shared UI components from Shadcn/ui library located in `/client/src/components/ui/`

### Backend Architecture

**Server Framework**
- Express.js with TypeScript (ESM modules)
- Server runs on port 5000
- Middleware: JSON body parser with raw body capture, URL-encoded parser

**Database Layer**
- better-sqlite3 for synchronous SQLite operations
- Database file: `database.sqlite` in project root
- Storage abstraction pattern via `IStorage` interface and `SqliteStorage` implementation
- Foreign keys enabled via pragma

**API Design**
- RESTful API endpoints under `/api` prefix
- Tenant management endpoints:
  - GET `/api/tenants` - Retrieve all tenants
  - GET `/api/tenants/:id` - Retrieve single tenant
  - POST `/api/tenants` - Create new tenant
  - PUT `/api/tenants/:id` - Update tenant
  - DELETE `/api/tenants/:id` - Remove tenant

**Request Validation**
- Zod schemas for runtime type validation
- Schema definitions shared between client and server via `/shared/schema.ts`
- Validation occurs in route handlers before database operations

**Development Setup**
- Vite integration for development with HMR support
- Custom logging middleware for API requests (logs method, path, status, duration, and truncated response)
- Development mode serves static files through Vite middleware

### Database Schema

**Core Tables** (SQLite with Drizzle ORM schema definitions)

1. **users** - Authentication and authorization
   - id (INTEGER, primary key, auto-increment)
   - username (TEXT, unique, required)
   - password (TEXT, required)
   - role (TEXT, default: 'staff')

2. **tenants** - Customer/tenant records
   - id (INTEGER, primary key, auto-increment)
   - name (TEXT, required)
   - mobile_number (TEXT, required)
   - cnic (TEXT, required) - National identification
   - father_name (TEXT, required)
   - father_cnic (TEXT, required)
   - room_number (TEXT, required)
   - rent (REAL, required)
   - join_date (TEXT, required)
   - status (TEXT, default: 'Active')
   - created_at (TEXT, timestamp)

3. **rooms** - Room inventory
   - id (INTEGER, primary key, auto-increment)
   - room_no (TEXT, unique, required)
   - capacity (INTEGER, required)
   - price (REAL, required)
   - occupied (INTEGER, default: 0)
   - notes (TEXT, optional)

4. **payments** - Payment tracking
   - id (INTEGER, primary key, auto-increment)
   - tenant_id (INTEGER, required)
   - amount (REAL, required)
   - month (TEXT, required)
   - method (TEXT, required)
   - status (TEXT, default: 'pending')
   - created_at (TEXT, timestamp)

5. **staff** - Staff member records
   - id (INTEGER, primary key, auto-increment)
   - name (TEXT, required)
   - role (TEXT, required)
   - phone (TEXT, required)
   - Additional fields defined but truncated in schema file

**Schema Management**
- Drizzle ORM used for type-safe schema definitions
- Drizzle Kit configured for migrations (output: `./migrations`)
- Schema configured for PostgreSQL dialect in drizzle.config.ts (note: actual runtime uses SQLite via better-sqlite3)

### Build & Deployment

**Development**
- Command: `npm run dev`
- Runs backend with tsx in watch mode with NODE_ENV=development
- Vite dev server integrated for frontend HMR

**Production Build**
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js` (ESM format, external packages, platform: node)
- Start command: `NODE_ENV=production node dist/index.js`

**Type Checking**
- TypeScript configured with strict mode
- Path aliases: `@/*` for client source, `@shared/*` for shared modules
- Incremental compilation enabled with build info cache

## External Dependencies

### Data Storage
- **better-sqlite3** - Local SQLite database for offline-first data persistence
- **Drizzle ORM** - Type-safe ORM with SQLite adapter
- **@neondatabase/serverless** - PostgreSQL serverless driver (configured but not actively used)

### UI Component Libraries
- **Radix UI** - Headless UI primitives (@radix-ui/react-*)
  - Complete suite: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip
- **Shadcn/ui** - Pre-styled component library built on Radix UI
- **cmdk** - Command palette component
- **class-variance-authority** - CVA for variant-based component styling
- **tailwind-merge** - Tailwind class conflict resolution
- **clsx** - Utility for conditional className construction

### Form Handling & Validation
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Validation resolver adapters
- **zod** - Schema validation library
- **drizzle-zod** - Zod schema generation from Drizzle schemas

### Development Tools
- **Vite** - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **@replit/vite-plugin-runtime-error-modal** - Runtime error overlay
- **@replit/vite-plugin-cartographer** - Replit integration (dev only)
- **@replit/vite-plugin-dev-banner** - Development banner (dev only)
- **esbuild** - JavaScript bundler for production backend
- **tsx** - TypeScript execution for development
- **autoprefixer** - PostCSS plugin for vendor prefixes

### Utilities
- **date-fns** - Date manipulation and formatting
- **nanoid** - Unique ID generation
- **lucide-react** - Icon library
- **wouter** - Lightweight routing library

### Session Management
- **connect-pg-simple** - PostgreSQL session store (configured but may not be actively used with SQLite setup)