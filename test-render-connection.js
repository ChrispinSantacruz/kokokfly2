// Script para probar la conexión con el backend de Render
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

// Función de test
async function testRenderConnection() {
  console.log('🧪 Testing connection to Render backend...');
  console.log('🌐 URL:', `${RENDER_BACKEND_URL}/api/leaderboards`);
  
  try {
    const response = await makeHttpRequest(`${RENDER_BACKEND_URL}/api/leaderboards`);
    
    console.log('\n✅ Connection successful!');
    console.log('📊 Response structure:', Object.keys(response));
    console.log('🔍 Full response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      console.log('\n🏆 Leaderboards data:');
      console.log('🏙️  Sky City champions:', response.data.easy?.length || 0);
      console.log('🌌 Crypto Space legends:', response.data.hard?.length || 0);
      
      // Mostrar top 3 de cada modo
      if (response.data.easy?.length > 0) {
        console.log('\n🏙️  Sky City Top 3:');
        response.data.easy.slice(0, 3).forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.playerName}: ${player.score} pts`);
        });
      }
      
      if (response.data.hard?.length > 0) {
        console.log('\n🌌 Crypto Space Top 3:');
        response.data.hard.slice(0, 3).forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.playerName}: ${player.score} pts`);
        });
      }
    } else {
      console.log('⚠️  Response format unexpected');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Render backend:', error.message);
    console.log('💡 Make sure the backend is running and accessible');
  }
}

// Ejecutar test
testRenderConnection(); 