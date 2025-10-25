import { promises as fs } from "fs";
import path from "path";
import { db } from "./db";
import cron from "node-cron";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = 7;

async function ensureBackupDirectory() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

async function getBackupFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    return files
      .filter(file => file.endsWith('.db'))
      .sort()
      .reverse();
  } catch (error) {
    console.error("Error reading backup directory:", error);
    return [];
  }
}

async function deleteOldBackups() {
  const backups = await getBackupFiles();
  
  if (backups.length > MAX_BACKUPS) {
    const backupsToDelete = backups.slice(MAX_BACKUPS);
    
    for (const backup of backupsToDelete) {
      try {
        await fs.unlink(path.join(BACKUP_DIR, backup));
        console.log(`Deleted old backup: ${backup}`);
      } catch (error) {
        console.error(`Failed to delete backup ${backup}:`, error);
      }
    }
  }
}

export async function createBackup() {
  try {
    await ensureBackupDirectory();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const backupFileName = `hostel-backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    const dbPath = path.join(process.cwd(), "database.sqlite");
    
    try {
      await fs.copyFile(dbPath, backupPath);
      console.log(`✅ Database backup created: ${backupFileName}`);
      
      await deleteOldBackups();
      
      return { success: true, backupPath, fileName: backupFileName };
    } catch (error) {
      console.error("Error creating backup:", error);
      return { success: false, error };
    }
  } catch (error) {
    console.error("Backup failed:", error);
    return { success: false, error };
  }
}

export function startBackupScheduler() {
  console.log("🔄 Starting automatic backup scheduler (daily at midnight)");
  
  createBackup();
  
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running scheduled database backup (midnight)...");
    await createBackup();
  }, {
    timezone: "UTC"
  });
  
  console.log("✅ Backup scheduler registered: Daily at 00:00 UTC");
}

export async function getBackupInfo() {
  const backups = await getBackupFiles();
  const backupDetails = await Promise.all(
    backups.map(async (fileName) => {
      const filePath = path.join(BACKUP_DIR, fileName);
      try {
        const stats = await fs.stat(filePath);
        return {
          fileName,
          size: stats.size,
          created: stats.birthtime,
        };
      } catch {
        return null;
      }
    })
  );
  
  return backupDetails.filter(backup => backup !== null);
}
