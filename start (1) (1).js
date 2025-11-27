#!/usr/bin/env node

/**
 * 🤖 WAIFU BOT PRODUCTION START SCRIPT
 * Runs the Waifu Collection Bot on Render 24/7
 * Auto-restarts if bot crashes
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════');
console.log('🚀 WAIFU BOT - PRODUCTION START');
console.log('════════════════════════════════════════════════════════');
console.log(`⏰ Time: ${new Date().toISOString()}`);
console.log(`📂 Directory: ${process.cwd()}`);

// Verify environment
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set!');
  process.exit(1);
}

console.log('✅ TELEGRAM_BOT_TOKEN: Configured');
console.log('✅ DATABASE_URL: Configured');

// Check bot.js exists
const botPath = path.join(process.cwd(), 'bot.js');
if (!fs.existsSync(botPath)) {
  console.error(`❌ FATAL: bot.js not found at ${botPath}`);
  console.error('Files in current directory:', fs.readdirSync(process.cwd()).slice(0, 10));
  process.exit(1);
}

console.log(`✅ bot.js found at ${botPath}`);
console.log('════════════════════════════════════════════════════════\n');

// Track restart count
let restartCount = 0;

// Start bot with auto-restart
function startBot() {
  restartCount++;
  console.log(`\n📡 [${new Date().toISOString()}] Starting bot (Attempt #${restartCount})`);
  
  const botProcess = spawn('node', ['bot.js'], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd(),
    detached: false
  });

  botProcess.on('error', (error) => {
    console.error(`\n❌ Bot spawn error:`, error.message);
    setTimeout(startBot, 3000);
  });

  botProcess.on('exit', (code, signal) => {
    if (code === 0) {
      console.log(`\n✅ Bot exited normally (code 0)`);
      process.exit(0);
    } else {
      console.log(`\n⚠️ Bot exited (code: ${code}, signal: ${signal})`);
      console.log('🔄 Restarting in 3 seconds...');
      setTimeout(startBot, 3000);
    }
  });

  return botProcess;
}

// Handle process signals
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM received - shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📛 SIGINT received - shutting down...');
  process.exit(0);
});

// Start bot
startBot();

// Keep wrapper process alive
setInterval(() => {}, 60000);
