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

### Security & Licensing
- **node-machine-id** - Hardware-based machine identification for license binding
- **uuid** - License key generation
- **crypto** (Node.js built-in) - AES-256-GCM encryption for local license cache

## Software Licensing System

HostelPro Local includes a comprehensive software licensing and machine ID protection system to prevent unauthorized usage and license sharing.

### License Architecture

**License Binding**
- Each license is cryptographically bound to a specific machine using hardware-based machine ID
- Machine IDs are hashed with SHA-256 and per-license random salts before storage
- License files cannot be copied between machines due to encrypted local cache

**Encrypted Local Cache**
- Active license stored in `.license/license.json.enc` (encrypted with AES-256-GCM)
- Encryption key derived from machine ID using PBKDF2-SHA256 (100,000 iterations)
- Cache provides offline validation after initial activation
- Tamper detection via GCM authentication tag

**License Status Flow**
1. `pending` - License generated but not yet activated
2. `active` - License successfully activated and bound to machine
3. `deactivated` - License manually deactivated (can be reactivated on same machine)
4. `expired` - License past expiry date (if expiry_date is set)

### Database Schema

**licenses table**
- `id` - Auto-incrementing primary key
- `license_key` - Unique license identifier (format: HOSTELPRO-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)
- `machine_id_hash` - SHA-256 hash of machine ID + salt (null until activated)
- `machine_id_salt` - Random salt for machine ID hashing (null until activated)
- `customer_name` - Name of licensed customer/organization
- `hostel_name` - Name of the hostel using the software
- `issue_date` - ISO timestamp when license was generated
- `expiry_date` - ISO timestamp when license expires (null for lifetime licenses)
- `status` - Current license status (pending/active/deactivated/expired)
- `notes` - Optional internal notes about the license
- `activated_at` - ISO timestamp when license was first activated

### API Endpoints

**License Validation & Activation**
- `GET /api/machine-id` - Retrieve current machine's hardware ID
- `GET /api/license` - Get active license for current machine (returns 404 if none)
- `POST /api/license/validate` - Validate and activate a license key
  - Request: `{ license_key: string, machine_id: string }`
  - Validates license exists, not expired, and binds to machine on first activation
  - Creates encrypted local cache for offline validation
- `POST /api/license/deactivate` - Deactivate current machine's license
  - Clears machine binding and removes local cache
  - License can be reactivated on same machine

**License Management (Admin Only)**
- `POST /api/license/generate` - Generate new license
  - Requires `ADMIN_SECRET` environment variable for authentication
  - Request: `{ customer_name, hostel_name, expiry_date?, notes?, admin_secret }`
  - Returns newly generated license key

### Frontend Components

**Activation Flow**
- `ActivationPage` (`/activation`) - Initial activation screen shown when no valid license exists
  - Displays current machine ID for support purposes
  - Accepts license key input
  - Validates and activates license via API
  - Redirects to dashboard on success

**License Information Display**
- Settings page includes License Information section
- Shows: license key, customer name, hostel name, status badge, issue date, activation date, expiry date
- Visual status indicator (green for Active, yellow for Pending, red for Expired/Deactivated)

**App Startup Validation**
- `App.tsx` checks for valid license on every startup via `useLicense` hook
- Blocks access to main application until license is activated
- Handles expired licenses and missing cache gracefully

### Security Features

**Protection Against License Sharing**
- Machine ID binding prevents copying license to different hardware
- Encrypted cache uses hardware-specific encryption key
- Server validates machine ID match on every activation attempt
- Single active license per machine enforced

**Admin Controls**
- License generation restricted to authorized users with admin secret
- Admin secret must be set via `ADMIN_SECRET` environment variable
- Default value: "your-secret-admin-key-change-this" (should be changed in production)

**Offline Validation**
- After initial activation, license validated from encrypted local cache
- No internet required for daily operation
- Cache encrypted to prevent tampering
- Falls back to server validation if cache is corrupted or missing

### License Key Format

License keys follow the format: `HOSTELPRO-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`
- Prefix: "HOSTELPRO-"
- Four groups of 8 hexadecimal characters
- Example: `HOSTELPRO-3C56E1A2-3F6CF11E-DC9A0FFF-576312EE`

### Operational Notes

**Initial Setup**
1. Generate license using admin API endpoint with valid admin secret
2. Provide license key to customer
3. Customer enters license key in activation screen
4. System binds license to machine and creates encrypted cache
5. Application grants access to main features

**License Recovery**
- If encrypted cache is lost or corrupted, customer must re-enter license key
- Same license key will work on the same machine (machine ID match)
- Cannot use license on different machine if already activated elsewhere

**Expiry Handling**
- Lifetime licenses: `expiry_date` is null
- Timed licenses: System checks expiry on startup and blocks access if expired
- Grace period: None - expired licenses immediately block access