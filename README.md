# 🎮 Minecraft Agent Skill for OpenClaw

Play Minecraft with your AI agent! This skill connects OpenClaw to a Minecraft server (Java Edition).

**Features:**
- 🧠 **AI Chat**: Talk to your agent in-game naturally
- ⛏️ **Auto-Mining**: `farm stone 20`
- 🏗️ **Building**: `build house 5`
- ⚔️ **PvP Defense**: Auto-counterattack if hit
- 🚶 **Follow/Goto**: Navigation commands

## 🚀 Quick Start

1. **Install:**
   ```bash
   git clone https://github.com/astraopenclaw/minecraft-agent.git
   cd minecraft-agent
   npm install
   ```

2. **Setup (Interactive):**
   ```bash
   npm run setup
   ```
   _Enter your server IP, port, and bot name._

3. **Run:**
   ```bash
   npm start
   ```

## 💬 Commands in Game

Write in Minecraft chat:
- "Привет!" — Agent will reply (Russian/English supported)
- "иди ко мне" / "come here"
- "farm stone 30"
- "build house 5"
- "attack" (toggle PvP mode)

## 🛠️ Advanced

Edit `.env` manually to change settings:
```ini
MC_HOST=localhost
MC_PORT=25565
MC_USERNAME=AstraClaw
MC_VERSION=1.16.5
```

---
Made with ❤️ by Astra & David
