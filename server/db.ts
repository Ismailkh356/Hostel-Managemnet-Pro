import Database from "better-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const dbPath = join(process.cwd(), "database.sqlite");

// Ensure the database directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff'
    )
  `);

  // Tenants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      cnic TEXT NOT NULL,
      father_name TEXT NOT NULL,
      father_cnic TEXT NOT NULL,
      room_number TEXT NOT NULL,
      rent REAL NOT NULL,
      join_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table - migrate from old schema if needed
  const roomsTableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='rooms'"
  ).get();
  
  if (roomsTableExists) {
    // Check if old schema exists (has room_no column)
    const hasOldSchema = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('rooms') WHERE name='room_no'"
    ).get() as { count: number };
    
    if (hasOldSchema.count > 0) {
      // Migrate old schema to new schema
      db.exec(`
        CREATE TABLE rooms_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_name TEXT NOT NULL UNIQUE,
          capacity INTEGER NOT NULL,
          price REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'Available',
          notes TEXT
        )
      `);
      
      db.exec(`
        INSERT INTO rooms_new (id, room_name, capacity, price, status, notes)
        SELECT id, room_no, capacity, price, 
          CASE WHEN occupied > 0 THEN 'Occupied' ELSE 'Available' END,
          notes
        FROM rooms
      `);
      
      db.exec(`DROP TABLE rooms`);
      db.exec(`ALTER TABLE rooms_new RENAME TO rooms`);
    }
  } else {
    // Create new rooms table with updated schema
    db.exec(`
      CREATE TABLE rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Available',
        notes TEXT
      )
    `);
  }

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Staff table
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      salary REAL NOT NULL,
      joined_at TEXT NOT NULL
    )
  `);

  // Maintenance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      issue TEXT NOT NULL,
      date_reported TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      remarks TEXT
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_name TEXT NOT NULL DEFAULT 'HostelPro',
      logo_path TEXT
    )
  `);

  // Insert default settings if not exists
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0) {
    db.exec(`INSERT INTO settings (hostel_name) VALUES ('HostelPro')`);
  }

  console.log("Database initialized successfully");
}

// Initialize the database when this module is imported
initializeDatabase();
