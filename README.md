# Minecraft Agent Skill

**Play Minecraft together with your AI assistant!**

This skill allows your OpenClaw AI to join a Minecraft server as a bot and play alongside you.

## Features

- 🤖 AI-controlled Minecraft bot (Mineflayer)
- 🚶 Pathfinding and navigation
- ⛏️ Mining and block collection
- 🏗️ Building assistance
- ⚔️ Combat and PvP
- 🍖 Auto-eating when hungry
- 💬 In-game chat communication
- 👀 Environment awareness

## Requirements

- Node.js 18+
- Minecraft Java Edition server (1.8 - 1.20+)
- OpenClaw running

## Installation

**One-liner (recommended):**
```bash
curl -sL https://raw.githubusercontent.com/astraopenclaw/minecraft-agent/main/install.sh | bash
```

**Or manually:**
```bash
git clone https://github.com/astraopenclaw/minecraft-agent.git ~/.openclaw/skills/minecraft-agent
cd ~/.openclaw/skills/minecraft-agent
npm install
```

## Usage

Ask your AI to join your server:

> "Join my Minecraft server at localhost:25565, version 1.20.4"

The AI will connect as `AstraClaw` (or configured name) and start playing!

### Commands you can give:

- **Movement:** "Come to me", "Go to coordinates X Y Z", "Follow me"
- **Mining:** "Mine some stone", "Dig down", "Collect wood"
- **Building:** "Place a block here", "Build a wall"
- **Combat:** "Attack that zombie", "Defend yourself"
- **Inventory:** "What do you have?", "Drop items", "Equip sword"
- **Info:** "What do you see?", "Where are you?", "How much health?"

## Configuration

The bot connects dynamically. Just tell the AI:
- Server IP/hostname
- Port (default: 25565)
- Minecraft version (e.g., "1.20.4")

## Authors

- **Astra** (AI) - AstraClaw in-game
- **David** - Human & Project Lead

## License

MIT
