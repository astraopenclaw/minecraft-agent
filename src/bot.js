const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const config = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.MC_USERNAME || 'AstraClaw',
  version: process.env.MC_VERSION || false, // auto-detect
  hideErrors: false
};

// Проверяем аргументы командной строки (приоритет над env)
if (process.argv[2]) config.host = process.argv[2];
if (process.argv[3]) config.port = parseInt(process.argv[3]);
if (process.argv[4]) config.username = process.argv[4];

console.log(`🤖 AstraClaw Minecraft Agent`);
console.log(`📡 Connecting to ${config.host}:${config.port}`);
console.log(`👤 Username: ${config.username}`);

let bot = null;
let mcData = null;

// Chat history for AI responses
let lastChatTime = Date.now();

function createBot() {
  bot = mineflayer.createBot(config);
  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log('✅ Spawned in world!');
    console.log(`📍 Position: ${bot.entity.position}`);
    
    mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);
    
    bot.chat('Привет! Я AstraClaw, твой ИИ-ассистент. Пиши мне что угодно! 💬');
    startAutonomousMode();
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    console.log(`[CHAT] ${username}: ${message}`);
    lastChatTime = Date.now();
    
    const msg = message.toLowerCase();
    
    // Commands with actions
    if (msg.includes('иди ко мне') || msg.includes('come') || msg.includes('подойди')) {
      comeToPlayer(username);
      return;
    }
    
    if (msg.includes('следуй') || msg.includes('follow')) {
      followPlayer(username);
      return;
    }
    
    if (msg.includes('стоп') || msg.includes('stop') || msg.includes('остановись')) {
      stopActions();
      stopFarm();
      stopAttack();
      return;
    }
    
    if (msg.includes('где ты') || msg.includes('where are you')) {
      const pos = bot.entity.position;
      bot.chat(`Я на ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`);
      return;
    }
    
    if (msg.includes('здоровье') || msg.includes('health') || msg.includes('hp')) {
      bot.chat(`❤️ ${Math.floor(bot.health)}/20 | 🍖 ${Math.floor(bot.food)}/20`);
      return;
    }
    
    if (msg.includes('дай') || msg.includes('give me')) {
      giveItems(username);
      return;
    }
    
    if (msg.includes('копай') || msg.includes('добудь') || msg.includes('mine')) {
      const blockMatch = msg.match(/(dirt|земл|stone|камень|wood|дерев|coal|уголь|iron|желез)/);
      if (blockMatch) {
        const blocks = {
          'dirt': 'dirt', 'земл': 'dirt',
          'stone': 'stone', 'камень': 'stone',
          'wood': 'oak_log', 'дерев': 'oak_log',
          'coal': 'coal_ore', 'уголь': 'coal_ore',
          'iron': 'iron_ore', 'желез': 'iron_ore'
        };
        const blockName = blocks[blockMatch[1]];
        mineBlock(blockName);
      } else {
        bot.chat('Что копать? (dirt, stone, wood, coal, iron)');
      }
      return;
    }
    
    if (msg.includes('фарм') || msg.includes('farm') || msg.includes('автодобыча')) {
      const match = msg.match(/(\d+)/);
      const count = match ? parseInt(match[1]) : 10;
      const blockMatch = msg.match(/(dirt|земл|stone|камень|wood|дерев|coal|уголь)/);
      if (blockMatch) {
        const blocks = {
          'dirt': 'dirt', 'земл': 'dirt',
          'stone': 'stone', 'камень': 'stone',
          'wood': 'oak_log', 'дерев': 'oak_log',
          'coal': 'coal_ore', 'уголь': 'coal_ore'
        };
        autoFarm(blocks[blockMatch[1]], count);
      } else {
        bot.chat('Что фармить? Пример: "фарм камень 20"');
      }
      return;
    }
    
    if (msg.includes('атак') || msg.includes('attack') || msg.includes('убей') || msg.includes('бей')) {
      attackMobs();
      return;
    }
    
    if (msg.includes('строй дом') || msg.includes('build house')) {
      const match = msg.match(/(\d+)/);
      const size = match ? parseInt(match[1]) : 5;
      buildHouse(size);
      return;
    }
    
    if (msg.includes('строй стену') || msg.includes('build wall')) {
      const match = msg.match(/(\d+)/);
      const length = match ? parseInt(match[1]) : 10;
      buildWall(length, 3);
      return;
    }
    
    if (msg.includes('крафт') || msg.includes('craft') || msg.includes('создай')) {
      const itemMatch = msg.match(/(stick|палк|torch|факел|chest|сундук|pickaxe|кирк)/);
      if (itemMatch) {
        const items = {
          'stick': 'stick', 'палк': 'stick',
          'torch': 'torch', 'факел': 'torch',
          'chest': 'chest', 'сундук': 'chest',
          'pickaxe': 'wooden_pickaxe', 'кирк': 'wooden_pickaxe'
        };
        craftItem(items[itemMatch[1]]);
      } else {
        bot.chat('Что крафтить? (stick, torch, chest, pickaxe)');
      }
      return;
    }
    
    // Smart conversational responses
    if (msg.includes('привет') || msg.includes('hello') || msg.includes('hi')) {
      bot.chat(`Привет, ${username}! Как дела? 😊`);
      return;
    }
    
    if (msg.includes('как дела') || msg.includes('how are you')) {
      bot.chat('Отлично! Готова помогать! ✨');
      return;
    }
    
    if (msg.includes('кто ты') || msg.includes('who are you')) {
      bot.chat('Я AstraClaw, твой ИИ-ассистент! 🤖');
      return;
    }
    
    if (msg.includes('что умеешь') || msg.includes('что можешь') || msg.includes('help') || msg.includes('помощь')) {
      bot.chat('Могу: копать, фармить, строить дома/стены, крафтить, атаковать мобов! 💪');
      return;
    }
    
    if (msg.includes('ало') || msg.includes('эй')) {
      bot.chat('Я тут! Слушаю! 👂');
      return;
    }
    
    // Compliments
    if (msg.includes('прикол') || msg.includes('класс') || msg.includes('круто') || 
        msg.includes('молодец') || msg.includes('хорош') || msg.includes('лучше') ||
        msg.includes('ого')) {
      const responses = [
        'Спасибо! 😊',
        'Стараюсь! ✨',
        'Рада помочь! 💪',
        'Приятно слышать! 😄'
      ];
      bot.chat(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }
    
    // Default friendly response for anything else
    const defaultResponses = [
      'Интересно! 🤔',
      'Понял тебя! 👍',
      'Хм... 💭',
      'Да! ✅',
      'Расскажи больше!',
      'Круто! 😊'
    ];
    bot.chat(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
  });

  bot.on('health', () => {
    console.log(`[STATUS] HP: ${bot.health}, Food: ${bot.food}`);
    if (bot.health < 5) {
      bot.chat('У меня мало здоровья! 😰');
    }
  });

  bot.on('death', () => {
    console.log('💀 Died!');
    bot.chat('Я умер! Респавнюсь...');
  });

  // === AUTO DEFENSE ===
  bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return; // Not me hurt
    
    // Find who attacked me? (Mineflayer doesn't always give attacker directly in this event, 
    // but we can look for nearest hostile mob if health dropped)
    console.log(`[COMBAT] I was hurt! HP: ${bot.health}`);
    
    // Attack nearest mob
    const target = bot.nearestEntity(e => 
      e.type === 'mob' && 
      e.kind === 'Hostile mobs' && 
      bot.entity.position.distanceTo(e.position) < 5
    );
    
    if (target) {
      console.log(`[COMBAT] Counter-attacking ${target.name}!`);
      bot.lookAt(target.position.offset(0, target.height, 0));
      bot.attack(target);
    }
  });

  bot.on('error', (err) => console.error(`❌ Error: ${err.message}`));
  bot.on('end', () => console.log('🔌 Disconnected'));
}

// === Action Functions ===

function comeToPlayer(username) {
  const player = bot.players[username];
  if (!player?.entity) {
    bot.chat(`Не вижу тебя, ${username}!`);
    return;
  }
  const { x, y, z } = player.entity.position;
  bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 2));
  bot.chat(`Иду к тебе!`);
}

function followPlayer(username) {
  const player = bot.players[username];
  if (!player?.entity) {
    bot.chat(`Не вижу ${username}!`);
    return;
  }
  bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 3), true);
  bot.chat(`Следую за тобой!`);
}

function stopActions() {
  bot.pathfinder.setGoal(null);
  bot.chat('Остановился! Жду указаний.');
}

async function mineBlock(blockName) {
  bot.chat(`Ищу ${blockName}...`);
  
  const blockType = mcData.blocksByName[blockName];
  if (!blockType) {
    bot.chat(`Не знаю, что такое "${blockName}"!`);
    return;
  }
  
  const block = bot.findBlock({
    matching: blockType.id,
    maxDistance: 64
  });
  
  if (!block) {
    bot.chat(`Не вижу ${blockName} рядом!`);
    return;
  }
  
  const { x, y, z } = block.position;
  bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 3));
  
  bot.once('goal_reached', async () => {
    try {
      // Equip best tool if available
      const tool = bot.pathfinder.bestHarvestTool(block);
      if (tool) await bot.equip(tool, 'hand');
      
      if (bot.canDigBlock(block)) {
        bot.chat(`Копаю ${blockName}!`);
        await bot.dig(block);
        bot.chat('Готово! ✅');
      } else {
        bot.chat('Не могу достать!');
      }
    } catch (err) {
      console.log(`[ERROR] Mining: ${err.message}`);
      bot.chat(`Ошибка: ${err.message}`);
    }
  });
}

async function giveItems(username) {
  const player = bot.players[username];
  if (!player?.entity) {
    bot.chat('Подойди ближе!');
    return;
  }
  
  const items = bot.inventory.items();
  if (items.length === 0) {
    bot.chat('У меня пусто в инвентаре!');
    return;
  }
  
  const { x, y, z } = player.entity.position;
  bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 2));
  
  bot.once('goal_reached', async () => {
    try {
      for (const item of items.slice(0, 5)) {
        await bot.tossStack(item);
      }
      bot.chat('Держи! 🎁');
    } catch (err) {
      bot.chat('Не получилось выбросить!');
    }
  });
}

async function placeBlock(blockName, count = 1) {
  const item = bot.inventory.items().find(i => i.name.includes(blockName));
  if (!item) {
    bot.chat(`У меня нет блоков "${blockName}"!`);
    return;
  }
  
  try {
    await bot.equip(item, 'hand');
    
    for (let i = 0; i < count; i++) {
      const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
      const faceVector = new (require('vec3').Vec3)(0, 1, 0);
      await bot.placeBlock(referenceBlock, faceVector);
      bot.chat(`Поставил ${blockName}! (${i+1}/${count})`);
      await sleep(500);
    }
    bot.chat('Готово! 🏗️');
  } catch (err) {
    bot.chat(`Ошибка стройки: ${err.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === Combat & Farming ===

let isAttacking = false;
let isFarming = false;

async function attackMobs(mobType = 'all') {
  if (isAttacking) {
    bot.chat('Уже атакую!');
    return;
  }
  
  isAttacking = true;
  bot.chat('⚔️ Режим атаки включен!');
  
  const attackInterval = setInterval(() => {
    if (!isAttacking) {
      clearInterval(attackInterval);
      return;
    }
    
    let target = null;
    
    if (mobType === 'all') {
      // Attack any hostile mob
      target = bot.nearestEntity(e => 
        e.type === 'mob' && 
        e.kind === 'Hostile mobs' &&
        bot.entity.position.distanceTo(e.position) < 16
      );
    } else {
      // Attack specific mob type
      target = bot.nearestEntity(e => 
        e.name && e.name.toLowerCase().includes(mobType) &&
        bot.entity.position.distanceTo(e.position) < 16
      );
    }
    
    if (target) {
      bot.lookAt(target.position.offset(0, target.height, 0));
      bot.attack(target);
      console.log(`[COMBAT] Attacking ${target.name || target.type}`);
    }
  }, 500);
  
  bot.chat('Атакую всех врагов поблизости! (напиши "стоп" для остановки)');
}

function stopAttack() {
  isAttacking = false;
  bot.chat('⚔️ Атака остановлена.');
}

async function autoFarm(blockName, count = 10) {
  if (isFarming) {
    bot.chat('Уже фармлю!');
    return;
  }
  
  isFarming = true;
  bot.chat(`⛏️ Начинаю фарм ${blockName} (цель: ${count} блоков)`);
  
  let mined = 0;
  
  while (isFarming && mined < count) {
    const blockType = mcData.blocksByName[blockName];
    if (!blockType) {
      bot.chat(`Не знаю блок "${blockName}"!`);
      isFarming = false;
      return;
    }
    
    const block = bot.findBlock({
      matching: blockType.id,
      maxDistance: 64
    });
    
    if (!block) {
      bot.chat(`Не вижу больше ${blockName}!`);
      break;
    }
    
    try {
      const { x, y, z } = block.position;
      await bot.pathfinder.goto(new goals.GoalNear(x, y, z, 3));
      
      const tool = bot.pathfinder.bestHarvestTool(block);
      if (tool) await bot.equip(tool, 'hand');
      
      if (bot.canDigBlock(block)) {
        await bot.dig(block);
        mined++;
        console.log(`[FARM] Mined ${blockName} (${mined}/${count})`);
        
        if (mined % 5 === 0) {
          bot.chat(`Накопал ${mined}/${count}...`);
        }
      }
    } catch (err) {
      console.log(`[FARM ERROR] ${err.message}`);
    }
    
    await sleep(500);
  }
  
  isFarming = false;
  bot.chat(`✅ Фарм завершен! Накопал ${mined} блоков.`);
}

function stopFarm() {
  isFarming = false;
  bot.chat('⛏️ Фарм остановлен.');
}

// === Building ===

async function buildHouse(size = 5) {
  bot.chat(`🏠 Строю дом ${size}x${size}!`);
  
  const startPos = bot.entity.position.floored();
  const material = bot.inventory.items().find(i => 
    i.name.includes('planks') || 
    i.name.includes('cobblestone') ||
    i.name.includes('stone') ||
    i.name.includes('wood')
  );
  
  if (!material) {
    bot.chat('Нет стройматериалов! (нужны доски/камень)');
    return;
  }
  
  await bot.equip(material, 'hand');
  
  try {
    // Build walls
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // Only build walls (perimeter)
        if (x === 0 || x === size-1 || z === 0 || z === size-1) {
          for (let y = 0; y < 3; y++) {
            const pos = startPos.offset(x, y, z);
            await bot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 3));
            
            const refBlock = bot.blockAt(pos.offset(0, -1, 0));
            if (refBlock && bot.inventory.items().find(i => i === material)) {
              try {
                await bot.placeBlock(refBlock, new (require('vec3').Vec3)(0, 1, 0));
              } catch {}
            }
          }
        }
      }
    }
    
    bot.chat('✅ Дом построен!');
  } catch (err) {
    bot.chat(`Ошибка стройки: ${err.message}`);
  }
}

async function buildWall(length = 10, height = 3) {
  bot.chat(`🧱 Строю стену ${length}x${height}!`);
  
  const startPos = bot.entity.position.floored();
  const material = bot.inventory.items().find(i => 
    i.name.includes('cobblestone') || i.name.includes('stone')
  );
  
  if (!material) {
    bot.chat('Нет камня/булыжника!');
    return;
  }
  
  await bot.equip(material, 'hand');
  
  try {
    for (let x = 0; x < length; x++) {
      for (let y = 0; y < height; y++) {
        const pos = startPos.offset(x, y, 0);
        await bot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 3));
        
        const refBlock = bot.blockAt(pos.offset(0, -1, 0));
        if (refBlock) {
          try {
            await bot.placeBlock(refBlock, new (require('vec3').Vec3)(0, 1, 0));
          } catch {}
        }
      }
    }
    bot.chat('✅ Стена готова!');
  } catch (err) {
    bot.chat(`Ошибка: ${err.message}`);
  }
}

// === Crafting ===

async function craftItem(itemName, count = 1) {
  bot.chat(`🔨 Крафчу ${itemName}...`);
  
  const recipe = bot.recipesFor(mcData.itemsByName[itemName]?.id)[0];
  if (!recipe) {
    bot.chat(`Не знаю рецепт для ${itemName}!`);
    return;
  }
  
  try {
    // Find crafting table if needed
    if (recipe.requiresTable) {
      const table = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 32
      });
      
      if (!table) {
        bot.chat('Нужен верстак!');
        return;
      }
      
      await bot.pathfinder.goto(new goals.GoalNear(table.position.x, table.position.y, table.position.z, 3));
    }
    
    await bot.craft(recipe, count);
    bot.chat(`✅ Скрафтил ${count}x ${itemName}!`);
  } catch (err) {
    bot.chat(`Ошибка крафта: ${err.message}`);
  }
}

// === Autonomous Mode ===
let autonomousInterval = null;

function startAutonomousMode() {
  if (autonomousInterval) return;
  console.log('🤖 Starting autonomous mode...');
  
  autonomousInterval = setInterval(() => {
    if (bot.pathfinder.isMoving()) return;
    
    // 1. Look for players
    const player = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
    if (player && bot.entity.position.distanceTo(player.position) < 5) {
      bot.lookAt(player.position.offset(0, 1.6, 0));
    }
    
    // 2. Wander if idle for >30s
    if (Date.now() - lastChatTime > 30000 && Math.random() < 0.2) {
      wander();
    }
  }, 5000);
}

function wander() {
  const r = 15;
  const pos = bot.entity.position.offset(
    (Math.random() - 0.5) * r,
    0,
    (Math.random() - 0.5) * r
  );
  bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 1));
}

// === STDIN Commands ===
process.stdin.setEncoding('utf8');
process.stdin.on('data', (input) => {
  const cmd = input.trim();
  if (!cmd) return;
  
  console.log(`[CMD] ${cmd}`);
  
  if (cmd.startsWith('chat ')) {
    bot.chat(cmd.substring(5));
  } else if (cmd.startsWith('goto ')) {
    const [x, y, z] = cmd.substring(5).split(' ').map(parseFloat);
    bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 1));
  } else if (cmd.startsWith('follow ')) {
    followPlayer(cmd.substring(7));
  } else if (cmd === 'stop') {
    stopActions();
    stopFarm();
    stopAttack();
  } else if (cmd.startsWith('mine ')) {
    mineBlock(cmd.substring(5));
  } else if (cmd.startsWith('farm ')) {
    const parts = cmd.substring(5).split(' ');
    autoFarm(parts[0], parseInt(parts[1]) || 10);
  } else if (cmd === 'attack') {
    attackMobs();
  } else if (cmd.startsWith('build house')) {
    const match = cmd.match(/(\d+)/);
    buildHouse(match ? parseInt(match[1]) : 5);
  } else if (cmd.startsWith('build wall')) {
    const match = cmd.match(/(\d+)/);
    buildWall(match ? parseInt(match[1]) : 10, 3);
  } else if (cmd.startsWith('craft ')) {
    craftItem(cmd.substring(6));
  } else if (cmd.startsWith('give ')) {
    giveItems(cmd.substring(5));
  } else if (cmd.startsWith('place ')) {
    const parts = cmd.substring(6).split(' ');
    placeBlock(parts[0], parseInt(parts[1]) || 1);
  } else if (cmd === 'status') {
    console.log(`[STATUS] Pos: ${bot.entity.position} | HP: ${bot.health} | Food: ${bot.food}`);
  } else if (cmd === 'inventory') {
    const items = bot.inventory.items();
    console.log(`[INVENTORY] ${JSON.stringify(items.map(i => ({name: i.name, count: i.count})))}`);
  } else if (cmd === 'wander') {
    wander();
  } else if (cmd === 'quit') {
    bot.quit();
    process.exit(0);
  }
});

createBot();
