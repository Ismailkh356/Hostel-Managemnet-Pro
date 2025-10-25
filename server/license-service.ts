import crypto from "crypto";
import machineId from "node-machine-id";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const machineIdSync = machineId.machineIdSync;

export interface ValidationResult {
  valid: boolean;
  message: string;
  hostel_name?: string;
  customer_name?: string;
  license_key?: string;
  expiry_date?: string | null;
  status?: string;
}

export function getMachineId(): string {
  try {
    const machineId = machineIdSync(true);
    return machineId.toUpperCase().replace(/-/g, "");
  } catch (error) {
    console.error("Error getting machine ID:", error);
    throw new Error("Failed to retrieve machine ID");
  }
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashMachineId(machineId: string, salt: string): string {
  const normalized = machineId.toUpperCase().replace(/-/g, "");
  const combined = normalized + salt;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

export function generateLicenseKey(): string {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const part = uuidv4().split("-")[0].toUpperCase();
    parts.push(part);
  }
  return `HOSTELPRO-${parts.join("-")}`;
}

export function checkExpiry(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  return now > expiry;
}

const CACHE_DIR = path.join(process.cwd(), ".license");
const CACHE_FILE = path.join(CACHE_DIR, "license.json.enc");

interface LicenseCache {
  license_key: string;
  hostel_name: string;
  customer_name: string;
  activated_at: string;
  expiry_date: string | null;
  machine_id_hash: string;
}

export async function encryptLicenseCache(data: LicenseCache, machineId: string): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });

    const key = crypto.pbkdf2Sync(machineId, "hostelpro-salt", 100000, 32, "sha256");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const payload = {
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      encrypted,
    };

    await fs.writeFile(CACHE_FILE, JSON.stringify(payload), "utf8");
  } catch (error) {
    console.error("Error encrypting license cache:", error);
    throw error;
  }
}

export async function decryptLicenseCache(machineId: string): Promise<LicenseCache | null> {
  try {
    const fileContent = await fs.readFile(CACHE_FILE, "utf8");
    const payload = JSON.parse(fileContent);

    const key = crypto.pbkdf2Sync(machineId, "hostelpro-salt", 100000, 32, "sha256");
    const iv = Buffer.from(payload.iv, "hex");
    const authTag = Buffer.from(payload.authTag, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as LicenseCache;
  } catch (error) {
    return null;
  }
}

export async function clearLicenseCache(): Promise<void> {
  try {
    await fs.unlink(CACHE_FILE);
  } catch (error) {
    // File might not exist, ignore
  }
}

export async function hasLicenseCache(): Promise<boolean> {
  try {
    await fs.access(CACHE_FILE);
    return true;
  } catch {
    return false;
  }
}
