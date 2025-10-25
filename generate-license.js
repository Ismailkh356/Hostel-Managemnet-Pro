// License Generator Script for HostelPro Local
// Run this script to generate your first license key

import Database from "better-sqlite3";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import readline from "readline";
import machineId from "node-machine-id";

const machineIdSync = machineId.machineIdSync;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateLicenseKey() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const part = uuidv4().split("-")[0].toUpperCase();
    parts.push(part);
  }
  return `HOSTELPRO-${parts.join("-")}`;
}

function getMachineId() {
  try {
    const id = machineIdSync(true);
    return id.toUpperCase().replace(/-/g, "");
  } catch (error) {
    console.error("Error getting machine ID:", error);
    throw new Error("Failed to retrieve machine ID");
  }
}

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashMachineId(machineId, salt) {
  const normalized = machineId.toUpperCase().replace(/-/g, "");
  const combined = normalized + salt;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║   HostelPro Local - License Generator             ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  try {
    // Get machine ID
    const currentMachineId = getMachineId();
    console.log("Machine ID:", currentMachineId);
    console.log("");

    // Get input from user
    const customerName = await question("Enter customer/owner name: ");
    const hostelName = await question("Enter hostel name: ");
    
    // Ask if license should expire
    const shouldExpire = await question("\nShould this license expire? (yes/no, default: no): ");
    let expiryDate = null;
    
    if (shouldExpire.toLowerCase() === 'yes' || shouldExpire.toLowerCase() === 'y') {
      const years = await question("Enter number of years (default: 1): ");
      const yearsNum = parseInt(years) || 1;
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + yearsNum);
      expiryDate = expiry.toISOString();
      console.log(`License will expire on: ${expiry.toLocaleDateString()}`);
    } else {
      console.log("License will be permanent (no expiry date)");
    }

    // Generate license key
    const licenseKey = generateLicenseKey();
    const salt = generateSalt();
    const machineIdHash = hashMachineId(currentMachineId, salt);
    const now = new Date().toISOString();

    console.log("\n" + "=".repeat(60));
    console.log("Generated License Information:");
    console.log("=".repeat(60));
    console.log("License Key:", licenseKey);
    console.log("Customer:", customerName);
    console.log("Hostel:", hostelName);
    console.log("Status: Active");
    console.log("Issued:", new Date().toLocaleDateString());
    if (expiryDate) {
      console.log("Expires:", new Date(expiryDate).toLocaleDateString());
    } else {
      console.log("Expires: Never");
    }
    console.log("=".repeat(60));

    // Save to database
    const save = await question("\nSave this license to database? (yes/no): ");
    
    if (save.toLowerCase() === 'yes' || save.toLowerCase() === 'y') {
      const db = new Database("database.sqlite");
      
      db.prepare(`
        INSERT INTO licenses (
          license_key, 
          machine_id_hash, 
          machine_id_salt, 
          customer_name, 
          hostel_name, 
          issue_date, 
          expiry_date, 
          status, 
          activated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `).run(
        licenseKey,
        machineIdHash,
        salt,
        customerName,
        hostelName,
        now,
        expiryDate,
        now
      );
      
      db.close();
      
      console.log("\n✅ License saved to database successfully!");
      console.log("\n📋 IMPORTANT: Copy this license key:");
      console.log("\n   " + licenseKey);
      console.log("\nYou can now:");
      console.log("1. Refresh your browser");
      console.log("2. The activation page should automatically detect the license");
      console.log("3. If not, enter the license key shown above");
      console.log("4. Then set up your admin account");
    } else {
      console.log("\n📋 License NOT saved to database.");
      console.log("Copy this license key to activate manually:");
      console.log("\n   " + licenseKey);
      console.log("\nNote: You'll need to enter this key in the activation page.");
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

main();
