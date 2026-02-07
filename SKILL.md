# Minecraft Agent Skill

> **Play Minecraft together with your AI assistant!**

## Overview

This skill allows OpenClaw AI to join a Minecraft Java Edition server as a bot named **AstraClaw** and play alongside the human.

## Capabilities

The bot can:
- **Move**: Walk, jump, swim, climb, pathfind to locations
- **Mine**: Dig blocks, collect resources
- **Build**: Place blocks (with player guidance)
- **Combat**: Fight mobs and players (PvP)
- **Survive**: Auto-eat when hungry, report health
- **Communicate**: Chat in-game, respond to commands
- **Follow**: Follow the player around

## How to Use

### 1. Start the Minecraft Server

The human should have a Minecraft Java Edition server running. Can be:
- Local server (localhost)
- LAN world
- Remote server (if it allows bots)

**Important**: Server must be in **offline mode** (`online-mode=false` in server.properties) for the bot to join without authentication.

### 2. Connect the Bot

Run from the skill directory:

```bash
cd minecraft-agent
npm install  # first time only
node src/bot.js <host> <port> <username> <version>
```

Example:
```bash
node src/bot.js localhost 25565 AstraClaw 1.20.4
```

Or use environment variables:
```bash
MC_HOST=localhost MC_PORT=25565 MC_USERNAME=AstraClaw MC_VERSION=1.20.4 node src/bot.js
```

### 3. Control the Bot

**In-game chat commands** (player types in Minecraft):
- `привет` / `hello` - Bot says hi
- `иди сюда` / `come here` - Bot walks to you
- `следуй` / `follow` - Bot follows you
- `стоп` / `stop` - Bot stops all actions
- `копай` / `mine` - Bot mines nearby blocks
- `где ты` / `where are you` - Bot reports position
- `здоровье` / `health` - Bot reports HP and hunger
- `инвентарь` / `inventory` - Bot lists items

**Stdin commands** (AI sends to bot process):
- `chat <message>` - Say something in chat
- `goto <x> <y> <z>` - Walk to coordinates
- `follow <username>` - Follow a player
- `stop` - Stop all actions
- `mine` - Mine nearby blocks
- `status` - Report position/health
- `inventory` - List inventory
- `look` - Report nearby entities
- `quit` - Disconnect and exit

### 4. AI Integration

The AI reads stdout from the bot process to understand:
- `[CHAT] username: message` - In-game chat
- `[STATUS] ...` - Bot status updates
- `[INVENTORY] ...` - Inventory contents
- `[ENTITIES] ...` - Nearby entities
- `[ACTION] ...` - Action confirmations

The AI writes to stdin to control the bot.

## Dependencies

- `mineflayer` - Minecraft bot framework
- `mineflayer-pathfinder` - A* pathfinding
- `mineflayer-pvp` - Combat
- `mineflayer-collectblock` - Block collection
- `mineflayer-auto-eat` - Auto-eating
- `vec3` - Vector math

## Supported Versions

Minecraft Java Edition: **1.8 - 1.20.4+**

(Mineflayer auto-detects version if not specified)

## Troubleshooting

**Bot can't connect:**
- Check `online-mode=false` in server.properties
- Verify host/port are correct
- Make sure server is running

**Bot can't see player:**
- Player must be within render distance
- Try getting closer

**Bot gets stuck:**
- Use `stop` command
- Check for obstacles

## Authors

- **Astra** ✨ - AI, plays as AstraClaw
- **David** - Human, project lead

## License

MIT - Open source, free to use and modify!
