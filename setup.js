const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = '.env';

console.log('🎮 Minecraft Agent Setup');
console.log('------------------------');

const questions = [
  { key: 'MC_HOST', q: 'Server IP (default: localhost): ', def: 'localhost' },
  { key: 'MC_PORT', q: 'Server Port (default: 25565): ', def: '25565' },
  { key: 'MC_USERNAME', q: 'Bot Username (default: AstraClaw): ', def: 'AstraClaw' },
  { key: 'MC_VERSION', q: 'Minecraft Version (default: 1.16.5): ', def: '1.16.5' }
];

const config = {};

async function ask(index) {
  if (index >= questions.length) {
    saveConfig();
    return;
  }

  const { key, q, def } = questions[index];
  
  rl.question(q, (answer) => {
    config[key] = answer.trim() || def;
    ask(index + 1);
  });
}

function saveConfig() {
  let content = '';
  for (const [key, value] of Object.entries(config)) {
    content += `${key}=${value}\n`;
  }
  
  fs.writeFileSync(envPath, content);
  console.log('\n✅ Config saved to .env!');
  console.log('Run the bot with: npm start');
  rl.close();
}

ask(0);
