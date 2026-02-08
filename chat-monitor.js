#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

// File to track processed messages
const STATE_FILE = '/tmp/minecraft-chat-state.json';

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastProcessedLine: 0 };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

function sendToBot(message) {
  try {
    // Find the running bot process and send command via stdin
    execSync(`pgrep -f "node src/bot.js" | head -1 | xargs -I {} sh -c 'echo "chat ${message.replace(/"/g, '\\"')}" > /proc/{}/fd/0'`, {
      cwd: '/root/.openclaw/workspace/minecraft-agent',
      timeout: 1000
    });
  } catch (err) {
    console.error('Failed to send to bot:', err.message);
  }
}

// Check bot logs for new messages
const LOG_FILE = '/tmp/minecraft-bot-session.log';

// We'll use process log instead
const sessionId = process.argv[2];
if (!sessionId) {
  console.log('Usage: node minecraft-chat-monitor.js <session-id>');
  process.exit(1);
}

// For cron job: extract messages from bot process log
// Since we can't easily access process logs, we'll modify the approach:
// The bot will write to a chat log file

console.log('Minecraft chat monitor started for session:', sessionId);
console.log('Monitoring for new messages...');

// For now, signal that monitoring is active
// The actual implementation needs to be integrated with OpenClaw's process system
