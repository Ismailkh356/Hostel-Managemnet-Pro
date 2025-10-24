import { type Tenant, type InsertTenant } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Tenant operations
  getTenant(id: number): Tenant | undefined;
  getAllTenants(): Tenant[];
  createTenant(tenant: InsertTenant): Tenant;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Tenant | undefined;
  deleteTenant(id: number): boolean;
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
      INSERT INTO tenants (name, mobile_number, cnic, father_name, father_cnic, room_number, rent, join_date, status)
      VALUES (@name, @mobile_number, @cnic, @father_name, @father_cnic, @room_number, @rent, @join_date, @status)
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
}

export const storage = new SqliteStorage();
