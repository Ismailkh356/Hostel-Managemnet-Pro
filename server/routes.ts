import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTenantSchema, 
  insertRoomSchema, 
  insertSettingsSchema,
  insertPaymentSchema,
  insertLicenseSchema,
  insertAdminUserSchema 
} from "@shared/schema";
import { z } from "zod";
import { createBackup, getBackupInfo } from "./backup";
import {
  getMachineId,
  generateSalt,
  hashMachineId,
  generateLicenseKey,
  checkExpiry,
  encryptLicenseCache,
  decryptLicenseCache,
  clearLicenseCache,
  type ValidationResult
} from "./license-service";
import {
  hashPassword,
  comparePassword,
  isAccountLocked,
  getLockExpiryTime,
  shouldLockAccount,
  requireAuth,
  type AuthenticatedRequest
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // GET /api/auth/status - Check if admin account exists and if user is logged in
  app.get("/api/auth/status", async (req, res) => {
    try {
      const hasAdmin = storage.hasAdminAccount();
      const authReq = req as AuthenticatedRequest;
      const isLoggedIn = !!(authReq.session && authReq.session.adminId);
      
      res.json({
        hasAdminAccount: hasAdmin,
        isAuthenticated: isLoggedIn,
        username: authReq.session?.username || null
      });
    } catch (error) {
      console.error("Error checking auth status:", error);
      res.status(500).json({ error: "Failed to check auth status" });
    }
  });

  // POST /api/auth/setup - Create first admin account
  app.post("/api/auth/setup", async (req, res) => {
    try {
      // Check if admin account already exists
      if (storage.hasAdminAccount()) {
        return res.status(400).json({ error: "Admin account already exists" });
      }

      const setupSchema = z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        confirmPassword: z.string()
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
      });

      const { username, password } = setupSchema.parse(req.body);

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create admin user
      const admin = storage.createAdminUser({
        username,
        password_hash: passwordHash
      });

      // Log in the admin immediately
      const authReq = req as AuthenticatedRequest;
      authReq.session.adminId = admin.id;
      authReq.session.username = admin.username;

      res.json({
        message: "Admin account created successfully",
        username: admin.username
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }

      console.error("Error creating admin account:", error);
      res.status(500).json({ error: "Failed to create admin account" });
    }
  });

  // POST /api/auth/login - Admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });

      const { username, password } = loginSchema.parse(req.body);

      // Get admin user
      const admin = storage.getAdminByUsername(username);

      if (!admin) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Check if account is locked
      if (isAccountLocked(admin.locked_until)) {
        return res.status(403).json({ 
          error: "Account is locked due to too many failed login attempts. Please try again in 5 minutes." 
        });
      }

      // Verify password
      const isValid = await comparePassword(password, admin.password_hash);

      if (!isValid) {
        // Increment failed login attempts
        storage.incrementFailedLoginAttempts(username);

        // Check if we should lock the account
        const updatedAdmin = storage.getAdminByUsername(username);
        if (updatedAdmin && shouldLockAccount(updatedAdmin.failed_login_attempts)) {
          const lockUntil = getLockExpiryTime();
          storage.lockAdmin(username, lockUntil);
        }

        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Reset failed login attempts
      storage.resetFailedLoginAttempts(username);

      // Update last login
      storage.updateLastLogin(username);

      // Set session
      const authReq = req as AuthenticatedRequest;
      authReq.session.adminId = admin.id;
      authReq.session.username = admin.username;

      res.json({
        message: "Login successful",
        username: admin.username
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }

      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/auth/logout - Admin logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      authReq.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // POST /api/auth/change-password - Change admin password (requires authentication)
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const username = authReq.session.username;

      if (!username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const changePasswordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
        confirmPassword: z.string()
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
      });

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Get admin user
      const admin = storage.getAdminByUsername(username);

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      // Verify current password
      const isValid = await comparePassword(currentPassword, admin.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      storage.updateAdminPassword(username, newPasswordHash);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }

      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Tenant Routes
  
  // GET /api/tenants - Get all tenants
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  // GET /api/tenants/:id - Get single tenant
  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenant = storage.getTenant(id);
      
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      res.json(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  // POST /api/tenants - Add new tenant
  app.post("/api/tenants", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertTenantSchema.parse(req.body);
      
      // Create tenant
      const newTenant = storage.createTenant(validatedData);
      
      res.status(201).json({
        message: "Tenant added successfully",
        data: newTenant
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error creating tenant:", error);
      res.status(500).json({ error: "Failed to create tenant" });
    }
  });

  // PUT /api/tenants/:id - Update tenant
  app.put("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body (partial update)
      const validatedData = insertTenantSchema.partial().parse(req.body);
      
      // Update tenant
      const updatedTenant = storage.updateTenant(id, validatedData);
      
      if (!updatedTenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      res.json({
        message: "Tenant updated successfully",
        data: updatedTenant
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error updating tenant:", error);
      res.status(500).json({ error: "Failed to update tenant" });
    }
  });

  // DELETE /api/tenants/:id - Delete tenant
  app.delete("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = storage.deleteTenant(id);
      
      if (!success) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      res.json({ message: "Tenant deleted successfully" });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      res.status(500).json({ error: "Failed to delete tenant" });
    }
  });

  // PUT /api/tenants/:id/mark-paid - Mark tenant payment as paid
  app.put("/api/tenants/:id/mark-paid", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTenant = storage.markTenantPaymentAsPaid(id);
      
      if (!updatedTenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      res.json({
        message: "Tenant payment marked as paid",
        data: updatedTenant
      });
    } catch (error) {
      console.error("Error marking tenant payment as paid:", error);
      res.status(500).json({ error: "Failed to mark payment as paid" });
    }
  });

  // PUT /api/tenants/:id/mark-pending - Mark tenant payment as pending
  app.put("/api/tenants/:id/mark-pending", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTenant = storage.markTenantPaymentAsPending(id);
      
      if (!updatedTenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      
      res.json({
        message: "Tenant payment marked as pending",
        data: updatedTenant
      });
    } catch (error) {
      console.error("Error marking tenant payment as pending:", error);
      res.status(500).json({ error: "Failed to mark payment as pending" });
    }
  });

  // Room Routes
  
  // GET /api/rooms - Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  // GET /api/rooms/:id - Get single room
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const room = storage.getRoom(id);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  // POST /api/rooms - Add new room
  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const newRoom = storage.createRoom(validatedData);
      
      res.status(201).json({
        message: "Room added successfully",
        data: newRoom
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // PUT /api/rooms/:id - Update room
  app.put("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoomSchema.partial().parse(req.body);
      const updatedRoom = storage.updateRoom(id, validatedData);
      
      if (!updatedRoom) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      res.json({
        message: "Room updated successfully",
        data: updatedRoom
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error updating room:", error);
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  // DELETE /api/rooms/:id - Delete room
  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = storage.deleteRoom(id);
      
      if (!success) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ error: "Failed to delete room" });
    }
  });

  // Settings Routes
  
  // GET /api/settings - Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = storage.getSettings();
      
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // PUT /api/settings - Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const updatedSettings = storage.updateSettings(validatedData);
      
      if (!updatedSettings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json({
        message: "Settings updated successfully",
        data: updatedSettings
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Payment Routes
  
  // GET /api/payments - Get all payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // POST /api/payments - Add new payment
  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const newPayment = storage.createPayment(validatedData);
      
      res.status(201).json({
        message: "Payment added successfully",
        data: newPayment
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // PUT /api/payments/:id/mark-paid - Mark payment as paid
  app.put("/api/payments/:id/mark-paid", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPayment = storage.markPaymentAsPaid(id);
      
      if (!updatedPayment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json({
        message: "Payment marked as paid",
        data: updatedPayment
      });
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      res.status(500).json({ error: "Failed to mark payment as paid" });
    }
  });

  // POST /api/payments/reset-all - Reset all payments to pending
  app.post("/api/payments/reset-all", async (req, res) => {
    try {
      const updatedCount = storage.resetAllPayments();
      
      res.json({
        message: "All payments reset to pending",
        updatedCount
      });
    } catch (error) {
      console.error("Error resetting payments:", error);
      res.status(500).json({ error: "Failed to reset payments" });
    }
  });

  // Backup Routes

  // GET /api/backups - Get backup information
  app.get("/api/backups", async (req, res) => {
    try {
      const backups = await getBackupInfo();
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backup info:", error);
      res.status(500).json({ error: "Failed to fetch backup information" });
    }
  });

  // POST /api/backups/create - Manually trigger a backup
  app.post("/api/backups/create", async (req, res) => {
    try {
      const result = await createBackup();
      
      if (result.success) {
        res.json({
          message: "Backup created successfully",
          fileName: result.fileName,
          backupPath: result.backupPath
        });
      } else {
        res.status(500).json({
          error: "Failed to create backup",
          details: result.error
        });
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  // License Routes

  // GET /api/machine-id - Get current machine ID
  app.get("/api/machine-id", (req, res) => {
    try {
      const machineId = getMachineId();
      res.json({ machine_id: machineId });
    } catch (error) {
      console.error("Error getting machine ID:", error);
      res.status(500).json({ error: "Failed to get machine ID" });
    }
  });

  // GET /api/license - Get active license information
  app.get("/api/license", async (req, res) => {
    try {
      const license = storage.getActiveLicense();
      
      if (!license) {
        return res.status(404).json({ error: "No active license found" });
      }

      res.json({
        license_key: license.license_key,
        customer_name: license.customer_name,
        hostel_name: license.hostel_name,
        status: license.status,
        issue_date: license.issue_date,
        expiry_date: license.expiry_date,
        activated_at: license.activated_at,
      });
    } catch (error) {
      console.error("Error fetching license:", error);
      res.status(500).json({ error: "Failed to fetch license information" });
    }
  });

  // POST /api/license/validate - Validate and activate license
  app.post("/api/license/validate", async (req, res) => {
    try {
      const schema = z.object({
        license_key: z.string(),
        machine_id: z.string(),
      });

      const { license_key, machine_id } = schema.parse(req.body);

      const license = storage.getLicenseByKey(license_key);

      if (!license) {
        return res.json({
          valid: false,
          message: "Invalid license key",
        } as ValidationResult);
      }

      if (license.status === "suspended" || license.status === "revoked") {
        return res.json({
          valid: false,
          message: "This license has been suspended or revoked. Please contact support.",
        } as ValidationResult);
      }

      if (license.expiry_date && checkExpiry(license.expiry_date)) {
        storage.updateLicenseStatus(license_key, "expired");
        return res.json({
          valid: false,
          message: "License has expired",
        } as ValidationResult);
      }

      if (!license.machine_id_hash) {
        const salt = generateSalt();
        const hash = hashMachineId(machine_id, salt);
        storage.activateLicense(license_key, hash, salt);

        const machineId = getMachineId();
        await encryptLicenseCache(
          {
            license_key: license.license_key,
            hostel_name: license.hostel_name,
            customer_name: license.customer_name,
            activated_at: new Date().toISOString(),
            expiry_date: license.expiry_date,
            machine_id_hash: hash,
          },
          machineId
        );

        return res.json({
          valid: true,
          message: "License activated successfully",
          hostel_name: license.hostel_name,
          customer_name: license.customer_name,
          license_key: license.license_key,
          expiry_date: license.expiry_date,
          status: "active",
        } as ValidationResult);
      } else {
        const hash = hashMachineId(machine_id, license.machine_id_salt!);
        
        if (hash !== license.machine_id_hash) {
          return res.json({
            valid: false,
            message: "License is already activated on a different machine",
          } as ValidationResult);
        }

        return res.json({
          valid: true,
          message: "License is valid",
          hostel_name: license.hostel_name,
          customer_name: license.customer_name,
          license_key: license.license_key,
          expiry_date: license.expiry_date,
          status: license.status,
        } as ValidationResult);
      }
    } catch (error) {
      console.error("Error validating license:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to validate license" });
    }
  });

  // POST /api/license/generate - Generate new license (admin only)
  app.post("/api/license/generate", async (req, res) => {
    try {
      const schema = z.object({
        customer_name: z.string(),
        hostel_name: z.string(),
        expiry_date: z.string().nullable().optional(),
        notes: z.string().optional(),
        admin_secret: z.string(),
      });

      const data = schema.parse(req.body);

      const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-secret-admin-key-change-this";
      
      if (data.admin_secret !== ADMIN_SECRET) {
        return res.status(403).json({ error: "Unauthorized: Invalid admin secret" });
      }

      const licenseKey = generateLicenseKey();
      const issueDate = new Date().toISOString();

      const newLicense = storage.createLicense({
        license_key: licenseKey,
        machine_id_hash: null,
        machine_id_salt: null,
        customer_name: data.customer_name,
        hostel_name: data.hostel_name,
        issue_date: issueDate,
        expiry_date: data.expiry_date || null,
        status: "pending",
        notes: data.notes || null,
      });

      res.json({
        message: "License generated successfully",
        license: {
          license_key: newLicense.license_key,
          customer_name: newLicense.customer_name,
          hostel_name: newLicense.hostel_name,
          issue_date: newLicense.issue_date,
          expiry_date: newLicense.expiry_date,
          status: newLicense.status,
        },
      });
    } catch (error) {
      console.error("Error generating license:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate license" });
    }
  });

  // POST /api/license/deactivate - Deactivate current license
  app.post("/api/license/deactivate", async (req, res) => {
    try {
      const schema = z.object({
        license_key: z.string(),
      });

      const { license_key } = schema.parse(req.body);

      const license = storage.getLicenseByKey(license_key);

      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }

      storage.deactivateLicense(license_key);
      await clearLicenseCache();

      res.json({
        message: "License deactivated successfully",
      });
    } catch (error) {
      console.error("Error deactivating license:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to deactivate license" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
