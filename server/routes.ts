import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTenantSchema, 
  insertRoomSchema, 
  insertSettingsSchema,
  insertPaymentSchema 
} from "@shared/schema";
import { z } from "zod";
import { createBackup, getBackupInfo } from "./backup";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
