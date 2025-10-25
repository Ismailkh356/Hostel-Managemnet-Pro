# HostelPro Local - VS Code Setup Guide

This guide will help you run the complete Hostel Management System on your local PC using VS Code.

---

## 📋 Prerequisites

Before you start, make sure you have these installed on your PC:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
   - Verify installation: `node --version`
   
2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`
   
3. **VS Code** - [Download here](https://code.visualstudio.com/)

4. **Git** (optional, but recommended) - [Download here](https://git-scm.com/)

---

## 🚀 Step-by-Step Setup

### Step 1: Download and Extract Project

1. Download your project from Replit as a ZIP file
2. Extract it to a folder on your PC (e.g., `C:\Projects\HostelPro` or `~/Projects/HostelPro`)
3. Open VS Code
4. Click **File → Open Folder** and select your project folder

---

### Step 2: Install Dependencies

Open the **Terminal** in VS Code (View → Terminal or Ctrl+`) and run:

```bash
npm install
```

This will install all required packages for both frontend and backend. Wait for it to complete (may take 2-5 minutes).

**Expected output:** You should see a progress bar and finally "added XXX packages"

---

### Step 3: Set Up Environment Variables (Optional)

Create a `.env` file in the root directory of your project:

```bash
# .env file (create this in the root folder)

# Session Secret (change this to a random string for security)
SESSION_SECRET=your-super-secret-session-key-change-this

# Port (optional - defaults to 5000)
PORT=5000

# Node Environment (development/production)
NODE_ENV=development
```

**Note:** The app works fine without `.env` file as it has sensible defaults.

---

### Step 4: Database Setup

**IMPORTANT:** The SQLite database file is automatically created!

- **Location:** `database.sqlite` in the root folder
- **Auto-created:** When you first run the server, the database is automatically initialized
- **If you have existing data:** Just keep the `database.sqlite` file in the root folder

**No manual setup needed!** The app uses SQLite which is a file-based database - no server installation required.

---

### Step 5: Start the Application

The project uses a **single server** that runs both frontend and backend together.

In VS Code terminal, run:

```bash
npm run dev
```

This command will:
- ✅ Start the Express backend server (Port 5000)
- ✅ Start the Vite development server for React frontend
- ✅ Serve both on `http://localhost:5000`

**Expected output:**
```
Database initialized successfully
serving on port 5000
🔄 Starting automatic backup scheduler (daily at midnight)
✅ Backup scheduler registered: Daily at 00:00 UTC
```

---

### Step 6: Access the Application

1. Open your browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:5000**
3. You should see the **License Activation Screen**

---

## 🔑 License System Setup

### Option A: Generate License Using Script

1. **Open a NEW terminal** in VS Code (keep the server running in the first terminal)
2. Run the license generator:

```bash
node generate-license.js
```

3. Follow the prompts:
   - **Customer Name:** Your name or business name
   - **Hostel Name:** Your hostel name
   - **Should license expire?** Type `no` for permanent license
   - **Save to database?** Type `yes`

4. **Copy the generated license key** (format: `HOSTELPRO-XXXX-XXXX-XXXX-XXXX`)

5. **Refresh your browser** - the app should detect the license automatically

### Option B: Manual License Activation

If the automatic detection doesn't work:

1. You'll see the activation screen
2. Your **Machine ID** will be displayed
3. Enter the license key you generated
4. Click **Activate License**

**Note:** The license is tied to your PC's Machine ID for security.

---

## 👤 Admin Account Setup

After license activation:

1. You'll see the **Admin Setup** page
2. Create your admin account:
   - Username: (choose your username)
   - Password: (choose a strong password)
   - Confirm Password: (re-enter password)
3. Click **Create Admin Account**
4. You'll be redirected to the **Login Page**
5. Login with your credentials
6. Welcome to HostelPro Local! 🎉

---

## 🎯 Application Structure

```
HostelPro/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # Dashboard, Rooms, Guests, Payments, Settings
│   │   ├── components/    # UI components (buttons, cards, forms, etc.)
│   │   └── lib/           # Utilities and API client
│
├── server/                # Backend Express app
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication middleware
│   ├── storage.ts        # Database operations
│   ├── db.ts             # Database initialization
│   ├── backup.ts         # Automatic backup system
│   └── license-service.ts # License management
│
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
│
├── database.sqlite       # SQLite database (auto-created)
├── backups/             # Automatic database backups
├── generate-license.js  # License generator script
└── package.json         # Dependencies
```

---

## 🔧 Important Notes

### No CORS Issues!

**You don't need to worry about CORS or proxy settings** because:
- Frontend and backend run on the **same port (5000)**
- Vite development server is configured to proxy API requests automatically
- Everything is handled in `vite.config.ts` and `server/vite.ts`

### Single Port Architecture

Unlike separate frontend/backend setups:
- ❌ NO separate ports (no 3000 for frontend, 5000 for backend)
- ✅ Everything runs on **Port 5000**
- ✅ API calls go to `/api/*` on the same origin
- ✅ Frontend is served from the root `/`

### API Endpoints

All API calls are relative to the same origin:

```javascript
// Examples from the app
GET  /api/tenants          // Get all tenants
POST /api/tenants          // Add new tenant
GET  /api/rooms            // Get all rooms
POST /api/payments         // Record payment
GET  /api/settings         // Get hostel settings
POST /api/license/validate // Validate license
```

No need to configure `API_URL` - it's all relative!

---

## 🧪 Testing the Application

### 1. Test License System
- ✅ Generate license using `node generate-license.js`
- ✅ Activate license on the activation screen
- ✅ Check Settings page → License Information tab

### 2. Test Admin Authentication
- ✅ Create admin account on first setup
- ✅ Logout and login again
- ✅ Change password in Settings
- ✅ Try accessing app without login (should redirect to login page)

### 3. Test Rooms Management
- ✅ Add a room (e.g., "Room 101", Capacity: 4, Price: 5000)
- ✅ Edit room details
- ✅ Mark room as Available/Occupied

### 4. Test Tenant Management
- ✅ Add a tenant (fill all required fields)
- ✅ Assign tenant to a room
- ✅ Mark payment as Paid/Pending
- ✅ Edit tenant information
- ✅ Search for tenants

### 5. Test Payments
- ✅ Record a payment for a tenant
- ✅ View payment history
- ✅ Export payment records

### 6. Test Dashboard
- ✅ Check Total Tenants count
- ✅ Check Occupied Rooms count
- ✅ Check Monthly Revenue
- ✅ Check Payment Status metrics

### 7. Test Database
- ✅ Add data through the UI
- ✅ Check `database.sqlite` file exists in root folder
- ✅ Check `backups/` folder for automatic backups
- ✅ Data persists after server restart

---

## 📂 Database File Location

The database file is stored at:

```
YourProjectFolder/
└── database.sqlite  ← Database file (auto-created)
```

**Backup Location:**

```
YourProjectFolder/
└── backups/
    ├── hostel-backup-2025-10-25T12-00-00-000Z.db
    ├── hostel-backup-2025-10-24T12-00-00-000Z.db
    └── ... (automatic daily backups, keeps last 7)
```

---

## 🛠 Common Issues & Solutions

### Issue 1: "Port 5000 already in use"

**Solution:**
```bash
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID_NUMBER>
```

Or change the port in `.env`:
```
PORT=3000
```

### Issue 2: "Cannot find module 'better-sqlite3'"

**Solution:**
```bash
npm install
```

If still not working:
```bash
npm rebuild better-sqlite3
```

### Issue 3: Database not creating

**Solution:**
- Make sure you have write permissions in the project folder
- Check if `database.sqlite` exists after running `npm run dev`
- Look at terminal logs for errors

### Issue 4: License activation fails

**Solution:**
- Make sure you ran `node generate-license.js` first
- Check if license was saved to database (answer "yes" in the script)
- Try refreshing the browser
- Check browser console for errors (F12 → Console tab)

### Issue 5: Admin login not working

**Solution:**
- Make sure you created an admin account on the setup page
- Check if you're entering the correct username/password
- After 3 failed attempts, wait 5 minutes (security lockout)
- If completely stuck, delete `database.sqlite` and restart

---

## 🎨 Customization

### Change Hostel Name and Logo

1. Login to the application
2. Go to **Settings** page
3. Update hostel name and upload logo
4. Click **Save Settings**

### Change License Details

1. Login to the application  
2. Go to **Settings → License Information**
3. View license details
4. Generate new license if needed (requires admin login)

---

## 🔒 Security Notes

### Password Security
- Passwords are hashed using **bcrypt** (10 rounds)
- Sessions expire after 24 hours
- Login attempts limited to 3 tries (5-minute lockout)

### License Security
- License is encrypted with **AES-256-GCM**
- Tied to your PC's Machine ID
- Cannot be transferred to another computer without deactivation

### Session Security
- HTTP-only cookies (cannot be accessed by JavaScript)
- Secure flag enabled in production
- CSRF protection through session validation

---

## 📊 Production Deployment (Optional)

To build for production:

```bash
# Build the application
npm run build

# Start production server
npm start
```

This will:
- Build optimized frontend (in `dist/` folder)
- Bundle backend code
- Run on production mode (faster, no hot reload)

---

## 🆘 Need Help?

### Check Logs

**Terminal Output:**
- Look at the terminal where you ran `npm run dev`
- Check for errors or warnings

**Browser Console:**
- Press **F12** in your browser
- Go to **Console** tab
- Look for red errors

### Common Terminal Commands

```bash
# Stop the server
Ctrl + C (in the terminal)

# Restart the server
npm run dev

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## ✅ Success Checklist

Before you consider the setup complete, verify:

- ✅ `npm install` completed without errors
- ✅ `npm run dev` starts server on port 5000
- ✅ Browser opens `http://localhost:5000` successfully
- ✅ License activation page appears
- ✅ License generated using `node generate-license.js`
- ✅ License activated successfully
- ✅ Admin account created
- ✅ Login successful
- ✅ Dashboard displays correctly
- ✅ Can add/edit rooms
- ✅ Can add/edit tenants
- ✅ Can record payments
- ✅ Settings page accessible
- ✅ Data persists after server restart
- ✅ `database.sqlite` file exists in project folder
- ✅ Automatic backups created in `backups/` folder

---

## 🎉 You're All Set!

Your HostelPro Local is now fully functional on your PC!

**Quick Start Commands:**

```bash
# Start the application
npm run dev

# Generate a license (in a new terminal)
node generate-license.js

# Access the app
http://localhost:5000
```

**Main Features:**
- 📊 Dashboard with real-time metrics
- 🏠 Room management
- 👥 Tenant/Guest management
- 💰 Payment tracking with PKR currency
- ⚙️ Settings and customization
- 🔐 Secure admin authentication
- 🔑 License system with machine binding
- 💾 Automatic daily database backups
- 🌙 Dark/Light theme support

---

**Happy Hostel Managing! 🏨**
