# 🏨 HostelPro Local - Hostel Management System

A complete offline hostel management web application with license protection, admin authentication, and comprehensive tenant/payment management.

---

## 🚀 Quick Start (for VS Code / Local Setup)

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   ```
   http://localhost:5000
   ```

4. **Generate license:**
   
   Open a NEW terminal (keep the server running) and run:
   ```bash
   node generate-license.js
   ```
   
   Follow the prompts and copy the generated license key.

5. **Activate & Setup:**
   - Refresh browser
   - Enter license key (if needed)
   - Create admin account
   - Start managing your hostel!

---

## 📚 Complete Setup Guide

**For detailed setup instructions, troubleshooting, and explanations:**

👉 **[Read the Complete LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)**

This guide includes:
- Detailed step-by-step installation
- Database setup
- License system explanation
- CORS and port configuration (hint: no setup needed!)
- Testing procedures
- Common issues and solutions
- Production deployment

---

## ✨ Features

### 🔐 Security
- **License System** - Machine-bound activation with AES-256 encryption
- **Admin Authentication** - Secure login with bcrypt password hashing
- **Session Management** - 24-hour sessions with automatic timeout
- **Login Protection** - 3-attempt limit with 5-minute lockout

### 🏠 Room Management
- Add/edit/delete rooms
- Track capacity and pricing
- Monitor availability status
- Assign tenants to rooms

### 👥 Tenant Management
- Complete tenant records (name, CNIC, occupation, etc.)
- Mobile number and father's details
- Payment status tracking (Paid/Pending)
- Room assignment
- Join date tracking

### 💰 Payment Management
- Record tenant payments
- Monthly rent tracking
- PKR currency support
- Payment method recording
- Payment history

### 📊 Dashboard
- Real-time metrics
- Total tenants count
- Occupied rooms visualization
- Monthly revenue tracking
- Payment status overview

### ⚙️ Settings
- Hostel name customization
- Logo upload
- License information display
- Admin password change
- Logout functionality

### 💾 Automatic Backups
- Daily automatic database backups (midnight UTC)
- Keeps last 7 backups
- Manual backup option
- SQLite file-based storage

### 🎨 UI/UX
- Modern, responsive design
- Dark/Light theme support
- Mobile-friendly interface
- Tailwind CSS styling
- Shadcn UI components

---

## 🏗 Technology Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **TanStack Query** - Data fetching
- **Wouter** - Routing
- **React Hook Form** - Form management
- **Zod** - Validation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database (better-sqlite3)
- **bcrypt** - Password hashing
- **express-session** - Session management
- **node-cron** - Scheduled tasks

### Development
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **tsx** - TypeScript execution

---

## 📁 Project Structure

```
HostelPro/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Dashboard, Rooms, Guests, Payments, Settings
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # Utilities
│
├── server/             # Express backend
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API routes
│   ├── auth.ts        # Authentication
│   ├── storage.ts     # Database operations
│   └── db.ts          # Database initialization
│
├── shared/            # Shared types
│   └── schema.ts      # Database schema
│
├── database.sqlite    # SQLite database (auto-created)
├── backups/           # Automatic backups
└── generate-license.js # License generator
```

---

## 🔧 Available Scripts

```bash
# Development (starts both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Generate license key
node generate-license.js
```

---

## 🌐 API Endpoints

### Public Routes
```
GET  /api/license           # Check license
POST /api/license/validate  # Activate license
GET  /api/machine-id        # Get machine ID
GET  /api/auth/status       # Check auth status
POST /api/auth/setup        # Create admin
POST /api/auth/login        # Login
```

### Protected Routes (require authentication)
```
GET    /api/tenants         # Get all tenants
POST   /api/tenants         # Add tenant
PUT    /api/tenants/:id     # Update tenant
DELETE /api/tenants/:id     # Delete tenant

GET    /api/rooms           # Get all rooms
POST   /api/rooms           # Add room
PUT    /api/rooms/:id       # Update room
DELETE /api/rooms/:id       # Delete room

GET    /api/payments        # Get all payments
POST   /api/payments        # Record payment
DELETE /api/payments/:id    # Delete payment

GET    /api/settings        # Get settings
PUT    /api/settings/:id    # Update settings

GET    /api/backups         # Get backup info
POST   /api/backups/create  # Create backup

POST   /api/auth/logout         # Logout
POST   /api/auth/change-password # Change password
```

---

## 📝 Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# Session secret (change in production)
SESSION_SECRET=your-secret-key-here

# Port (default: 5000)
PORT=5000

# Environment
NODE_ENV=development
```

**Note:** The app works without `.env` using sensible defaults.

---

## 🔑 License System

The application uses a machine-bound license system:

1. **Generate License:**
   ```bash
   node generate-license.js
   ```

2. **Features:**
   - Tied to machine hardware ID
   - AES-256-GCM encryption
   - Offline validation (no internet required)
   - Optional expiry dates
   - Permanent licenses supported

3. **Storage:**
   - License data in `database.sqlite`
   - Encrypted cache in `.license/` folder
   - Portable with database file

---

## 💾 Database & Backups

### Database
- **File:** `database.sqlite` (root folder)
- **Type:** SQLite (file-based, no server needed)
- **Auto-created:** On first run
- **Portable:** Copy file to backup/transfer data

### Automatic Backups
- **Schedule:** Daily at midnight UTC
- **Location:** `backups/` folder
- **Retention:** Last 7 backups
- **Format:** `hostel-backup-YYYY-MM-DDTHH-MM-SS-MSSZ.db`
- **Manual:** Available in Settings page

---

## 🛠 Common Issues

### Port 5000 in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux  
lsof -i :5000
kill -9 <PID>
```

### Cannot find module
```bash
npm install
```

### Database issues
```bash
# Delete and restart (will lose data)
rm database.sqlite
npm run dev
```

### License issues
```bash
# Regenerate license
node generate-license.js
# Answer "yes" to save to database
```

---

## 🔒 Security Features

- ✅ Bcrypt password hashing (10 rounds)
- ✅ Session-based authentication
- ✅ HTTP-only cookies
- ✅ Login attempt limiting (3 tries)
- ✅ Account lockout (5 minutes)
- ✅ License encryption (AES-256)
- ✅ Machine ID binding
- ✅ CSRF protection

---

## 📖 Documentation

- **[Complete Setup Guide](./LOCAL_SETUP_GUIDE.md)** - Detailed installation and configuration
- **[Project Documentation](./replit.md)** - Technical architecture and development notes

---

## 🎯 Testing Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Start server (`npm run dev`)
- [ ] Generate license (`node generate-license.js`)
- [ ] Activate license in browser
- [ ] Create admin account
- [ ] Login successfully
- [ ] Add a room
- [ ] Add a tenant
- [ ] Record a payment
- [ ] Check dashboard metrics
- [ ] Test logout/login
- [ ] Verify data persists after restart

---

## 📞 Support

For issues, bugs, or questions:
1. Check the [Complete Setup Guide](./LOCAL_SETUP_GUIDE.md)
2. Review the troubleshooting section
3. Check browser console for errors (F12)
4. Review terminal output for server errors

---

## 📄 License

This software uses a proprietary license system. Each installation requires a valid license key tied to the machine's hardware ID.

---

## 🎉 Quick Commands Reference

```bash
# First time setup
npm install
node generate-license.js
npm run dev

# Daily usage
npm run dev

# Create backup
# (Available in Settings page or automatic daily)

# Production build
npm run build
npm start
```

---

**Made for offline hostel management** 🏨

**No internet required once activated!** ✨
