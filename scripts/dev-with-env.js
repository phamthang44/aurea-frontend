#!/usr/bin/env node
/**
 * Script to load .env.dev and start Next.js dev server
 * Next.js reads env vars at startup, so we need to set them before starting
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const envDevPath = path.join(process.cwd(), ".env.dev");
const envLocalPath = path.join(process.cwd(), ".env.local");

// If .env.dev exists, copy it to .env.local (Next.js reads .env.local automatically)
if (fs.existsSync(envDevPath)) {
  try {
    fs.copyFileSync(envDevPath, envLocalPath);
    console.log("✓ Copied .env.dev to .env.local");
  } catch (error) {
    console.error("Error copying .env.dev:", error);
  }
} else {
  console.warn("⚠ .env.dev file not found.");
}

// Start Next.js dev server
const nextDev = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
});

nextDev.on("close", (code) => {
  process.exit(code);
});
