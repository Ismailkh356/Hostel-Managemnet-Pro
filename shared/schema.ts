import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
});

export const tenants = sqliteTable("tenants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  mobile_number: text("mobile_number").notNull(),
  cnic: text("cnic").notNull(),
  father_name: text("father_name").notNull(),
  father_cnic: text("father_cnic").notNull(),
  occupation: text("occupation").notNull(),
  room_number: text("room_number").notNull(),
  rent: real("rent").notNull(),
  join_date: text("join_date").notNull(),
  status: text("status").notNull().default("Active"),
  payment_status: text("payment_status").notNull().default("Pending"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  room_name: text("room_name").notNull().unique(),
  capacity: integer("capacity").notNull(),
  price: real("price").notNull(),
  status: text("status").notNull().default("Available"),
  notes: text("notes"),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenant_id: integer("tenant_id").notNull(),
  amount: real("amount").notNull(),
  month: text("month").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const staff = sqliteTable("staff", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  phone: text("phone").notNull(),
  salary: real("salary").notNull(),
  joined_at: text("joined_at").notNull(),
});

export const maintenance = sqliteTable("maintenance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  room_id: integer("room_id").notNull(),
  issue: text("issue").notNull(),
  date_reported: text("date_reported").notNull(),
  status: text("status").notNull().default("pending"),
  remarks: text("remarks"),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostel_name: text("hostel_name").notNull().default("HostelPro"),
  logo_path: text("logo_path"),
});

export const licenses = sqliteTable("licenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  license_key: text("license_key").notNull().unique(),
  machine_id_hash: text("machine_id_hash"),
  machine_id_salt: text("machine_id_salt"),
  customer_name: text("customer_name").notNull(),
  hostel_name: text("hostel_name").notNull(),
  issue_date: text("issue_date").notNull(),
  expiry_date: text("expiry_date"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  activated_at: text("activated_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  created_at: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  created_at: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  created_at: true,
  activated_at: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = typeof maintenance.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licenses.$inferSelect;
