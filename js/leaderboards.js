// Leaderboards Manager
class LeaderboardsManager {
  constructor() {
    // Detectar automáticamente la URL del servidor
    this.baseURL = this.getServerURL();
    this.currentLeaderboards = null;
    this.currentStats = null;
    
    console.log('🌐 Leaderboards connecting to:', this.baseURL);
  }

  // Detectar URL del servidor automáticamente
  getServerURL() {
    // Si estamos en localhost, usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    // Si estamos en Vercel u otro hosting (production), usar Render backend
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('netlify.app') ||
        window.location.hostname.includes('github.io') ||
        window.location.protocol === 'https:') {
      // 🚀 URL de tu backend en Render
      return 'https://kokokfly2.onrender.com/api';
    }
    
    // Si estamos en red local, usar la IP del servidor
    const protocol = window.location.protocol; // http: o https:
    const hostname = window.location.hostname; // IP del servidor
    const port = window.location.port || 3000; // Puerto actual o 3000 por defecto
    
    return `${protocol}//${hostname}:${port}/api`;
  }

  // Verificar conexión con el servidor
  async testConnection() {
    try {
      console.log('🔍 Testing connection to:', this.baseURL);
      const response = await fetch(`${this.baseURL}/stats`);
      const success = response.ok;
      
      console.log(success ? '✅ Connection successful' : '❌ Connection failed');
      return success;
    } catch (error) {
      console.log('❌ Connection error:', error.message);
      return false;
    }
  }

  // Enviar puntuación al servidor
  async submitScore(playerName, score, level) {
    try {
      console.log('📊 Sending score:', { playerName, score, level });
      console.log('🌐 Server URL:', this.baseURL);
      
      const response = await fetch(`${this.baseURL}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName,
          score: score,
          level: level
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error sending score');
      }

      console.log('✅ Score sent successfully:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error submitting score:', error);
      console.log('🔧 Network diagnosis:');
      console.log('   - Attempted URL:', `${this.baseURL}/submit-score`);
      console.log('   - Current hostname:', window.location.hostname);
      console.log('   - Current port:', window.location.port);
      console.log('   - Current protocol:', window.location.protocol);
      
      // Si no hay conexión, mostrar posición local
      return {
        success: false,
        error: error.message,
        data: {
          position: 1,
          top10: [{
            playerName: playerName,
            score: score,
            date: new Date().toLocaleDateString('es-ES')
          }],
          totalPlayers: 1,
          isNewRecord: true
        }
      };
    }
  }

  // Obtener leaderboards del servidor
  async fetchLeaderboards() {
    try {
      const response = await fetch(`${this.baseURL}/leaderboards`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching leaderboards');
      }

      this.currentLeaderboards = data.data;
      return data.data;
      
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      
      // Fallback con datos vacíos
      return {
        easy: [],
        hard: []
      };
    }
  }

  // Obtener estadísticas del servidor
  async fetchStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching stats');
      }

      this.currentStats = data.data;
      return data.data;
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Fallback con datos vacíos
      return {
        easy: { totalPlayers: 0, highestScore: 0, averageScore: 0 },
        hard: { totalPlayers: 0, highestScore: 0, averageScore: 0 }
      };
    }
  }

  // Cargar y mostrar leaderboards en la pantalla
  async loadLeaderboardsScreen() {
    try {
      // Mostrar loading
      this.showLeaderboardLoading();
      
      // Probar conexión primero
      console.log('🔧 Testing connection to server...');
      const connected = await this.testConnection();
      
      if (!connected) {
        console.warn('⚠️ Unable to connect to leaderboards server');
        this.showConnectionError();
        return;
      }
      
      // Cargar datos
      const [leaderboards, stats] = await Promise.all([
        this.fetchLeaderboards(),
        this.fetchStats()
      ]);

      // Mostrar estadísticas
      this.updateStats(stats);
      
      // Mostrar leaderboards
      this.updateLeaderboardTables(leaderboards);
      
      console.log('✅ Leaderboards loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading leaderboards screen:', error);
      this.showLeaderboardError();
    }
  }

  // Mostrar estado de carga
  showLeaderboardLoading() {
    const easyList = document.getElementById('easyLeaderboardList');
    const hardList = document.getElementById('hardLeaderboardList');
    
    if (easyList) {
      easyList.innerHTML = '<div class="loading-message">Loading leaderboard Easy...</div>';
    }
    if (hardList) {
      hardList.innerHTML = '<div class="loading-message">Loading leaderboard Hard...</div>';
    }
  }

  // Mostrar error
  showLeaderboardError() {
    const easyList = document.getElementById('easyLeaderboardList');
    const hardList = document.getElementById('hardLeaderboardList');
    
    if (easyList) {
      easyList.innerHTML = '<div class="error-message">Error loading leaderboard Easy</div>';
    }
    if (hardList) {
      hardList.innerHTML = '<div class="error-message">Error loading leaderboard Hard</div>';
    }
  }

  // Mostrar error de conexión específico
  showConnectionError() {
    const easyList = document.getElementById('easyLeaderboardList');
    const hardList = document.getElementById('hardLeaderboardList');
    
    const errorMessage = `
      <div class="error-message">
        <h4>❌ Unable to connect to server</h4>
        <p><strong>Attempted URL:</strong> ${this.baseURL}</p>
        <p><strong>Current device:</strong> ${window.location.hostname}</p>
        <div style="margin-top: 1rem; text-align: left;">
          <p><strong>Possible solutions:</strong></p>
          <ul style="text-align: left; margin-left: 1rem;">
            <li>Verify that the server is running on ${this.baseURL.replace('/api', '')}</li>
            <li>Ensure both devices are on the same WiFi</li>
            <li>Check the server firewall</li>
            <li>Test opening ${this.baseURL.replace('/api', '')} in the browser</li>
          </ul>
        </div>
      </div>
    `;
    
    if (easyList) {
      easyList.innerHTML = errorMessage;
    }
    if (hardList) {
      hardList.innerHTML = errorMessage;
    }
  }

  // Actualizar estadísticas
  updateStats(stats) {
    // Easy Mode Stats
    document.getElementById('easyTotalPlayers').textContent = stats.easy.totalPlayers;
    document.getElementById('easyHighestScore').textContent = stats.easy.highestScore;
    document.getElementById('easyAverageScore').textContent = stats.easy.averageScore;
    
    // Hard Mode Stats
    document.getElementById('hardTotalPlayers').textContent = stats.hard.totalPlayers;
    document.getElementById('hardHighestScore').textContent = stats.hard.highestScore;
    document.getElementById('hardAverageScore').textContent = stats.hard.averageScore;
  }

  // Actualizar tablas de leaderboards
  updateLeaderboardTables(leaderboards) {
    this.updateLeaderboardTable('easyLeaderboardList', leaderboards.easy, 50);
    this.updateLeaderboardTable('hardLeaderboardList', leaderboards.hard, 50);
  }

  // Actualizar tabla individual
  updateLeaderboardTable(containerId, scores, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (scores.length === 0) {
      container.innerHTML = '<div class="empty-message">No scores registered</div>';
      return;
    }

    // Tomar solo el límite especificado
    const limitedScores = scores.slice(0, limit);
    
    const html = limitedScores.map((score, index) => {
      const position = index + 1;
      const medal = this.getMedal(position);
      
      return `
        <div class="leaderboard-row">
          <span class="pos-col">${medal}${position}</span>
          <span class="name-col">${this.escapeHtml(score.playerName)}</span>
          <span class="score-col">${score.score}</span>
          <span class="date-col">${score.date}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // Obtener medalla para las primeras 3 posiciones
  getMedal(position) {
    switch (position) {
      case 1: return '🥇 ';
      case 2: return '🥈 ';
      case 3: return '🥉 ';
      default: return '';
    }
  }

  // Escapar HTML para seguridad
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Mostrar posición en game over
  showGameOverPosition(data) {
    const positionContainer = document.getElementById('leaderboardPosition');
    const positionTitle = document.getElementById('positionTitle');
    const playerPosition = document.getElementById('playerPosition');
    const totalPlayers = document.getElementById('totalPlayers');
    const miniLeaderboardList = document.getElementById('miniLeaderboardList');

    if (!positionContainer || !data) return;

    // Mostrar el contenedor
    positionContainer.classList.remove('hidden');

    // Actualizar título según el resultado
    if (data.isNewRecord) {
      positionTitle.textContent = '¡New World Record! 🏆';
      positionTitle.style.color = '#ffd700';
    } else if (data.isPersonalBest) {
      positionTitle.textContent = '¡New Personal Record! 🎉';
      positionTitle.style.color = '#ff6b6b';
    } else if (data.position <= 3) {
      positionTitle.textContent = '¡Top 3! 🏅';
      positionTitle.style.color = '#ffa500';
    } else if (data.position <= 10) {
      positionTitle.textContent = '¡Top 10! 🎯';
      positionTitle.style.color = '#00bfff';
    } else {
      positionTitle.textContent = 'Score Registered! 📊';
      positionTitle.style.color = '#22c55e';
    }

    // Mostrar mensaje del servidor si existe
    if (data.message) {
      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-top: 5px;
        font-style: italic;
      `;
      messageElement.textContent = data.message;
      
      // Insertar después del título
      const titleContainer = positionTitle.parentNode;
      const existingMessage = titleContainer.querySelector('.server-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      messageElement.classList.add('server-message');
      titleContainer.insertBefore(messageElement, positionTitle.nextSibling);
    }

    // Actualizar posición
    playerPosition.textContent = `#${data.position}`;
    totalPlayers.textContent = data.totalPlayers;

    // Mostrar top 10
    this.updateMiniLeaderboard(data.top10, data.position);
  }

  // Actualizar mini leaderboard en game over
  updateMiniLeaderboard(top10, playerPosition) {
    const container = document.getElementById('miniLeaderboardList');
    if (!container || !top10) return;

    const html = top10.map((score, index) => {
      const position = index + 1;
      const isPlayerRow = position === playerPosition;
      const medal = this.getMedal(position);
      
      return `
        <div class="mini-leaderboard-row ${isPlayerRow ? 'player-row' : ''}">
          <span class="mini-pos">${medal}${position}</span>
          <span class="mini-name">${this.escapeHtml(score.playerName)}</span>
          <span class="mini-score">${score.score}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // Función para mostrar notificación de error
  showErrorNotification(message) {
    console.warn('Leaderboard error:', message);
    // Podrías implementar una notificación visual aquí
  }

  // Diagnóstico completo de red (para debugging)
  async diagnoseNetwork() {
    console.log('🔍 === COMPLETE NETWORK DIAGNOSIS ===');
    console.log('📍 Client information:');
    console.log('   - Current URL:', window.location.href);
    console.log('   - Hostname:', window.location.hostname);
    console.log('   - Port:', window.location.port || 'default');
    console.log('   - Protocol:', window.location.protocol);
    
    console.log('🔧 Leaderboards Information:');
    console.log('   - Base URL:', this.baseURL);
    
    console.log('🔧 Testing endpoints...');
    
    // Probar cada endpoint
    const endpoints = [
      { name: 'Stats', url: `${this.baseURL}/stats` },
      { name: 'Leaderboards', url: `${this.baseURL}/leaderboards` }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`);
        const response = await fetch(endpoint.url);
        console.log(`   ✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      }
    }
    
    console.log('💡 If there are errors, check:');
    console.log('   1. The server is running on the main computer');
    console.log('   2. Both devices are on the same WiFi');
    console.log('   3. The server firewall allows port 3000');
    console.log('   4. The server IP is correct');
  }
}

// Instancia global del manager de leaderboards
window.leaderboardsManager = new LeaderboardsManager();

// Función para mostrar la pantalla de leaderboards
function showLeaderboards() {
  // 🔄 ORIENTACIÓN VERTICAL PARA NAVEGACIÓN
  if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
    window.gameEngine.forceVerticalOrientation()
  }
  
  if (window.screenManager) {
    window.screenManager.showScreen('leaderboards');
    window.leaderboardsManager.loadLeaderboardsScreen();
  }
}

// Función para enviar puntuación (se llama desde gameEngine)
async function submitGameScore(playerName, score, level) {
  return await window.leaderboardsManager.submitScore(playerName, score, level);
}

// Función para mostrar posición en game over (se llama desde gameEngine)
function showLeaderboardPosition(data) {
  window.leaderboardsManager.showGameOverPosition(data);
}

// Funciones globales para debugging (usar en consola)
window.debugLeaderboards = {
  // Probar conexión
  async testConnection() {
    return await window.leaderboardsManager.testConnection();
  },
  
  // Diagnóstico completo
  async diagnose() {
    return await window.leaderboardsManager.diagnoseNetwork();
  },
  
  // Ver configuración actual
  info() {
    console.log('🔧 Leaderboards Information:');
    console.log('   - Base URL:', window.leaderboardsManager.baseURL);
    console.log('   - Current hostname:', window.location.hostname);
    console.log('   - Current port:', window.location.port || 'default');
    console.log('\n💡 Available commands:');
    console.log('   - debugLeaderboards.testConnection() - Test connection');
    console.log('   - debugLeaderboards.diagnose() - Complete diagnosis');
    console.log('   - debugLeaderboards.info() - View this information');
  }
};

// Mostrar info de debugging al cargar
console.log('🎮 Leaderboards system loaded');
console.log('🔧 For debugging, use: debugLeaderboards.info()'); 