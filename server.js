const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Inicializar archivo al arrancar
initializeScoresFile();

// Endpoint para obtener leaderboards
app.get('/api/leaderboards', (req, res) => {
  try {
    const scores = readScores();
    
    // Ordenar y limitar a top 100
    const easyTop = scores.easy
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    
    const hardTop = scores.hard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    
    res.json({
      success: true,
      data: {
        easy: easyTop,
        hard: hardTop
      }
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
app.post('/api/submit-score', (req, res) => {
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
    
    res.json({
      success: true,
      data: {
        position: playerPosition,
        top10: top10,
        totalPlayers: scores[level].length,
        isNewRecord: isNewRecord,
        isPersonalBest: isPersonalBest,
        message: isPersonalBest ? 
          (isNewRecord ? '¡Nuevo record world!' : '¡Nuevo personal record!') : 
          '¡Keep trying!'
      }
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
app.get('/api/stats', (req, res) => {
  try {
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
    
    res.json({
      success: true,
      data: {
        easy: easyStats,
        hard: hardStats
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting stats'
    });
  }
});

// Servir archivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
  
  console.log(`\n🔧 Network configuration:`);
  console.log(`   📡 Server IP: ${localIP}`);
  console.log(`   🔌 Port: ${PORT}`);
  console.log(`   🛜 Network: All devices on the same WiFi`);
}); 