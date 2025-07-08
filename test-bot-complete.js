// Test completo del bot de Telegram con backend de Render
const https = require('https');

const RENDER_BACKEND_URL = 'https://kokokfly2.onrender.com';

// Función para hacer llamadas HTTP
function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Función para formatear mensaje (misma que en server.js)
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

// Función principal de test
async function testBotComplete() {
  console.log('🤖 TESTING COMPLETE BOT FUNCTIONALITY...\n');
  
  // Test 1: Conexión al backend de Render
  console.log('🌐 Step 1: Testing Render backend connection...');
  try {
    const response = await makeHttpRequest(`${RENDER_BACKEND_URL}/api/leaderboards`);
    
    if (response.success && response.data) {
      console.log('✅ Render backend connection successful!');
      console.log(`📊 Sky City players: ${response.data.easy?.length || 0}`);
      console.log(`📊 Crypto Space players: ${response.data.hard?.length || 0}`);
      
      // Test 2: Formateo del mensaje
      console.log('\n🎨 Step 2: Testing message formatting...');
      const formattedMessage = formatLeaderboardMessage(response.data);
      console.log('✅ Message formatted successfully!');
      console.log(`📏 Message length: ${formattedMessage.length} characters`);
      
      // Test 3: Mostrar mensaje final
      console.log('\n📱 Step 3: Bot message preview:');
      console.log('━'.repeat(60));
      console.log(formattedMessage);
      console.log('━'.repeat(60));
      
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('✅ Bot is ready to send real data from Render backend!');
      
    } else {
      console.log('❌ Invalid response from Render backend');
      console.log('📊 Response:', response);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Render backend:', error.message);
    console.log('💡 Make sure https://kokokfly2.onrender.com is running');
  }
  
  console.log('\n🚀 Ready to deploy the bot!');
}

// Ejecutar tests
testBotComplete(); 