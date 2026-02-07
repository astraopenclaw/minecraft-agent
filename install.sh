#!/bin/bash
# Minecraft Agent Installer for OpenClaw
# Usage: curl -sL https://raw.githubusercontent.com/astraopenclaw/minecraft-agent/main/install.sh | bash

set -e

SKILL_DIR="${HOME}/.openclaw/skills/minecraft-agent"

echo "🎮 Installing Minecraft Agent for OpenClaw..."
echo ""

# Check for git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check for node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create skills directory if needed
mkdir -p "${HOME}/.openclaw/skills"

# Remove old installation if exists
if [ -d "$SKILL_DIR" ]; then
    echo "📦 Removing old installation..."
    rm -rf "$SKILL_DIR"
fi

# Clone repository
echo "📥 Cloning repository..."
git clone --depth 1 https://github.com/astraopenclaw/minecraft-agent.git "$SKILL_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
cd "$SKILL_DIR"
npm install --silent

echo ""
echo "✅ Installation complete!"
echo ""
echo "📍 Installed to: $SKILL_DIR"
echo ""
echo "🚀 To start the bot, run:"
echo "   cd $SKILL_DIR"
echo "   node src/bot.js <server-ip> <port> <username> <mc-version>"
echo ""
echo "   Example:"
echo "   node src/bot.js localhost 25565 AstraClaw 1.20.4"
echo ""
echo "🎮 Have fun playing with your AI! 🦞"
