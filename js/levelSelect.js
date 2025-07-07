// Level Select functionality
class LevelSelectManager {
  constructor() {
    this.easyHighScoreElement = document.getElementById("easyHighScore")
    this.hardHighScoreElement = document.getElementById("hardHighScore")
  }

  // Update level select with current scores
  updateLevelSelect() {
    if (this.easyHighScoreElement) {
      this.easyHighScoreElement.textContent = window.gameState.easyHighScore
    }
    if (this.hardHighScoreElement) {
      this.hardHighScoreElement.textContent = window.gameState.hardHighScore
    }
  }

  // Initialize level select
  initialize() {
    this.updateLevelSelect()
  }
}

// Level selection functions
function showLevelSelect() {
  window.screenManager.showScreen("levelSelect")
  updateLevelScores()
}

async function startGame(level) {
  console.log(`Starting ${level} mode`)
  
  // Limpiar cualquier estado previo del juego
  if (window.gameEngine) {
    window.gameEngine.gameRunning = false
    window.gameEngine.gamePaused = false
  }
  
  // ASEGURAR PRECARGA ANTES DE INICIAR - ELIMINACIÓN COMPLETA DEL LAG
  if (level === 'easy') {
    console.log('⚡ Verificando precarga de imágenes para nivel fácil...')
    
    try {
      // Garantizar que las imágenes estén precargadas
      await window.utils.ensureBuildingPreloaderReady()
      console.log('✅ Precarga verificada - Juego sin lag garantizado')
    } catch (error) {
      console.warn('⚠️ Error en precarga, pero continuando:', error)
    }
  }
  
  // Mostrar la pantalla de juego primero
  window.screenManager.showScreen("game")
  
  // Esperar un poco más para asegurar que la pantalla esté completamente visible
  setTimeout(() => {
    console.log('Initializing game engine for level:', level)
    
    // Asegurar que el canvas esté visible
    const canvas = document.getElementById("gameCanvas")
    const gameArea = document.getElementById("gameArea")
    
    if (canvas) {
      canvas.style.display = "block"
      canvas.style.visibility = "visible"
      console.log('Canvas made visible')
    }
    
    if (gameArea) {
      console.log('GameArea dimensions:', gameArea.getBoundingClientRect())
    }
    
    // Asegurar que los overlays estén ocultos
    const pauseOverlay = document.getElementById("pauseOverlay")
    const gameOverOverlay = document.getElementById("gameOverOverlay")
    if (pauseOverlay) pauseOverlay.classList.add("hidden")
    if (gameOverOverlay) gameOverOverlay.classList.add("hidden")
    
    // LOG FINAL DE VERIFICACIÓN
    if (level === 'easy' && window.buildingPreloader) {
      console.log('🔍 ESTADO FINAL DEL PRELOADER:')
      console.log('  - Cargado:', window.buildingPreloader.isLoaded)
      console.log('  - Imágenes building:', Object.keys(window.buildingPreloader.images.building).length)
      console.log('  - Imágenes suelo:', Object.keys(window.buildingPreloader.images.ground).length)
    }
    
    // Inicializar el motor del juego
    if (window.gameEngine) {
      // Reset any previous state
      window.gameEngine.obstacles = []
      window.gameEngine.particles = []
      window.gameEngine.score = 0
      
      window.gameEngine.startGame(level)
    } else {
      console.error('Game engine not available')
    }
  }, 250) // Aumentado el delay para mejor inicialización
}

function updateLevelScores() {
  const easyScoreElement = document.getElementById("easyHighScore")
  const hardScoreElement = document.getElementById("hardHighScore")

  if (easyScoreElement) {
    easyScoreElement.textContent = window.gameState.easyHighScore
  }
  if (hardScoreElement) {
    hardScoreElement.textContent = window.gameState.hardHighScore
  }
}

// Initialize level select manager
window.levelSelectManager = new LevelSelectManager()
