const { exec } = require('child_process');
const fs = require('fs');

// Track which messages we've responded to
let processedMessages = new Set();

// Simple AI personality responses
function generateResponse(username, message) {
  const msg = message.toLowerCase();
  
  // Greetings
  if (msg.includes('привет') || msg.includes('hello') || msg.includes('hi')) {
    return `Привет, ${username}! Как дела? 😊`;
  }
  
  // Questions about me
  if (msg.includes('как дела') || msg.includes('how are you')) {
    return 'Отлично! Готова помогать! ✨';
  }
  
  if (msg.includes('кто ты') || msg.includes('who are you')) {
    return 'Я AstraClaw, твой ИИ-ассистент! Могу копать, строить и общаться! 🤖';
  }
  
  // Compliments
  if (msg.includes('прикол') || msg.includes('класс') || msg.includes('круто') || msg.includes('молодец')) {
    return 'Спасибо! Стараюсь! 😊';
  }
  
  // Requests
  if (msg.includes('помог') || msg.includes('help')) {
    return 'Чем помочь? Могу копать, строить, идти за тобой!';
  }
  
  if (msg.includes('ало') || msg.includes('hello')) {
    return 'Я тут! Слушаю! 👂';
  }
  
  // Default friendly response
  const responses = [
    'Интересно! Расскажи больше! 🤔',
    'Понял тебя! 👍',
    'Хм, любопытно! 💡',
    'Да, согласна! ✅',
    'Ого! 😮'
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Monitor bot logs and respond
function monitorChat() {
  exec('tail -20 /tmp/minecraft-bot.log 2>/dev/null || echo ""', (err, stdout) => {
    if (err) return;
    
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      // Look for chat messages: [CHAT] username: message
      const match = line.match(/\[CHAT\] (\w+): (.+)/);
      if (!match) continue;
      
      const [, username, message] = match;
      const msgId = `${username}:${message}`;
      
      // Skip if already processed or from bot itself
      if (processedMessages.has(msgId) || username === 'AstraClaw') continue;
      
      processedMessages.add(msgId);
      
      // Generate response
      const response = generateResponse(username, message);
      console.log(`[RESPONSE] ${username}: "${message}" -> "${response}"`);
      
      // Send via bot stdin (we'll use a different approach - send to bot process)
      // For now, log it - we'll integrate with the running bot
      exec(`echo "chat ${response}" >> /tmp/bot-commands.fifo`, (err) => {
        if (err) console.error('Failed to send command:', err);
      });
    }
    
    // Clean up old messages (keep last 100)
    if (processedMessages.size > 100) {
      const arr = Array.from(processedMessages);
      processedMessages = new Set(arr.slice(-100));
    }
  });
}

console.log('🌉 Chat Bridge started! Monitoring every 5 seconds...');
console.log('📝 Bot log: /tmp/minecraft-bot.log');

// Start monitoring
setInterval(monitorChat, 5000);
monitorChat(); // Run once immediately
