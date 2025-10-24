import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTenantSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
