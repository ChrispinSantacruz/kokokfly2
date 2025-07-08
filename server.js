const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Importar modelo MongoDB
const Score = require('./models');

// Configuración del bot de Telegram
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '7666259492:AAFPw42DO9NTZS7i0Fl_4TxvYuCDWo3tv6w';
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kokokfly';
let isMongoConnected = false;

// Conectar a MongoDB
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Using JSON file fallback');
    isMongoConnected = false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Archivo para almacenar las puntuaciones
const SCORES_FILE = 'scores.json';

// Inicializar archivo de puntuaciones si no existe
function initializeScoresFile() {
  if (!fs.existsSync(SCORES_FILE)) {
    const initialData = {
      easy: [],
      hard: []
    };
    fs.writeFileSync(SCORES_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Leer puntuaciones del archivo
function readScores() {
  try {
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scores:', error);
    return { easy: [], hard: [] };
  }
}

// Escribir puntuaciones al archivo
function writeScores(scores) {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing scores:', error);
    return false;
  }
}

// Validar y limpiar nombre del jugador
function sanitizeName(name) {
  if (!name || typeof name !== 'string') return 'Anonymous';
  return name.trim().substring(0, 20) || 'Anonymous';
}

// Validar puntuación
function validateScore(score) {
  return typeof score === 'number' && score >= 0 && score <= 10000;
}

// Función para obtener IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Buscar IPv4 no interna
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Función para obtener leaderboards para el bot
async function getLeaderboardsForBot() {
  try {
    let leaderboards;
    
    if (isMongoConnected) {
      // Usar MongoDB
      leaderboards = await Score.getLeaderboards();
    } else {
      // Fallback a archivo JSON
      const scores = readScores();
      
      const easyTop = scores.easy
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const hardTop = scores.hard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      leaderboards = {
        easy: easyTop,
        hard: hardTop
      };
    }
    
    return leaderboards;
  } catch (error) {
    console.error('Error getting leaderboards for bot:', error);
    return { easy: [], hard: [] };
  }
}

// Función para formatear mensaje de leaderboards
function formatLeaderboardMessage(leaderboards) {
  const skyCity = leaderboards.easy.slice(0, 10);
  const cryptoSpace = leaderboards.hard.slice(0, 10);
  
  let message = "🏆 **KOKOK THE ROACH - CHAMPIONS LEADERBOARD** 🏆\n\n";
  
  // Sky City Leaderboard
  message += "🏙️ **SKY CITY CHAMPIONS** 🚀\n";
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  
  if (skyCity.length > 0) {
    skyCity.forEach((player, index) => {
      const position = index + 1;
      let trophy = "";
      
      if (position === 1) trophy = "🥇";
      else if (position === 2) trophy = "🥈";
      else if (position === 3) trophy = "🥉";
      else trophy = `${position}.`;
      
      message += `${trophy} **${player.playerName}** - ${player.score} pts\n`;
    });
  } else {
    message += "No champions yet... Be the first! 🎯\n";
  }
  
  message += "\n🌌 **CRYPTO SPACE LEGENDS** 🛸\n";
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  
  if (cryptoSpace.length > 0) {
    cryptoSpace.forEach((player, index) => {
      const position = index + 1;
      let trophy = "";
      
      if (position === 1) trophy = "🥇";
      else if (position === 2) trophy = "🥈";
      else if (position === 3) trophy = "🥉";
      else trophy = `${position}.`;
      
      message += `${trophy} **${player.playerName}** - ${player.score} pts\n`;
    });
  } else {
    message += "No legends yet... Conquer the space! 🚀\n";
  }
  
  message += "\n💎 **CHALLENGE ACCEPTED?** 💎\n";
  message += "Play now and claim your spot among the champions!\n";
  message += "🎮 Ready to fly with Kokok The Roach? 🪳✨";
  
  return message;
}

// Comandos del bot de Telegram
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
});

bot.onText(/\/leaderboards/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Enviar mensaje de "cargando"
    await bot.sendMessage(chatId, "🔄 Loading champions data... Please wait! ⏳");
    
    // Obtener leaderboards
    const leaderboards = await getLeaderboardsForBot();
    
    // Formatear mensaje
    const message = formatLeaderboardMessage(leaderboards);
    
    // Intentar diferentes estrategias de envío de imagen
    const optimizedImagePath = path.join(__dirname, 'images', 'bot-optimized.png');
    const originalImagePath = path.join(__dirname, 'images', 'bot.png');
    
    // Elegir qué imagen usar
    let imageToUse = fs.existsSync(optimizedImagePath) ? optimizedImagePath : originalImagePath;
    
    try {
      // Estrategia 1: Imagen con caption
      await bot.sendPhoto(chatId, imageToUse, {
        caption: message,
        parse_mode: 'Markdown'
      });
      console.log(`📱 Leaderboards with image (caption) sent to Telegram chat ${chatId}`);
    } catch (imageError) {
      console.log(`⚠️  Caption method failed: ${imageError.message}`);
      
      try {
        // Estrategia 2: Imagen y texto por separado
        await bot.sendPhoto(chatId, imageToUse);
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log(`📱 Leaderboards with image (separate) sent to Telegram chat ${chatId}`);
      } catch (separateError) {
        console.log(`⚠️  Separate method failed: ${separateError.message}`);
        
        // Estrategia 3: Solo texto con emojis épicos
        const epicMessage = `🏆🪳💰 **EPIC VICTORY CELEBRATION!** 💰🪳🏆
        
👑 **KOKOK THE ROACH CHAMPIONS** 👑
🎉 *The most legendary pilots in the galaxy!* 🎉

${message}

🚀✨ **JOIN THE LEGEND!** ✨🚀`;
        
        await bot.sendMessage(chatId, epicMessage, { parse_mode: 'Markdown' });
        console.log(`📱 Leaderboards (epic text-only) sent to Telegram chat ${chatId}`);
      }
    }
    
  } catch (error) {
    console.error('Error sending leaderboards to Telegram:', error);
    await bot.sendMessage(chatId, "❌ Sorry, there was an error fetching the leaderboards. Please try again later! 🛠️");
  }
});

// Manejar errores del bot
bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Telegram polling error:', error);
});

// Inicializar archivo al arrancar
initializeScoresFile();

// Endpoint para obtener leaderboards
app.get('/api/leaderboards', async (req, res) => {
  try {
    let leaderboards;
    
    if (isMongoConnected) {
      // Usar MongoDB
      leaderboards = await Score.getLeaderboards();
      console.log('📊 Leaderboards fetched from MongoDB');
    } else {
      // Fallback a archivo JSON
      const scores = readScores();
      
      const easyTop = scores.easy
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
      
      const hardTop = scores.hard
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
      
      leaderboards = {
        easy: easyTop,
        hard: hardTop
      };
      console.log('📁 Leaderboards fetched from JSON file');
    }
    
    res.json({
      success: true,
      data: leaderboards,
      source: isMongoConnected ? 'mongodb' : 'json'
    });
  } catch (error) {
    console.error('Error getting leaderboards:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting leaderboards'
    });
  }
});

// Endpoint para enviar nueva puntuación
app.post('/api/submit-score', async (req, res) => {
  try {
    const { playerName, score, level } = req.body;
    
    // Validaciones
    if (!validateScore(score)) {
      return res.status(400).json({
        error: 'Invalid score'
      });
    }
    
    if (level !== 'easy' && level !== 'hard') {
      return res.status(400).json({
        error: 'Invalid level'
      });
    }
    
    const cleanName = sanitizeName(playerName);
    let result;
    
    if (isMongoConnected) {
      // Usar MongoDB
      result = await Score.submitScore(cleanName, score, level);
      console.log(`💾 Score saved to MongoDB: ${cleanName} - ${score} (${level})`);
    } else {
      // Fallback a archivo JSON
      const scores = readScores();
      
      // Buscar si el jugador ya existe
      const existingPlayerIndex = scores[level].findIndex(entry => 
        entry.playerName === cleanName
      );
      
      let scoreEntry;
      let isNewRecord = false;
      let isPersonalBest = false;
      
      if (existingPlayerIndex !== -1) {
        // El jugador ya existe
        const existingScore = scores[level][existingPlayerIndex].score;
        
        if (score > existingScore) {
          // Nueva puntuación es mejor - actualizar entrada existente
          scoreEntry = {
            playerName: cleanName,
            score: score,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-ES')
          };
          scores[level][existingPlayerIndex] = scoreEntry;
          isPersonalBest = true;
        } else {
          // Puntuación no es mejor - no actualizar, usar entrada existente
          scoreEntry = scores[level][existingPlayerIndex];
        }
      } else {
        // Nuevo jugador - crear nueva entrada
        scoreEntry = {
          playerName: cleanName,
          score: score,
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString('es-ES')
        };
        scores[level].push(scoreEntry);
        isPersonalBest = true;
      }
      
      // Ordenar y mantener solo top 100
      scores[level] = scores[level]
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
      
      // Verificar si es récord general
      isNewRecord = scores[level].length > 0 && scores[level][0].playerName === cleanName && scores[level][0].score === score;
      
      // Guardar
      if (!writeScores(scores)) {
        return res.status(500).json({
          error: 'Error saving score'
        });
      }
      
      // Encontrar posición actual del jugador
      const playerPosition = scores[level].findIndex(entry => 
        entry.playerName === cleanName
      ) + 1;
      
      // Obtener top 10 para mostrar
      const top10 = scores[level].slice(0, 10);
      
      result = {
        position: playerPosition,
        top10: top10,
        totalPlayers: scores[level].length,
        isNewRecord: isNewRecord,
        isPersonalBest: isPersonalBest,
        message: isPersonalBest ? 
          (isNewRecord ? '¡Nuevo record mundial!' : '¡Nuevo record personal!') : 
          '¡Keep trying!'
      };
      console.log(`📁 Score saved to JSON: ${cleanName} - ${score} (${level})`);
    }
    
    res.json({
      success: true,
      data: result,
      source: isMongoConnected ? 'mongodb' : 'json'
    });
    
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting score'
    });
  }
});

// Endpoint para obtener estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    let stats;
    
    if (isMongoConnected) {
      // Usar MongoDB
      stats = await Score.getStats();
      // Redondear average scores
      stats.easy.averageScore = Math.round(stats.easy.averageScore || 0);
      stats.hard.averageScore = Math.round(stats.hard.averageScore || 0);
      console.log('📈 Stats fetched from MongoDB');
    } else {
      // Fallback a archivo JSON
      const scores = readScores();
      
      const easyStats = {
        totalPlayers: scores.easy.length,
        highestScore: scores.easy.length > 0 ? Math.max(...scores.easy.map(s => s.score)) : 0,
        averageScore: scores.easy.length > 0 ? 
          Math.round(scores.easy.reduce((sum, s) => sum + s.score, 0) / scores.easy.length) : 0
      };
      
      const hardStats = {
        totalPlayers: scores.hard.length,
        highestScore: scores.hard.length > 0 ? Math.max(...scores.hard.map(s => s.score)) : 0,
        averageScore: scores.hard.length > 0 ? 
          Math.round(scores.hard.reduce((sum, s) => sum + s.score, 0) / scores.hard.length) : 0
      };
      
      stats = {
        easy: easyStats,
        hard: hardStats
      };
      console.log('📁 Stats fetched from JSON file');
    }
    
    res.json({
      success: true,
      data: stats,
      source: isMongoConnected ? 'mongodb' : 'json'
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting stats'
    });
  }
});

// Endpoint para migrar datos de JSON a MongoDB
app.post('/api/migrate-data', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB not connected'
      });
    }
    
    const scores = readScores();
    let migratedCount = 0;
    
    // Migrar scores de Easy
    for (const score of scores.easy) {
      try {
        const result = await Score.submitScore(score.playerName, score.score, 'easy');
        migratedCount++;
      } catch (error) {
        console.error('Error migrating easy score:', error.message);
      }
    }
    
    // Migrar scores de Hard
    for (const score of scores.hard) {
      try {
        const result = await Score.submitScore(score.playerName, score.score, 'hard');
        migratedCount++;
      } catch (error) {
        console.error('Error migrating hard score:', error.message);
      }
    }
    
    console.log(`📦 Migration completed: ${migratedCount} scores migrated`);
    
    res.json({
      success: true,
      message: `Successfully migrated ${migratedCount} scores to MongoDB`,
      data: {
        migratedCount,
        totalInJSON: scores.easy.length + scores.hard.length
      }
    });
    
  } catch (error) {
    console.error('Error migrating data:', error);
    res.status(500).json({
      success: false,
      error: 'Error migrating data'
    });
  }
});

// Servir archivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Migrar datos automáticamente al inicio
async function autoMigrateData() {
  if (!isMongoConnected) return;
  
  try {
    // Verificar si ya hay datos en MongoDB
    const existingCount = await Score.countDocuments();
    if (existingCount > 0) {
      console.log(`📊 MongoDB already has ${existingCount} scores, skipping auto-migration`);
      return;
    }
    
    // Verificar si hay datos en JSON para migrar
    const jsonScores = readScores();
    const totalJSON = jsonScores.easy.length + jsonScores.hard.length;
    
    if (totalJSON === 0) {
      console.log('📁 No data in JSON file to migrate');
      return;
    }
    
    console.log(`📦 Auto-migrating ${totalJSON} scores from JSON to MongoDB...`);
    
    let migratedCount = 0;
    
    // Migrar scores de Easy
    for (const score of jsonScores.easy) {
      try {
        await Score.submitScore(score.playerName, score.score, 'easy');
        migratedCount++;
      } catch (error) {
        console.error('Error migrating easy score:', error.message);
      }
    }
    
    // Migrar scores de Hard
    for (const score of jsonScores.hard) {
      try {
        await Score.submitScore(score.playerName, score.score, 'hard');
        migratedCount++;
      } catch (error) {
        console.error('Error migrating hard score:', error.message);
      }
    }
    
    console.log(`✅ Auto-migration completed: ${migratedCount}/${totalJSON} scores migrated`);
    
  } catch (error) {
    console.error('❌ Error during auto-migration:', error.message);
  }
}

// Inicializar y arrancar servidor
async function startServer() {
  // Conectar a MongoDB primero
  await connectMongoDB();
  
  // Inicializar archivo JSON como fallback
  initializeScoresFile();
  
  // Migrar datos automáticamente si es necesario
  await autoMigrateData();
  
  // Iniciar servidor
  app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    
    console.log(`🚀 Server running on:`);
    console.log(`   📱 Local:     http://localhost:${PORT}`);
    console.log(`   🌐 Red WiFi:  http://${localIP}:${PORT}`);
    console.log(`\n📊 APIs available:`);
    console.log(`   📈 Leaderboards: http://${localIP}:${PORT}/api/leaderboards`);
    console.log(`   📝 Stats: http://${localIP}:${PORT}/api/stats`);
    
    console.log(`\n🎮 Access from other devices:`);
    console.log(`   ✅ Main computer: http://localhost:${PORT}`);
    console.log(`   ✅ Other computers:   http://${localIP}:${PORT}`);
    console.log(`   ✅ Mobile devices:      http://${localIP}:${PORT}`);
    console.log(`   ✅ Tablets:      http://${localIP}:${PORT}`);
    
    console.log(`\n🔧 Configuration:`);
    console.log(`   📡 Server IP: ${localIP}`);
    console.log(`   🔌 Port: ${PORT}`);
    console.log(`   🛜 Network: All devices on the same WiFi`);
    console.log(`   💾 Database: ${isMongoConnected ? 'MongoDB ✅' : 'JSON fallback ⚠️'}`);
    console.log(`   🔗 MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`   🤖 Telegram Bot: ${TELEGRAM_TOKEN ? '✅ Active' : '❌ Not configured'}`);
    
    if (!isMongoConnected) {
      console.log(`\n⚠️  MongoDB not connected - using JSON file fallback`);
      console.log(`   💡 To use persistent storage, configure MONGODB_URI environment variable`);
    }
    
    // Inicializar bot de Telegram
    if (TELEGRAM_TOKEN) {
      console.log(`\n🤖 Telegram Bot Features:`);
      console.log(`   📱 Commands: /start, /leaderboards`);
      console.log(`   🏆 Real-time leaderboards via Telegram`);
      console.log(`   🎮 Game stats and champions data`);
      console.log(`   💬 Bot is ready to receive commands!`);
    }
  });
}

// Iniciar servidor
startServer().catch(console.error); 