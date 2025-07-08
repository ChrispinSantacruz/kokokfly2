// Script para debuggear los leaderboards
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING LEADERBOARDS...\n');

// Función para leer archivo JSON
function readScores() {
  try {
    const data = fs.readFileSync('scores.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading scores:', error);
    return { easy: [], hard: [] };
  }
}

// Función para formatear mensaje (igual que en server.js)
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

// Ejecutar debug
console.log('📄 Reading scores.json...');
const scores = readScores();

console.log('\n📊 Raw data from scores.json:');
console.log(JSON.stringify(scores, null, 2));

console.log('\n🏆 Formatted leaderboard message:');
const message = formatLeaderboardMessage(scores);
console.log(message);

console.log('\n✅ Debug complete!') 