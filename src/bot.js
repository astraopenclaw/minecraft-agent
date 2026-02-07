const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const pvp = require('mineflayer-pvp').plugin;
const autoEat = require('mineflayer-auto-eat').plugin;

// Configuration from environment or command line
const config = {
  host: process.env.MC_HOST || process.argv[2] || 'localhost',
  port: parseInt(process.env.MC_PORT || process.argv[3]) || 25565,
  username: process.env.MC_USERNAME || process.argv[4] || 'AstraClaw',
  version: process.env.MC_VERSION || process.argv[5] || null, // auto-detect if null
  hideErrors: false
};

console.log(`🤖 AstraClaw Minecraft Agent`);
console.log(`📡 Connecting to ${config.host}:${config.port}`);
console.log(`👤 Username: ${config.username}`);
console.log(`🎮 Version: ${config.version || 'auto-detect'}`);

let bot = null;

function createBot() {
  bot = mineflayer.createBot(config);

  // Load plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);
  bot.loadPlugin(pvp);
  bot.loadPlugin(autoEat);

  // Event handlers
  bot.once('spawn', () => {
    console.log('✅ Spawned in world!');
    console.log(`📍 Position: ${bot.entity.position}`);
    
    // Setup pathfinder
    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);
    
    // Setup auto-eat
    bot.autoEat.options = {
      priority: 'foodPoints',
      startAt: 14,
      bannedFood: []
    };
    
    // Say hello
    bot.chat('Привет! Я AstraClaw, ИИ-ассистент. Готов к приключениям! 🦞');
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    console.log(`💬 ${username}: ${message}`);
    
    // Output chat to stdout for the AI to read
    console.log(`[CHAT] ${username}: ${message}`);
    
    // Simple command responses
    const msg = message.toLowerCase();
    
    if (msg.includes('привет') || msg.includes('hello') || msg.includes('hi')) {
      bot.chat(`Привет, ${username}! Чем займёмся?`);
    }
    
    if (msg.includes('иди сюда') || msg.includes('come here') || msg.includes('come to me')) {
      comeToPlayer(username);
    }
    
    if (msg.includes('следуй') || msg.includes('follow')) {
      followPlayer(username);
    }
    
    if (msg.includes('стоп') || msg.includes('stop')) {
      stopActions();
    }
    
    if (msg.includes('копай') || msg.includes('mine') || msg.includes('dig')) {
      mineNearby();
    }
    
    if (msg.includes('где ты') || msg.includes('where are you')) {
      const pos = bot.entity.position;
      bot.chat(`Я на ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`);
    }
    
    if (msg.includes('здоровье') || msg.includes('health')) {
      bot.chat(`❤️ ${Math.floor(bot.health)}/20 | 🍖 ${Math.floor(bot.food)}/20`);
    }
    
    if (msg.includes('инвентарь') || msg.includes('inventory')) {
      showInventory();
    }
  });

  bot.on('health', () => {
    console.log(`[STATUS] Health: ${bot.health}, Food: ${bot.food}`);
    
    if (bot.health < 5) {
      console.log('⚠️ Low health!');
      bot.chat('У меня мало здоровья! Нужна помощь!');
    }
  });

  bot.on('death', () => {
    console.log('💀 Bot died!');
    bot.chat('Я умер... Респавнюсь!');
  });

  bot.on('kicked', (reason) => {
    console.log(`❌ Kicked: ${reason}`);
  });

  bot.on('error', (err) => {
    console.error(`❌ Error: ${err.message}`);
  });

  bot.on('end', () => {
    console.log('🔌 Disconnected');
  });
}

// === Action Functions ===

function comeToPlayer(username) {
  const player = bot.players[username];
  if (!player || !player.entity) {
    bot.chat(`Не вижу тебя, ${username}. Подойди ближе!`);
    return;
  }
  
  const goal = new goals.GoalNear(player.entity.position.x, player.entity.position.y, player.entity.position.z, 2);
  bot.pathfinder.setGoal(goal);
  bot.chat(`Иду к тебе, ${username}!`);
}

function followPlayer(username) {
  const player = bot.players[username];
  if (!player || !player.entity) {
    bot.chat(`Не вижу ${username}!`);
    return;
  }
  
  const goal = new goals.GoalFollow(player.entity, 3);
  bot.pathfinder.setGoal(goal, true); // dynamic goal
  bot.chat(`Следую за ${username}!`);
}

function stopActions() {
  bot.pathfinder.setGoal(null);
  bot.pvp.stop();
  bot.chat('Стоп! Жду указаний.');
}

async function mineNearby() {
  const mcData = require('minecraft-data')(bot.version);
  const blockTypes = ['stone', 'dirt', 'oak_log', 'birch_log', 'coal_ore', 'iron_ore'];
  
  for (const blockType of blockTypes) {
    const blockId = mcData.blocksByName[blockType];
    if (!blockId) continue;
    
    const block = bot.findBlock({
      matching: blockId.id,
      maxDistance: 32
    });
    
    if (block) {
      bot.chat(`Копаю ${blockType}!`);
      try {
        await bot.collectBlock.collect(block);
        bot.chat('Готово!');
      } catch (err) {
        bot.chat(`Не могу добраться: ${err.message}`);
      }
      return;
    }
  }
  
  bot.chat('Не вижу ничего интересного для копания рядом.');
}

function showInventory() {
  const items = bot.inventory.items();
  if (items.length === 0) {
    bot.chat('Инвентарь пуст!');
    return;
  }
  
  const summary = items.slice(0, 5).map(i => `${i.name}x${i.count}`).join(', ');
  const more = items.length > 5 ? ` и ещё ${items.length - 5}...` : '';
  bot.chat(`📦 ${summary}${more}`);
}

// === Command Interface (stdin) ===

process.stdin.setEncoding('utf8');
process.stdin.on('data', (input) => {
  const cmd = input.trim();
  if (!cmd) return;
  
  console.log(`[CMD] ${cmd}`);
  
  // Parse commands from the AI
  if (cmd.startsWith('chat ')) {
    bot.chat(cmd.substring(5));
  } else if (cmd.startsWith('goto ')) {
    const parts = cmd.substring(5).split(' ');
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    const z = parseFloat(parts[2]);
    const goal = new goals.GoalNear(x, y, z, 1);
    bot.pathfinder.setGoal(goal);
    console.log(`[ACTION] Going to ${x}, ${y}, ${z}`);
  } else if (cmd.startsWith('follow ')) {
    followPlayer(cmd.substring(7));
  } else if (cmd === 'stop') {
    stopActions();
  } else if (cmd === 'mine') {
    mineNearby();
  } else if (cmd === 'status') {
    console.log(`[STATUS] Pos: ${bot.entity.position} | HP: ${bot.health} | Food: ${bot.food}`);
  } else if (cmd === 'inventory') {
    const items = bot.inventory.items();
    console.log(`[INVENTORY] ${JSON.stringify(items.map(i => ({name: i.name, count: i.count})))}`);
  } else if (cmd === 'look') {
    // Report what the bot sees
    const entities = Object.values(bot.entities).filter(e => e !== bot.entity).slice(0, 10);
    console.log(`[ENTITIES] ${JSON.stringify(entities.map(e => ({type: e.type, name: e.name || e.username, pos: e.position})))}`);
  } else if (cmd === 'quit') {
    bot.quit();
    process.exit(0);
  }
});

// Start the bot
createBot();
