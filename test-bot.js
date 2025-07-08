// Simple test script for Telegram Bot
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

// Bot token
const TELEGRAM_TOKEN = '7666259492:AAFPw42DO9NTZS7i0Fl_4TxvYuCDWo3tv6w';

// Create bot instance
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

console.log('🤖 Testing Telegram Bot...');

// Test /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🪳 **Welcome to KOKOK THE ROACH!** 🪳

🎮 **The Ultimate Flying Challenge!**

🏙️ **Sky City** - Navigate through skyscrapers with precision controls!
🌌 **Crypto Space** - Dodge asteroids in the cosmic void!

Commands:
/leaderboards - See the top champions 🏆
/start - Show this welcome message 🎮

Ready to become a legend? Let's fly! 🚀✨
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  console.log(`📱 Welcome message sent to chat ${chatId}`);
});

// Test /leaderboards command
bot.onText(/\/leaderboards/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Mock leaderboard data for testing
  const testMessage = `🏆 **KOKOK THE ROACH - CHAMPIONS LEADERBOARD** 🏆

🏙️ **SKY CITY CHAMPIONS** 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 **TestPlayer1** - 450 pts
🥈 **TestPlayer2** - 380 pts
🥉 **TestPlayer3** - 320 pts
4. **TestPlayer4** - 280 pts

🌌 **CRYPTO SPACE LEGENDS** 🛸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 **SpaceAce** - 200 pts
🥈 **StarLord** - 180 pts
🥉 **AstroNinja** - 150 pts

💎 **CHALLENGE ACCEPTED?** 💎
Play now and claim your spot among the champions!
🎮 Ready to fly with Kokok The Roach? 🪳✨`;
  
  // Intentar diferentes estrategias de envío de imagen (igual que en server.js)
  const optimizedImagePath = path.join(__dirname, 'images', 'bot-optimized.png');
  const originalImagePath = path.join(__dirname, 'images', 'bot.png');
  
  let imageToUse = fs.existsSync(optimizedImagePath) ? optimizedImagePath : originalImagePath;
  
  try {
    // Estrategia 1: Imagen con caption
    await bot.sendPhoto(chatId, imageToUse, {
      caption: testMessage,
      parse_mode: 'Markdown'
    });
    console.log(`📱 Test leaderboards with image (caption) sent to chat ${chatId}`);
  } catch (imageError) {
    console.log(`⚠️  Caption method failed: ${imageError.message}`);
    
    try {
      // Estrategia 2: Imagen y texto por separado
      await bot.sendPhoto(chatId, imageToUse);
      await bot.sendMessage(chatId, testMessage, { parse_mode: 'Markdown' });
      console.log(`📱 Test leaderboards with image (separate) sent to chat ${chatId}`);
    } catch (separateError) {
      console.log(`⚠️  Separate method failed: ${separateError.message}`);
      
      // Estrategia 3: Solo texto con emojis épicos
      const epicMessage = `🏆🪳💰 **TEST - EPIC VICTORY CELEBRATION!** 💰🪳🏆
      
👑 **KOKOK THE ROACH CHAMPIONS** 👑
🎉 *The most legendary pilots in the galaxy!* 🎉

${testMessage}

🚀✨ **JOIN THE LEGEND!** ✨🚀`;
      
      await bot.sendMessage(chatId, epicMessage, { parse_mode: 'Markdown' });
      console.log(`📱 Test leaderboards (epic text-only) sent to chat ${chatId}`);
    }
  }
});

// Handle errors
bot.on('error', (error) => {
  console.error('❌ Telegram bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Telegram polling error:', error);
});

console.log('✅ Telegram Bot test is running!');
console.log('📱 Send /start or /leaderboards to test the bot');
console.log('🛑 Press Ctrl+C to stop the test'); 