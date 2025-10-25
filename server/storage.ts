import { 
  type Tenant, type InsertTenant,
  type Room, type InsertRoom,
  type Settings, type InsertSettings,
  type Payment, type InsertPayment,
  type License, type InsertLicense
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Tenant operations
  getTenant(id: number): Tenant | undefined;
  getAllTenants(): Tenant[];
  createTenant(tenant: InsertTenant): Tenant;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Tenant | undefined;
  deleteTenant(id: number): boolean;
  markTenantPaymentAsPaid(id: number): Tenant | undefined;
  markTenantPaymentAsPending(id: number): Tenant | undefined;

  // Room operations
  getRoom(id: number): Room | undefined;
  getAllRooms(): Room[];
  createRoom(room: InsertRoom): Room;
  updateRoom(id: number, room: Partial<InsertRoom>): Room | undefined;
  deleteRoom(id: number): boolean;

  // Settings operations
  getSettings(): Settings | undefined;
  updateSettings(settings: Partial<InsertSettings>): Settings | undefined;

  // Payment operations
  getPayment(id: number): Payment | undefined;
  getAllPayments(): Payment[];
  createPayment(payment: InsertPayment): Payment;
  updatePayment(id: number, payment: Partial<InsertPayment>): Payment | undefined;
  deletePayment(id: number): boolean;
  markPaymentAsPaid(id: number): Payment | undefined;
  resetAllPayments(): number;

  // License operations
  getLicenseByKey(licenseKey: string): License | undefined;
  getActiveLicense(): License | undefined;
  createLicense(license: InsertLicense): License;
  activateLicense(licenseKey: string, machineIdHash: string, machineIdSalt: string): License | undefined;
  deactivateLicense(licenseKey: string): License | undefined;
  updateLicenseStatus(licenseKey: string, status: string): License | undefined;
}

export class SqliteStorage implements IStorage {
  // Tenant operations
  getTenant(id: number): Tenant | undefined {
    const stmt = db.prepare("SELECT * FROM tenants WHERE id = ?");
    return stmt.get(id) as Tenant | undefined;
  }

  getAllTenants(): Tenant[] {
    const stmt = db.prepare("SELECT * FROM tenants ORDER BY created_at DESC");
    return stmt.all() as Tenant[];
  }

  createTenant(tenant: InsertTenant): Tenant {
    const stmt = db.prepare(`
      INSERT INTO tenants (name, mobile_number, cnic, father_name, father_cnic, occupation, room_number, rent, join_date, status, payment_status)
      VALUES (@name, @mobile_number, @cnic, @father_name, @father_cnic, @occupation, @room_number, @rent, @join_date, @status, @payment_status)
    `);
    
    const info = stmt.run(tenant);
    const insertedTenant = this.getTenant(info.lastInsertRowid as number);
    
    if (!insertedTenant) {
      throw new Error("Failed to create tenant");
    }
    
    return insertedTenant;
  }

  updateTenant(id: number, tenant: Partial<InsertTenant>): Tenant | undefined {
    const fields = Object.keys(tenant).map(key => `${key} = @${key}`).join(", ");
    const stmt = db.prepare(`UPDATE tenants SET ${fields} WHERE id = @id`);
    
    stmt.run({ ...tenant, id });
    return this.getTenant(id);
  }

  deleteTenant(id: number): boolean {
    const stmt = db.prepare("DELETE FROM tenants WHERE id = ?");
    const info = stmt.run(id);
    return info.changes > 0;
  }

  markTenantPaymentAsPaid(id: number): Tenant | undefined {
    const stmt = db.prepare("UPDATE tenants SET payment_status = 'Paid' WHERE id = ?");
    stmt.run(id);
    return this.getTenant(id);
  }

  markTenantPaymentAsPending(id: number): Tenant | undefined {
    const stmt = db.prepare("UPDATE tenants SET payment_status = 'Pending' WHERE id = ?");
    stmt.run(id);
    return this.getTenant(id);
  }

  // Room operations
  getRoom(id: number): Room | undefined {
    const stmt = db.prepare("SELECT * FROM rooms WHERE id = ?");
    return stmt.get(id) as Room | undefined;
  }

  getAllRooms(): Room[] {
    const stmt = db.prepare("SELECT * FROM rooms ORDER BY room_name");
    return stmt.all() as Room[];
  }

  createRoom(room: InsertRoom): Room {
    const stmt = db.prepare(`
      INSERT INTO rooms (room_name, capacity, price, status, notes)
      VALUES (@room_name, @capacity, @price, @status, @notes)
    `);
    
    const info = stmt.run(room);
    const insertedRoom = this.getRoom(info.lastInsertRowid as number);
    
    if (!insertedRoom) {
      throw new Error("Failed to create room");
    }
    
    return insertedRoom;
  }

  updateRoom(id: number, room: Partial<InsertRoom>): Room | undefined {
    const fields = Object.keys(room).map(key => `${key} = @${key}`).join(", ");
    const stmt = db.prepare(`UPDATE rooms SET ${fields} WHERE id = @id`);
    
    stmt.run({ ...room, id });
    return this.getRoom(id);
  }

  deleteRoom(id: number): boolean {
    const stmt = db.prepare("DELETE FROM rooms WHERE id = ?");
    const info = stmt.run(id);
    return info.changes > 0;
  }

  // Settings operations
  getSettings(): Settings | undefined {
    const stmt = db.prepare("SELECT * FROM settings LIMIT 1");
    return stmt.get() as Settings | undefined;
  }

  updateSettings(settings: Partial<InsertSettings>): Settings | undefined {
    const fields = Object.keys(settings).map(key => `${key} = @${key}`).join(", ");
    const stmt = db.prepare(`UPDATE settings SET ${fields} WHERE id = 1`);
    
    stmt.run(settings);
    return this.getSettings();
  }

  // Payment operations
  getPayment(id: number): Payment | undefined {
    const stmt = db.prepare("SELECT * FROM payments WHERE id = ?");
    return stmt.get(id) as Payment | undefined;
  }

  getAllPayments(): Payment[] {
    const stmt = db.prepare("SELECT * FROM payments ORDER BY created_at DESC");
    return stmt.all() as Payment[];
  }

  createPayment(payment: InsertPayment): Payment {
    const stmt = db.prepare(`
      INSERT INTO payments (tenant_id, amount, month, method, status)
      VALUES (@tenant_id, @amount, @month, @method, @status)
    `);
    
    const info = stmt.run(payment);
    const insertedPayment = this.getPayment(info.lastInsertRowid as number);
    
    if (!insertedPayment) {
      throw new Error("Failed to create payment");
    }
    
    return insertedPayment;
  }

  updatePayment(id: number, payment: Partial<InsertPayment>): Payment | undefined {
    const fields = Object.keys(payment).map(key => `${key} = @${key}`).join(", ");
    const stmt = db.prepare(`UPDATE payments SET ${fields} WHERE id = @id`);
    
    stmt.run({ ...payment, id });
    return this.getPayment(id);
  }

  deletePayment(id: number): boolean {
    const stmt = db.prepare("DELETE FROM payments WHERE id = ?");
    const info = stmt.run(id);
    return info.changes > 0;
  }

  markPaymentAsPaid(id: number): Payment | undefined {
    const stmt = db.prepare("UPDATE payments SET status = 'Paid' WHERE id = ?");
    stmt.run(id);
    return this.getPayment(id);
  }

  resetAllPayments(): number {
    const stmt = db.prepare("UPDATE payments SET status = 'Pending'");
    const info = stmt.run();
    return info.changes;
  }

  // License operations
  getLicenseByKey(licenseKey: string): License | undefined {
    const stmt = db.prepare("SELECT * FROM licenses WHERE license_key = ?");
    return stmt.get(licenseKey) as License | undefined;
  }

  getActiveLicense(): License | undefined {
    const stmt = db.prepare("SELECT * FROM licenses WHERE status = 'active' AND machine_id_hash IS NOT NULL LIMIT 1");
    return stmt.get() as License | undefined;
  }

  createLicense(license: InsertLicense): License {
    const stmt = db.prepare(`
      INSERT INTO licenses (license_key, machine_id_hash, machine_id_salt, customer_name, hostel_name, issue_date, expiry_date, status, notes)
      VALUES (@license_key, @machine_id_hash, @machine_id_salt, @customer_name, @hostel_name, @issue_date, @expiry_date, @status, @notes)
    `);
    
    const info = stmt.run(license);
    const insertedLicense = this.getLicenseByKey(license.license_key);
    
    if (!insertedLicense) {
      throw new Error("Failed to create license");
    }
    
    return insertedLicense;
  }

  activateLicense(licenseKey: string, machineIdHash: string, machineIdSalt: string): License | undefined {
    const stmt = db.prepare(`
      UPDATE licenses 
      SET machine_id_hash = @machineIdHash, 
          machine_id_salt = @machineIdSalt, 
          status = 'active', 
          activated_at = CURRENT_TIMESTAMP 
      WHERE license_key = @licenseKey
    `);
    
    stmt.run({ licenseKey, machineIdHash, machineIdSalt });
    return this.getLicenseByKey(licenseKey);
  }

  deactivateLicense(licenseKey: string): License | undefined {
    const stmt = db.prepare(`
      UPDATE licenses 
      SET machine_id_hash = NULL, 
          machine_id_salt = NULL, 
          status = 'pending', 
          activated_at = NULL 
      WHERE license_key = @licenseKey
    `);
    
    stmt.run({ licenseKey });
    return this.getLicenseByKey(licenseKey);
  }

  updateLicenseStatus(licenseKey: string, status: string): License | undefined {
    const stmt = db.prepare("UPDATE licenses SET status = @status WHERE license_key = @licenseKey");
    stmt.run({ licenseKey, status });
    return this.getLicenseByKey(licenseKey);
  }
}

export const storage = new SqliteStorage();
