// Script to load .env.dev file for Next.js
const fs = require("fs");
const path = require("path");

const envDevPath = path.join(process.cwd(), ".env.dev");
const envLocalPath = path.join(process.cwd(), ".env.local");

// Check if .env.dev exists
if (fs.existsSync(envDevPath)) {
  // Read .env.dev
  const envContent = fs.readFileSync(envDevPath, "utf8");

  // Parse and set environment variables
  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value.trim();
      }
    }
  });

  console.log("✓ Loaded environment variables from .env.dev");
} else {
  console.warn(
    "⚠ .env.dev file not found. Using default environment variables."
  );
}
