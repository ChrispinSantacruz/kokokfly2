// Main application controller - FIXED VERSION
class ScreenManager {
  constructor() {
    this.currentScreen = "login"
    this.screens = {
      login: document.getElementById("loginScreen"),
      menu: document.getElementById("menuScreen"),
      levelSelect: document.getElementById("levelSelectScreen"),
      customization: document.getElementById("customizationScreen"),
      instructions: document.getElementById("instructionsScreen"),
      leaderboards: document.getElementById("leaderboardsScreen"),
      game: document.getElementById("gameScreen"),
    }

    this.managers = {
      login: window.loginManager,
      menu: window.menuManager,
      levelSelect: window.levelSelectManager,
      customization: window.customizationManager,
      instructions: window.instructionsManager,
      leaderboards: window.leaderboardsManager,
    }
  }

  showScreen(screenName) {
    // Hide current screen
    if (this.screens[this.currentScreen]) {
      this.screens[this.currentScreen].classList.add("hidden")
    }

    // Show new screen
    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove("hidden")
      this.currentScreen = screenName

      // Initialize screen if it has a manager
      if (this.managers[screenName] && this.managers[screenName].initialize) {
        this.managers[screenName].initialize()
      }

      // Special handling for certain screens
      this.handleScreenSpecifics(screenName)
    }
  }

  handleScreenSpecifics(screenName) {
    switch (screenName) {
      case "login":
        // Focus on name input
        setTimeout(() => {
          const nameInput = document.getElementById("playerName")
          if (nameInput) nameInput.focus()
        }, 100)
        break

      case "menu":
        // Update menu data
        if (window.menuManager) {
          window.menuManager.updateMenu()
        }
        break

      case "game":
        // Game screen is handled by gameEngine
        break
    }
  }

  // Get current screen
  getCurrentScreen() {
    return this.currentScreen
  }
}

// Application initialization
class App {
  constructor() {
    this.initialize()
  }

  initialize() {
    // Initialize screen manager
    window.screenManager = new ScreenManager()

    // FORZAR inicialización inmediata del building preloader
    if (!window.buildingPreloader) {
      console.log('🔧 Forzando inicialización del building preloader...')
      // Importar desde gameObjects.js si no está disponible
      if (typeof BuildingImagePreloader !== 'undefined') {
        window.buildingPreloader = new BuildingImagePreloader()
      }
    }

    // Preload images before showing any screen
    this.preloadImages().then(() => {
      // Check if user already has a name
      if (window.gameState.playerName) {
        window.screenManager.showScreen("menu")
      } else {
        window.screenManager.showScreen("login")
      }
    }).catch((error) => {
      console.warn('Some images failed to load:', error)
      // Continue with the game anyway
      if (window.gameState.playerName) {
        window.screenManager.showScreen("menu")
      } else {
        window.screenManager.showScreen("login")
      }
    })

    // Add global error handling
    window.addEventListener("error", (e) => {
      console.error("Game error:", e.error)
    })

    // Add visibility change handling (pause game when tab is hidden)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && window.gameEngine && window.gameEngine.gameRunning && !window.gameEngine.gamePaused) {
        window.gameEngine.togglePause()
      }
    })

    // Add resize handling
    window.addEventListener("resize", () => {
      this.handleResize()
    })

    // Prevent context menu on canvas
    const gameCanvas = document.getElementById("gameCanvas")
    if (gameCanvas) {
      gameCanvas.addEventListener("contextmenu", (e) => {
        e.preventDefault()
      })
    }

    // Prevent default touch behaviors
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.target.tagName === "CANVAS") {
          e.preventDefault()
        }
      },
      { passive: false },
    )

    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.target.tagName === "CANVAS") {
          e.preventDefault()
        }
      },
      { passive: false },
    )
  }

  async preloadImages() {
    const imagesToPreload = [
      'images/kokok-rocket.png',
      'images/kokok-car.png',
      'images/kokok-ufo.png',
      'images/bgame.png',
      'images/space-background.jpg',
      'images/gameover.png',
      'images/choque.png',
      'images/logo.png'
    ]

    const loadPromises = imagesToPreload.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(src)
        img.onerror = () => {
          console.warn(`Failed to preload image: ${src}`)
          resolve(src) // Resolve anyway to not block the app
        }
        img.src = src
      })
    })

    try {
      // Precargar imágenes básicas
      await Promise.all(loadPromises)
      console.log('✓ Imágenes básicas precargadas exitosamente')
      
      // Precargar imágenes building para eliminar lag - MEJORADO
      if (window.buildingPreloader) {
        await window.buildingPreloader.preloadAllImages()
        console.log('✓ Sistema de precarga completo - Sin lag en obstáculos')
        
        // Verificación adicional
        if (window.buildingPreloader.isLoaded) {
          console.log('✅ Building preloader verificado: LISTO')
        } else {
          console.warn('⚠️ Building preloader no completó la carga correctamente')
        }
      } else {
        console.error('❌ Building preloader no está disponible!')
        // Intentar crear uno de emergencia
        try {
          window.buildingPreloader = new window.BuildingImagePreloader()
          await window.buildingPreloader.preloadAllImages()
          console.log('🔧 Building preloader creado de emergencia')
        } catch (error) {
          console.error('❌ No se pudo crear building preloader de emergencia:', error)
        }
      }
      
    } catch (error) {
      console.warn('Error preloading images:', error)
    }
  }

  handleResize() {
    // Responsive canvas handling
    if (window.gameEngine && window.gameEngine.canvas) {
      window.gameEngine.updateCanvasSize()
    }
  }
}

// Utility functions
window.utils = {
  // Format score with commas
  formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  },

  // Get random element from array
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
  },

  // Check building preloader status
  checkBuildingPreloader() {
    if (window.buildingPreloader) {
      console.log('Building preloader status:', window.buildingPreloader.isLoaded ? 'Ready' : 'Loading...')
      return window.buildingPreloader.isLoaded
    }
    console.warn('Building preloader not available')
    return false
  },

  // NUEVA FUNCIÓN: Asegurar que el building preloader esté listo
  async ensureBuildingPreloaderReady() {
    if (!window.buildingPreloader) {
      console.log('🔧 Building preloader no existe, creando...');
      window.buildingPreloader = new window.BuildingImagePreloader();
    }
    
    if (!window.buildingPreloader.isLoaded) {
      console.log('⚡ Asegurando precarga antes de iniciar juego...');
      await window.buildingPreloader.preloadAllImages();
      console.log('✅ Precarga garantizada - Juego sin lag');
    }
    
    return window.buildingPreloader.isLoaded;
  },

  // Clamp value between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  },

  // Linear interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor
  },

  // Check if device is mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Show toast notification (could be implemented)
  showToast(message, type = "info") {
    console.log(`Toast (${type}): ${message}`)
    // Could implement actual toast UI here
  },
}

// Debug functions (for development)
window.debug = {
  // Reset all game data
  resetGameData() {
    window.gameState.reset()
    location.reload()
  },

  // Unlock all vehicles
  unlockAll() {
    window.gameState.unlockedShips = [0, 1, 2, 3, 4]
    window.gameState.unlockedUfos = [0, 1, 2, 3, 4]
    window.gameState.saveToStorage()
    if (window.screenManager.getCurrentScreen() === "customization") {
      window.customizationManager.initialize()
    }
    console.log("All vehicles unlocked!")
  },

  // Set high scores
  setHighScores(easy, hard) {
    window.gameState.easyHighScore = easy || 100
    window.gameState.hardHighScore = hard || 100
    window.gameState.saveToStorage()
    if (window.screenManager.getCurrentScreen() === "menu") {
      window.menuManager.updateMenu()
    }
    console.log(`High scores set: Easy ${easy}, Hard ${hard}`)
  },

  // Get current game state
  getGameState() {
    return window.gameState
  },
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App()
})

// Remove service worker registration to avoid 404 errors
// Service Worker registration removed to prevent 404 errors
