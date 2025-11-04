import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const MONTH_TRACKER_FILE = join(process.cwd(), "last-processed-month.json");

interface MonthTracker {
  lastProcessedMonth: string; // Format: "YYYY-MM"
}

/**
 * Get the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the last processed month from file
 */
function getLastProcessedMonth(): string | null {
  try {
    if (!existsSync(MONTH_TRACKER_FILE)) {
      return null;
    }
    
    const data = readFileSync(MONTH_TRACKER_FILE, 'utf-8');
    const tracker: MonthTracker = JSON.parse(data);
    return tracker.lastProcessedMonth;
  } catch (error) {
    console.error("Error reading month tracker file:", error);
    return null;
  }
}

/**
 * Save the current month as the last processed month
 */
function saveLastProcessedMonth(month: string): void {
  try {
    const tracker: MonthTracker = {
      lastProcessedMonth: month
    };
    writeFileSync(MONTH_TRACKER_FILE, JSON.stringify(tracker, null, 2));
  } catch (error) {
    console.error("Error saving month tracker file:", error);
  }
}

/**
 * Check if we've entered a new month since last check
 * Returns true if it's a new month
 */
export function isNewMonth(): boolean {
  const currentMonth = getCurrentMonth();
  const lastProcessedMonth = getLastProcessedMonth();
  
  // If no tracker file exists, this is the first run
  if (!lastProcessedMonth) {
    saveLastProcessedMonth(currentMonth);
    return false; // Don't process on first run
  }
  
  // Check if month has changed
  if (currentMonth !== lastProcessedMonth) {
    return true;
  }
  
  return false;
}

/**
 * Mark the current month as processed
 */
export function markMonthAsProcessed(): void {
  const currentMonth = getCurrentMonth();
  saveLastProcessedMonth(currentMonth);
  console.log(`✅ Month ${currentMonth} marked as processed`);
}