// Game Engine - FIXED VERSION
class GameEngine {
  constructor() {
    this.canvas = document.getElementById("gameCanvas")
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null
    this.gameRunning = false
    this.gamePaused = false
    this.gameStarted = false
    this.score = 0
    this.gameSpeed = 3
    this.baseGameSpeed = 3
    this.maxGameSpeed = 12
    this.level = "easy"
    this.lastObstacleTime = 0
    this.obstacles = []
    this.particles = []
    this.player = null
    this.lastGapPosition = "middle"
    this.gameStartTime = 0
    this.previousScore = 0

    // Explosion effect variables
    this.explosionEffect = null
    this.explosionImage = null
    
    // Precargar imagen de explosión
    this.loadExplosionImage()

    // Game constants - IMPROVED PHYSICS
    this.GRAVITY = 0.4
    this.JUMP_FORCE_EASY = -10 // Stronger jump for easy mode
    this.JUMP_FORCE_HARD = -12 // Much stronger jump for hard mode (UFO)
    this.RISE_FORCE = -0.5
    this.PLAYER_SIZE = 60 // Base player size - will adjust dynamically

    // Dynamic canvas size
    this.GAME_WIDTH = 800
    this.GAME_HEIGHT = 600

    if (this.canvas) {
      this.setupCanvas()
      this.initializeControls()
      this.setupOrientationControl()
    }
  }

  loadExplosionImage() {
    this.explosionImage = new Image()
    this.explosionImage.onload = () => {
      console.log('✅ Imagen de explosión cargada: choque1.png')
    }
    this.explosionImage.onerror = () => {
      console.error('❌ Error cargando imagen de explosión: choque1.png')
    }
    this.explosionImage.src = 'images/choque1.png'
  }

  showExplosionAtPlayer() {
    if (this.player && this.explosionImage) {
      this.explosionEffect = {
        x: this.player.x + this.PLAYER_SIZE / 2, // Centro del jugador
        y: this.player.y + this.PLAYER_SIZE / 2, // Centro del jugador
        startTime: Date.now(),
        duration: 1000, // Duración de 1 segundo
        size: this.PLAYER_SIZE * 2, // Tamaño de la explosión
        opacity: 1
      }
      console.log('💥 Explosión mostrada en posición del jugador:', this.explosionEffect.x, this.explosionEffect.y)
    }
  }

  setupCanvas() {
    // Make canvas fullscreen
    this.updateCanvasSize()
    window.addEventListener("resize", () => this.updateCanvasSize())
  }

  updateCanvasSize() {
    const gameArea = document.getElementById("gameArea")
    if (gameArea && this.canvas) {
      const rect = gameArea.getBoundingClientRect()
      
      // Detect if mobile
      const isMobile = window.innerWidth <= 767
      const isExtraSmall = window.innerWidth <= 479
      const isLandscape = window.innerHeight <= 600 && window.innerWidth > window.innerHeight
      
      // Adaptive dimensions according to device - MORE PANORAMIC
              if (isExtraSmall) {
          this.GAME_WIDTH = Math.max(rect.width, 350)  // Wider
          this.GAME_HEIGHT = Math.max(rect.height, 180) // Less tall
        } else if (isMobile) {
          this.GAME_WIDTH = Math.max(rect.width, 400)  // Wider 
          this.GAME_HEIGHT = Math.max(rect.height, 200) // Less tall
        } else if (isLandscape) {
          this.GAME_WIDTH = Math.max(rect.width, 600)  // Wider
          this.GAME_HEIGHT = Math.max(rect.height, 400) // More height for buildings
        } else {
          // Desktop - panoramic dimensions
          this.GAME_WIDTH = Math.max(rect.width, 1000) // Wider
          this.GAME_HEIGHT = Math.max(rect.height, 600) // More height for buildings
        }

      // Validate calculated dimensions
      if (!isFinite(this.GAME_WIDTH) || !isFinite(this.GAME_HEIGHT) || 
          this.GAME_WIDTH <= 0 || this.GAME_HEIGHT <= 0) {
        console.error('Invalid calculated dimensions:', {
          GAME_WIDTH: this.GAME_WIDTH,
          GAME_HEIGHT: this.GAME_HEIGHT,
          rectWidth: rect.width,
          rectHeight: rect.height
        })
        
        // Fallback responsive - panoramic
        if (isExtraSmall) {
          this.GAME_WIDTH = 350
          this.GAME_HEIGHT = 250 // More height for buildings
        } else if (isMobile) {
          this.GAME_WIDTH = 400
          this.GAME_HEIGHT = 300 // More height for buildings
        } else {
          this.GAME_WIDTH = 1000
          this.GAME_HEIGHT = 600 // More height for buildings
        }
      }

      // Calculate player size proportionally
      this.updatePlayerSize()

      console.log('Canvas dimensions - Width:', this.GAME_WIDTH, 'Height:', this.GAME_HEIGHT, 'Mobile:', isMobile)
      console.log('Player size:', this.PLAYER_SIZE)
      console.log('GameArea rect:', rect)

      this.canvas.width = this.GAME_WIDTH
      this.canvas.height = this.GAME_HEIGHT
      this.canvas.style.width = "100%"
      this.canvas.style.height = "100%"
      
      // Ensure canvas is visible
      this.canvas.style.display = "block"
      this.canvas.style.background = this.level === "easy" 
        ? "linear-gradient(to bottom, #87ceeb, #98fb98)" 
        : "linear-gradient(to bottom, #0a0a0a, #1a1a2e, #16213e)"
    } else {
      console.error('GameArea or canvas not found:', { gameArea, canvas: this.canvas })
    }
  }

  updatePlayerSize() {
    // Calculate player size based on canvas dimensions
    const baseSize = 60
    // Use average between width and height for better panoramic scaling
    const scaleFactor = Math.min(this.GAME_WIDTH / 1000, this.GAME_HEIGHT / 500) // Based on reference dimensions
    this.PLAYER_SIZE = Math.max(25, Math.min(120, baseSize * scaleFactor))
  }

  setupOrientationControl() {
    // Detect if mobile and if API is available
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    this.orientationSupported = screen.orientation && screen.orientation.lock
    
    if (this.isMobile && this.orientationSupported) {
      console.log('🔄 Orientation control enabled for mobile device')
    } else {
      console.log('📱 Orientation control not available:', { isMobile: this.isMobile, orientationSupported: this.orientationSupported })
    }
  }

  async forceHorizontalOrientation() {
    if (!this.isMobile || !this.orientationSupported) return
    
    try {
      await screen.orientation.lock('landscape')
      console.log('🔄 Orientation locked to landscape')
      
      // Wait a moment for rotation to complete
      setTimeout(() => {
        this.updateCanvasSize()
      }, 500)
      
    } catch (error) {
      console.log('⚠️ Could not lock orientation to landscape:', error.message)
    }
  }

  async forceVerticalOrientation() {
    if (!this.isMobile || !this.orientationSupported) return
    
    try {
      await screen.orientation.lock('portrait')
      console.log('🔄 Orientation locked to portrait')
      
      // Wait a moment for rotation to complete
      setTimeout(() => {
        this.updateCanvasSize()
      }, 500)
      
    } catch (error) {
      console.log('⚠️ Could not lock orientation to portrait:', error.message)
    }
  }

  unlockOrientation() {
    if (!this.isMobile || !this.orientationSupported) return
    
    try {
      screen.orientation.unlock()
      console.log('🔄 Orientation unlocked')
    } catch (error) {
      console.log('⚠️ Could not unlock orientation:', error.message)
    }
  }

  initializeControls() {
    // Mouse controls
    this.canvas.addEventListener("mousedown", () => this.handleInput(true))
    this.canvas.addEventListener("mouseup", () => this.handleInput(false))

    // Touch controls
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.handleInput(true)
    })
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.handleInput(false)
    })

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault()
        this.handleInput(true)
      } else if (e.code === "Escape") {
        this.togglePause()
      }
    })

    document.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        e.preventDefault()
        if (this.level === "easy") {
          this.handleInput(false)
        }
      }
    })
  }

  handleInput(isPressed) {
    if (!this.gameRunning || this.gamePaused || !this.player) return

    // If game hasn't started, start with first input
    if (!this.gameStarted && isPressed) {
      this.gameStarted = true
      // Set initial time to give grace period before first obstacle
      this.lastObstacleTime = Date.now() + 1000 // 1 second extra grace
      
      // Update instructions
      const instructionText =
        this.level === "easy"
          ? "Hold down to rise, release to fall!"
          : "Tap to boost! Collect blue glowing crystals"
      const gameInstructionElement = document.getElementById("gameInstructionText")
      if (gameInstructionElement) {
        gameInstructionElement.textContent = instructionText
      }
      
      console.log('Game started! First obstacle will appear in', (this.level === "easy" ? 4.5 : 3.8), 'seconds')
    }

    if (this.gameStarted) {
      if (this.level === "easy") {
        // Easy mode: Hold to rise
        this.player.isHolding = isPressed
        
        // Sonido de nave para nivel fácil
        if (window.audioManager) {
          if (isPressed) {
            window.audioManager.playNaveSound()
          } else {
            window.audioManager.stopNaveSound()
          }
        }
      } else {
        // Hard mode: UFO tap to boost - IMPROVED
        if (isPressed) {
          this.player.velocityY = -4.5 // Stronger boost for UFO
          
          // Sonido de burbuja para nivel hard
          if (window.audioManager) {
            window.audioManager.playBubbleSound()
          }
        }
      }
    }
  }

  startGame(level) {
    console.log('Starting game with level:', level)
    
    // UPDATE GAMESTATE FIRST
    window.gameState.currentLevel = level
    
    this.level = level
    this.gameRunning = true
    this.gamePaused = false // ENSURE NOT PAUSED
    this.gameStarted = false // Game doesn't start until user presses a key
    this.gameStartTime = Date.now()
    this.score = 0
    this.baseGameSpeed = level === "easy" ? 7.5 : 5.5
    this.gameSpeed = this.baseGameSpeed
    this.maxGameSpeed = level === "easy" ? 16 : 16
    this.obstacles = []
    this.particles = []
    this.lastGapPosition = "middle"
    this.previousScore = 0 // Para trackear incrementos de velocidad
    this.levelCompleted = false // Para controlar cuando se completa el nivel
    this.shieldActive = false // Shield state
    this.shieldEndTime = 0 // When shield ends

    // Clear pause/game over overlays that may be active
    const pauseOverlay = document.getElementById("pauseOverlay")
    const gameOverOverlay = document.getElementById("gameOverOverlay")
    const gameScreen = document.getElementById("gameScreen")
    
    // 🎯 QUITAR CLASE PARA MOSTRAR HUD Y INSTRUCCIONES
    if (gameScreen) {
      gameScreen.classList.remove("game-over-active")
    }
    
    if (pauseOverlay) pauseOverlay.classList.add("hidden")
    if (gameOverOverlay) gameOverOverlay.classList.add("hidden")

    // Update canvas size immediately
    this.updateCanvasSize()
    
    console.log('Game dimensions after update - Width:', this.GAME_WIDTH, 'Height:', this.GAME_HEIGHT)

    // Initialize player using a safe position - optimized for panoramic view
    const safeY = this.GAME_HEIGHT / 2
    const playerX = this.GAME_WIDTH * 0.15 // Position player more to the left (15% of width)
    this.player = new window.Player(playerX, safeY, this.level, this.PLAYER_SIZE)
    console.log('Player initialized:', this.player)
    console.log('Player position - x:', this.player.x, 'y:', this.player.y)
    console.log('Current vehicle for level', this.level, ':', window.gameState.getCurrentVehicle())
    
    // Ensure not paused after initialization
    this.gamePaused = false
    this.gameRunning = true

    // 🔄 FORCE HORIZONTAL ORIENTATION ON MOBILES
    this.forceHorizontalOrientation()

    // Update game area background
    const gameArea = document.getElementById("gameArea")
    if (gameArea) {
      if (level === "hard") {
        gameArea.classList.add("hard-mode")
      } else {
        gameArea.classList.remove("hard-mode")
      }
    }

    // Update HUD
    const currentLevelElement = document.getElementById("currentLevel")
    const gameScoreElement = document.getElementById("gameScore")

    if (currentLevelElement) {
      currentLevelElement.textContent = level === "easy" ? "SKY CITY" : "CRYPTO SPACE"
    }
    if (gameScoreElement) {
      gameScoreElement.textContent = "0"
    }

    // Update instructions
    const instructionText =
      level === "easy"
        ? "Press SPACE or CLICK to start! Hold down to rise"
        : "Press SPACE or CLICK to start! Collect blue crystals"
    const gameInstructionElement = document.getElementById("gameInstructionText")
    if (gameInstructionElement) {
      gameInstructionElement.textContent = instructionText
    }

    // Start game loop
    this.lastObstacleTime = 0
    
    // Reproducir música del nivel
    if (window.audioManager) {
      window.audioManager.playLevelMusic(level)
    }
    
    this.gameLoop()
  }

  gameLoop() {
    if (!this.gameRunning) return

    if (!this.gamePaused) {
      this.update()
      this.render()
    }

    requestAnimationFrame(() => this.gameLoop())
  }

  update() {
    // Check if player is already initialized
    if (!this.player) {
      console.log('Player not yet initialized, skipping update')
      return
    }

    // Only update if game has started
    if (!this.gameStarted) {
      // Keep player in initial position with smooth floating
      const centerY = this.GAME_HEIGHT / 2
      this.player.y = centerY + Math.sin(Date.now() * 0.003) * 10
      this.player.x = 100 // Keep X position fixed
      this.player.velocityY = 0 // No vertical velocity
      return
    }

    // Check for level completion (300 points in easy mode)
    if (this.level === "easy" && this.score >= 300 && !this.levelCompleted) {
      this.levelCompleted = true
      
      // Reproducir sonido de meta
      if (window.audioManager) {
        window.audioManager.playMetaSound()
      }
      
      this.showLevelCompleteScreen()
      return
    }

    // Update shield status
    if (this.shieldActive && Date.now() > this.shieldEndTime) {
      this.shieldActive = false
      console.log('Shield deactivated')
    }

    // Update player with improved physics
    this.player.update(this.GRAVITY, this.RISE_FORCE, this.GAME_HEIGHT, this.PLAYER_SIZE, this.level)

    // Generate obstacles
    this.generateObstacles()

    // Update obstacles
    this.updateObstacles()

    // Update particles (limit particle count for performance)
    this.updateParticles()

    // Update explosion effect
    this.updateExplosionEffect()

    // Check collisions
    this.checkCollisions()

    // Update score display
    const gameScoreElement = document.getElementById("gameScore")
    if (gameScoreElement) {
      if (this.level === "hard") {
        const difficultyLevel = Math.floor(this.score / 10)
        gameScoreElement.textContent = `${this.score} (Level ${difficultyLevel + 1})`
      } else {
        const patternLevel = Math.floor(this.score / 50)
        const nextPatternAt = (patternLevel + 1) * 50
        gameScoreElement.textContent = `${this.score} (Next: ${nextPatternAt})`
      }
    }
  }

  generateObstacles() {
    if (!this.gameStarted) return
    
    const now = Date.now()
    
    if (this.level === "easy") {
      // First obstacle after one second, then variable intervals based on speed
      const timeSinceStart = now - this.lastObstacleTime
      const isFirstObstacle = this.obstacles.length === 0
      
      if (isFirstObstacle) {
        // First obstacle after one second
        if (timeSinceStart < 1000) return
      } else {
        // More balanced intervals for better gameplay
        const progressFactor = Math.min(this.score / 50, 1) // 0 to 1 based on 50 points (slower progression)
        const baseInterval = 1800 - progressFactor * 800 // From 1.8s to 1.0s (more reasonable frequency)
        const speedMultiplier = Math.max(0.4, 1 - (this.gameSpeed - this.baseGameSpeed) * 0.04)
        const randomVariation = Math.random() * 200 + 100 // Variation 100-300ms (more variation)
        const interval = baseInterval * speedMultiplier + randomVariation
        
        if (timeSinceStart < interval) return
      }
    } else {
      // Hard mode - challenging but manageable intervals
      const timeSinceStart = now - this.lastObstacleTime
      const difficultyLevel = Math.floor(this.score / 10) // Difficulty level every 10 points
      const baseInterval = 1000 // Every 1 second base
      const progressFactor = Math.min(this.score / 10, 1) // More gradual scale
      const difficultyReduction = difficultyLevel * 50 // Reduce 50ms per level
      const interval = Math.max(400, baseInterval - progressFactor * 400 - difficultyReduction) // Minimum 400ms
      
      if (timeSinceStart < interval) return
    }
    
    this.lastObstacleTime = now

    if (this.level === "easy") {
      this.generateStaticBuildings()
    } else {
      this.generateAsteroids()
    }
  }

  generateStaticBuildings() {
    // SUPER intense progression for maximum challenge
    const difficultyFactor = Math.min(this.score / 30, 1) // 0 to 1 based on 30 points (super active)
    const speedFactor = (this.gameSpeed - this.baseGameSpeed) / (this.maxGameSpeed - this.baseGameSpeed)
    const scoreLevel = Math.floor(this.score / 50) // Every 50 points = new pattern level
    
    // Select pattern based on score
    const patternChance = Math.random()
    
    if (this.score >= 200 && patternChance < 0.15) {
      // "Labyrinth" pattern (very high score)
      this.generateLabyrinthPattern()
    } else if (this.score >= 150 && patternChance < 0.25) {
      // "Zigzag" pattern (high score)
      this.generateZigzagPattern()
    } else if (this.score >= 100 && patternChance < 0.35) {
      // "Staircase" pattern (medium-high score)
      this.generateStairPattern()
    } else if (this.score >= 50 && patternChance < 0.45) {
      // "Narrow tunnel" pattern (medium score)
      this.generateNarrowTunnelPattern()
    } else {
      // Improved classic pattern
      this.generateClassicPattern(difficultyFactor, speedFactor)
    }
  }

  generateClassicPattern(difficultyFactor, speedFactor) {
    // VERY high probability of multiple obstacles
    const multipleChance = difficultyFactor * 0.6 + speedFactor * 0.4 // Maximum 100%!
    
    // Decide whether to generate multiple buildings
    if (Math.random() < multipleChance && this.score > 20) { // Multiple buildings from 20 points
      // HIGH probability of multiple buildings
      const shouldGenerateSecond = Math.random() < 0.85 // 85% chance of second building
      const shouldGenerateThird = Math.random() < 0.6 && this.score > 60 // 60% chance of third after 60 points
      const shouldGenerateFourth = Math.random() < 0.4 && this.score > 120 // 40% chance of fourth after 120 points
      
      // First building
      this.generateBuildingPair()
      
      // Second building with better spacing
      if (shouldGenerateSecond) {
        const minSpacing = 600 + speedFactor * 150 // Minimum 600px, up to 750px (more separation)
        const spacing = minSpacing + Math.random() * 200 // More variation
        this.generateBuildingPair(spacing)
      }
      
      // Third building
      if (shouldGenerateThird && shouldGenerateSecond) {
        const extraSpacing = 900 + speedFactor * 200 // Minimum 900px, up to 1100px (more separation)
        const spacing = extraSpacing + Math.random() * 300
        this.generateBuildingPair(spacing)
      }
      
      // Fourth building (only at very high scores)
      if (shouldGenerateFourth && shouldGenerateThird && shouldGenerateSecond) {
        const megaSpacing = 1200 + speedFactor * 250 // Minimum 1200px, up to 1450px (more separation)
        const spacing = megaSpacing + Math.random() * 400
        this.generateBuildingPair(spacing)
      }
    } else {
      // Simple building
      this.generateBuildingPair()
    }
  }

  generateNarrowTunnelPattern() {
    // Narrow tunnel with smaller gaps
    const narrowGapReduction = 50 + Math.random() * 50 // Reduce gap 50-100px
    this.generateBuildingPair(0, narrowGapReduction)
    
    // Second narrow tunnel with better spacing
    const spacing = 500 + Math.random() * 150
    this.generateBuildingPair(spacing, narrowGapReduction)
    
                console.log("🚧 Narrow Tunnel Pattern generated")
  }

  generateStairPattern() {
    // Ascending or descending staircase
    const isAscending = Math.random() < 0.5
    const baseHeight = 100
    const stepSize = 60
    
    for (let i = 0; i < 4; i++) {
      const spacing = i * 400 // Increased spacing from 280 to 400
      const heightModifier = isAscending ? i * stepSize : (3 - i) * stepSize
      this.generateBuildingPair(spacing, 0, heightModifier)
    }
    
          console.log(`🪜 Staircase Pattern ${isAscending ? 'Ascending' : 'Descending'} generated`)
  }

  generateZigzagPattern() {
    // Zigzag pattern with alternating gaps
    const positions = ['top', 'bottom', 'top', 'bottom']
    
    for (let i = 0; i < 4; i++) {
      const spacing = i * 450 // Increased spacing from 300 to 450
      const forcedPosition = positions[i]
      this.generateBuildingPair(spacing, 0, 0, forcedPosition)
    }
    
          console.log("⚡ Zigzag Pattern generated")
  }

  generateLabyrinthPattern() {
    // Complex labyrinth-type pattern with better spacing
    const patterns = [
      { spacing: 0, gap: 0, height: 50, position: 'top' },
      { spacing: 350, gap: -30, height: -50, position: 'bottom' },
      { spacing: 700, gap: -50, height: 30, position: 'top' },
      { spacing: 1050, gap: -20, height: -30, position: 'bottom' },
      { spacing: 1400, gap: 0, height: 0, position: 'top' }
    ]
    
    patterns.forEach(pattern => {
      this.generateBuildingPair(pattern.spacing, pattern.gap, pattern.height, pattern.position)
    })
    
          console.log("🌀 Maze Pattern generated")
  }

  generateBuildingPair(xOffset = 0, gapReduction = 0, heightModifier = 0, forcedPosition = null) {
    // Adaptive building heights based on canvas size
    // 🎯 RESPONSIVE HORIZONTAL - Alturas más pequeñas para landscape
    const isLandscapeMode = window.innerHeight <= 600 && window.innerWidth > window.innerHeight
    const minHeight = Math.max(40, Math.min(80, this.GAME_HEIGHT * (isLandscapeMode ? 0.12 : 0.15))) // Reducido en landscape
    const maxHeight = Math.max(200, Math.min(400, this.GAME_HEIGHT * (isLandscapeMode ? 0.45 : 0.6))) // Reducido en landscape
    
    // Use forced or random position
    let gapPosition
    if (forcedPosition) {
      gapPosition = forcedPosition
    } else {
      // SUPER RANDOM generation - "that crazy"
      // Completely random alternation between top and bottom
      const positions = ["top", "bottom"]
      gapPosition = positions[Math.floor(Math.random() * positions.length)]
    }
    
    this.lastGapPosition = gapPosition
    
    let topHeight, gap
    
    // Comfortable gaps for navigation and collection - adaptive to canvas size
    const speedFactor = Math.min((this.gameSpeed - this.baseGameSpeed) / (this.maxGameSpeed - this.baseGameSpeed), 1)
    const extraGap = speedFactor * (this.GAME_HEIGHT * 0.2) // 20% of canvas height extra when at maximum speed
    const baseGap = Math.max(150, this.GAME_HEIGHT * 0.4) + Math.random() * (this.GAME_HEIGHT * 0.15) + extraGap
    
    if (gapPosition === "top") {
      // Gap at top - bottom building very tall
      topHeight = minHeight + Math.random() * (maxHeight - minHeight) * 0.3 + heightModifier // Small top building + modifier
      gap = Math.max(this.GAME_HEIGHT * 0.25, baseGap - gapReduction) // Adjusted gap but with minimum 25% of canvas height
    } else {
      // Gap at bottom - top building very tall
      topHeight = maxHeight - Math.random() * (maxHeight - minHeight) * 0.3 + heightModifier // Large top building + modifier
      gap = Math.max(this.GAME_HEIGHT * 0.25, baseGap - gapReduction) // Adjusted gap but with minimum 25% of canvas height
    }
    
    // Ensure realistic limits
    topHeight = Math.max(minHeight, Math.min(maxHeight, topHeight))

    const xPos = this.GAME_WIDTH + xOffset
    
    // Differentiated dimensions for better visual aspect
    // 🎯 RESPONSIVE HORIZONTAL - Tamaños más pequeños para landscape
    const airBuildingWidth = isLandscapeMode ? 80 : 100  // Más estrecho en landscape
    const groundBuildingWidth = isLandscapeMode ? 100 : 140  // Más estrecho en landscape para evitar que sean demasiado grandes
    
    // Adjust aerial obstacle height for better proportion
    let adjustedTopHeight = topHeight
    if (gapPosition === "bottom") {
      // If gap is at bottom, top building is very tall
      // Reduce height slightly for better proportion with images
      adjustedTopHeight = Math.min(topHeight, 350)
    }

    // Validate dimensions before creating buildings
    if (!isFinite(this.GAME_WIDTH) || !isFinite(this.GAME_HEIGHT) || !isFinite(adjustedTopHeight) || !isFinite(gap)) {
      console.warn('Invalid game dimensions detected:', {
        GAME_WIDTH: this.GAME_WIDTH,
        GAME_HEIGHT: this.GAME_HEIGHT,
        topHeight: adjustedTopHeight,
        gap: gap,
        xPos: xPos
      })
      return
    }

    // Calculate bottom building height and validate - auto-adjust if needed
    let bottomY = adjustedTopHeight + gap
    let bottomHeight = this.GAME_HEIGHT - bottomY
    
    // Auto-adjust if bottom building would be too small or negative
    if (bottomHeight <= minHeight) {
      console.log('Auto-adjusting building dimensions for canvas height:', this.GAME_HEIGHT)
      // Redistribute the space better
      adjustedTopHeight = Math.min(adjustedTopHeight, this.GAME_HEIGHT * 0.3) // Max 30% for top building
      gap = Math.max(this.GAME_HEIGHT * 0.2, Math.min(gap, this.GAME_HEIGHT * 0.4)) // Gap between 20-40% of canvas height
      bottomY = adjustedTopHeight + gap
      bottomHeight = this.GAME_HEIGHT - bottomY
      
      // If still invalid, use a simple safe configuration
      if (bottomHeight <= minHeight) {
        adjustedTopHeight = this.GAME_HEIGHT * 0.25 // 25% for top
        gap = this.GAME_HEIGHT * 0.3 // 30% for gap
        bottomY = adjustedTopHeight + gap
        bottomHeight = this.GAME_HEIGHT - bottomY // 45% for bottom
        console.log('Using safe building configuration')
      }
    }

    // Create buildings with optimized dimensions
    this.obstacles.push(new window.Building(xPos, 0, airBuildingWidth, adjustedTopHeight, "top"))
    this.obstacles.push(
      new window.Building(xPos, bottomY, groundBuildingWidth, bottomHeight, "bottom"),
    )
    
    // 15% chance to generate something in the gap (gem or power-up) - reduced more
    if (Math.random() < 0.15) {
      const itemSize = 25
      const itemX = xPos + airBuildingWidth / 2 - itemSize / 2
      
      // 12% chance of shield power-up, 88% chance of gem - increased shield
      const isShieldPowerUp = Math.random() < 0.12
      
      if (isShieldPowerUp) {
        // Create shield power-up that FALLS FROM THE SKY
        const shieldPowerUp = {
          x: itemX,
          y: 0, // Starts at the top
          size: itemSize,
          type: "shield",
          collected: false,
          passed: false,
          velocityY: 2, // Fall velocity
          render: function(ctx) {
            if (this.collected) return
            
            ctx.save()
            ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
            
            // Efecto de brillo azul pulsante
            const time = Date.now() * 0.008
            const pulse = Math.sin(time) * 0.3 + 0.7
            ctx.globalAlpha = pulse
            ctx.shadowBlur = 20
            ctx.shadowColor = "#00BFFF"
            
            // Dibujar escudo
            const size = this.size / 2
            ctx.fillStyle = "#00BFFF"
            ctx.strokeStyle = "#87CEEB"
            ctx.lineWidth = 3
            
            ctx.beginPath()
            ctx.arc(0, 0, size, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            
            // Dibujar cruz en el centro
            ctx.strokeStyle = "#FFFFFF"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(-size * 0.3, 0)
            ctx.lineTo(size * 0.3, 0)
            ctx.moveTo(0, -size * 0.3)
            ctx.lineTo(0, size * 0.3)
            ctx.stroke()
            
            ctx.restore()
          },
          collidesWith: function(player) {
            if (this.collected) return false
            const dx = this.x + this.size / 2 - (player.x + player.size / 2)
            const dy = this.y + this.size / 2 - (player.y + player.size / 2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < (this.size / 2 + player.size / 2 - 10)
          },
          update: function(gameSpeed) {
            this.x -= gameSpeed
            if (this.velocityY) {
              this.y += this.velocityY // Fall from the sky
            }
          }
        }
        
        this.obstacles.push(shieldPowerUp)
      } else {
        // Create gem IN THE CENTER OF THE GAP - different types
        const gemY = adjustedTopHeight + gap / 2 - itemSize / 2 // Correct Y position in the gap
        
        // Determine gem type (50% blue, 35% yellow, 15% red) - reduced blue
        const gemRand = Math.random()
        let gemType, gemValue, gemColor, shadowColor, strokeColor
        
        if (gemRand < 0.50) {
          // Blue gem - 1 point
          gemType = "gem_blue"
          gemValue = 1
          gemColor = "#00BFFF"
          shadowColor = "#00BFFF" 
          strokeColor = "#0099FF"
        } else if (gemRand < 0.85) {
          // Yellow gem - 2 points
          gemType = "gem_yellow"
          gemValue = 2
          gemColor = "#FFD700"
          shadowColor = "#FFD700"
          strokeColor = "#FFA500"
        } else {
          // Red gem - 5 points
          gemType = "gem_red"
          gemValue = 5
          gemColor = "#FF4444"
          shadowColor = "#FF4444"
          strokeColor = "#CC2222"
        }
        
        const gem = {
          x: itemX,
          y: gemY,
          size: itemSize,
          type: gemType,
          value: gemValue,
          collected: false,
          passed: false,
          render: function(ctx) {
            if (this.collected) return
            
            ctx.save()
            ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
            
            // Efecto de brillo y rotación
            const time = Date.now() * 0.005
            ctx.rotate(time)
            ctx.shadowBlur = 15
            ctx.shadowColor = shadowColor
            
            // Dibujar diamante de color
            const size = this.size / 2
            ctx.fillStyle = gemColor
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = 2
            
            ctx.beginPath()
            ctx.moveTo(0, -size)
            ctx.lineTo(size * 0.6, 0)
            ctx.lineTo(0, size)
            ctx.lineTo(-size * 0.6, 0)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            
            ctx.restore()
          },
          collidesWith: function(player) {
            if (this.collected) return false
            const dx = this.x + this.size / 2 - (player.x + player.size / 2)
            const dy = this.y + this.size / 2 - (player.y + player.size / 2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < (this.size / 2 + player.size / 2 - 10)
          },
          update: function(gameSpeed) {
            this.x -= gameSpeed
          }
        }
        
        this.obstacles.push(gem)
      }
    }
  }

  generateAsteroids() {
    const difficultyLevel = Math.floor(this.score / 10)
    const asteroidMultiplier = 1 + (difficultyLevel * 0.3) // Incrementar 30% por nivel
    
    // Debug logging only for first few generations
    const shouldLog = !this.debugLogCount || this.debugLogCount < 5 || this.score % 10 === 0
    if (shouldLog) {
      if (!this.debugLogCount) this.debugLogCount = 0
      this.debugLogCount++
    }
    
    // Patrones avanzados en puntuaciones altas (modo difícil)
    const patternChance = Math.random()
    
    if (this.score >= 100 && patternChance < 0.2) {
      // Patrón "Lluvia de asteroides" (puntuación alta)
      this.generateAsteroidRainPattern(difficultyLevel, shouldLog)
    } else if (this.score >= 80 && patternChance < 0.3) {
      // Patrón "Formación en V" (puntuación media-alta)
      this.generateVFormationPattern(difficultyLevel, shouldLog)
    } else if (this.score >= 60 && patternChance < 0.4) {
      // Patrón "Onda circular" (puntuación media)
      this.generateCircularWavePattern(difficultyLevel, shouldLog)
    } else {
      // Patrón clásico aleatorio
      this.generateClassicAsteroidPattern(difficultyLevel, asteroidMultiplier, shouldLog)
    }
  }

  generateClassicAsteroidPattern(difficultyLevel, asteroidMultiplier, shouldLog) {
    const asteroidTypeChance = Math.random()
    
    if (shouldLog) {
      console.log(`Generating asteroids, chance: ${asteroidTypeChance.toFixed(2)}, difficulty level: ${difficultyLevel}, multiplier: ${asteroidMultiplier.toFixed(2)}`)
    }

    if (asteroidTypeChance < 0.25) {
      // Cristal azul (25% - igualado) - DA PUNTOS
      const baseCount = Math.floor(Math.random() * 2) + 1 // 1-2 cristales azules
      const count = Math.max(1, Math.floor(baseCount * asteroidMultiplier))
      if (shouldLog) console.log('Generating', count, 'BLUE crystals (static)')
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 30 + 70 // Cristales AZULES más grandes que todos (70-100px)
        const x = this.GAME_WIDTH + Math.random() * 150 + i * 120
        const y = Math.random() * (this.GAME_HEIGHT - size - 200) + 100
        const asteroid = new window.Asteroid(x, y, size, "blue", false, difficultyLevel) // false = no recolectable, da puntos al pasar
        this.obstacles.push(asteroid)
        if (shouldLog) console.log('Generated BLUE crystal (static, points on pass)')
      }
      
    } else if (asteroidTypeChance < 0.50) {
      // Verde recto (25% - igualado) - NO DA PUNTOS
      const baseCount = Math.floor(Math.random() * 3) + 2 // 2-4 asteroides verdes
      const count = Math.max(1, Math.floor(baseCount * asteroidMultiplier))
      if (shouldLog) console.log('Generating', count, 'GREEN asteroids')
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 40 + 50 // Asteroides verdes MUCHO más grandes (50-90px)
        const x = this.GAME_WIDTH + i * 100
        const y = Math.random() * (this.GAME_HEIGHT - size - 100) + 50
        const asteroid = new window.Asteroid(x, y, size, "green", false, difficultyLevel)
        this.obstacles.push(asteroid)

      }
      
    } else if (asteroidTypeChance < 0.75) {
      // Rojo rebotando (25% - igualado) - NO DA PUNTOS
      const baseCount = Math.floor(Math.random() * 3) + 2 // 2-4 asteroides rojos (igualado con verde)
      const count = Math.max(1, Math.floor(baseCount * asteroidMultiplier))
      if (shouldLog) console.log('Generating', count, 'RED bouncing asteroids')
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 35 + 65 // Asteroides ROJOS más grandes que verdes y morados (65-100px)
        const x = this.GAME_WIDTH + i * 120
        const y = Math.random() * (this.GAME_HEIGHT - size - 100) + 50
        const asteroid = new window.Asteroid(x, y, size, "red", false, difficultyLevel)
        this.obstacles.push(asteroid)

      }
      
    } else {
      // Morado explosivo (25% - igualado) - NO DA PUNTOS
      const baseCount = Math.floor(Math.random() * 3) + 2 // 2-4 asteroides morados (igualado)
      const count = Math.max(2, Math.floor(baseCount * asteroidMultiplier))
      if (shouldLog) console.log('Generating', count, 'PURPLE explosive asteroids')
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 35 + 50 // Asteroides morados MUCHO más grandes (50-85px)
        const x = this.GAME_WIDTH + i * 110
        const y = Math.random() * (this.GAME_HEIGHT - size - 100) + 50
        const asteroid = new window.Asteroid(x, y, size, "purple", false, difficultyLevel)
        this.obstacles.push(asteroid)

      }
    }

    // Agregar gemas y power-ups ocasionalmente (35% chance - aumentado)
    if (Math.random() < 0.35) {
      const itemSize = 30
      const itemX = this.GAME_WIDTH + Math.random() * 200
      const itemY = Math.random() * (this.GAME_HEIGHT - itemSize - 200) + 100
      
      // 85% chance de gema, 15% chance de power-up de escudo
      const isShieldPowerUp = Math.random() < 0.15
      
      if (isShieldPowerUp) {
        // Crear power-up de escudo
        const shieldPowerUp = {
          x: itemX,
          y: itemY,
          size: itemSize,
          type: "shield",
          collected: false,
          passed: false,
          render: function(ctx) {
            if (this.collected) return
            
            ctx.save()
            ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
            
            // Efecto de brillo azul pulsante
            const time = Date.now() * 0.008
            const pulse = Math.sin(time) * 0.3 + 0.7
            ctx.globalAlpha = pulse
            ctx.shadowBlur = 20
            ctx.shadowColor = "#00BFFF"
            
            // Dibujar escudo
            const size = this.size / 2
            ctx.fillStyle = "#00BFFF"
            ctx.strokeStyle = "#87CEEB"
            ctx.lineWidth = 3
            
            ctx.beginPath()
            ctx.arc(0, 0, size, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            
            // Dibujar cruz en el centro
            ctx.strokeStyle = "#FFFFFF"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(-size * 0.3, 0)
            ctx.lineTo(size * 0.3, 0)
            ctx.moveTo(0, -size * 0.3)
            ctx.lineTo(0, size * 0.3)
            ctx.stroke()
            
            ctx.restore()
          },
          collidesWith: function(player) {
            if (this.collected) return false
            const dx = this.x + this.size / 2 - (player.x + player.size / 2)
            const dy = this.y + this.size / 2 - (player.y + player.size / 2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < (this.size / 2 + player.size / 2 - 10)
          },
          update: function(gameSpeed) {
            this.x -= gameSpeed
          }
        }
        
        this.obstacles.push(shieldPowerUp)
        if (shouldLog) console.log('Generated SHIELD power-up')
        
      } else {
        // Create gem - different types
        // Determine gem type (50% blue, 35% yellow, 15% red)
        const gemRand = Math.random()
        let gemType, gemValue, gemColor, shadowColor, strokeColor
        
        if (gemRand < 0.50) {
          // Blue gem - 1 point
          gemType = "gem_blue"
          gemValue = 1
          gemColor = "#00BFFF"
          shadowColor = "#00BFFF" 
          strokeColor = "#0099FF"
        } else if (gemRand < 0.85) {
          // Yellow gem - 2 points
          gemType = "gem_yellow"
          gemValue = 2
          gemColor = "#FFD700"
          shadowColor = "#FFD700"
          strokeColor = "#FFA500"
        } else {
          // Red gem - 5 points
          gemType = "gem_red"
          gemValue = 5
          gemColor = "#FF4444"
          shadowColor = "#FF4444"
          strokeColor = "#CC2222"
        }
        
        const gem = {
          x: itemX,
          y: itemY,
          size: itemSize,
          type: gemType,
          value: gemValue,
          collected: false,
          passed: false,
          render: function(ctx) {
            if (this.collected) return
            
            ctx.save()
            ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
            
            // Efecto de brillo y rotación
            const time = Date.now() * 0.005
            ctx.rotate(time)
            ctx.shadowBlur = 15
            ctx.shadowColor = shadowColor
            
            // Dibujar diamante de color
            const size = this.size / 2
            ctx.fillStyle = gemColor
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = 2
            
            ctx.beginPath()
            ctx.moveTo(0, -size)
            ctx.lineTo(size * 0.6, 0)
            ctx.lineTo(0, size)
            ctx.lineTo(-size * 0.6, 0)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            
            ctx.restore()
          },
          collidesWith: function(player) {
            if (this.collected) return false
            const dx = this.x + this.size / 2 - (player.x + player.size / 2)
            const dy = this.y + this.size / 2 - (player.y + player.size / 2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < (this.size / 2 + player.size / 2 - 10)
          },
          update: function(gameSpeed) {
            this.x -= gameSpeed
          }
        }
        
        this.obstacles.push(gem)
        if (shouldLog) console.log(`Generated ${gemType} (+${gemValue} points)`)
      }
    }
    
    if (shouldLog) console.log('Total obstacles after generation:', this.obstacles.length)
  }

  generateAsteroidRainPattern(difficultyLevel, shouldLog) {
    // Lluvia de asteroides pequeños pero numerosos
    const asteroidCount = 8 + Math.floor(difficultyLevel * 0.5)
    
    for (let i = 0; i < asteroidCount; i++) {
      const size = Math.random() * 20 + 30 // Asteroides más pequeños (30-50px)
      const x = this.GAME_WIDTH + Math.random() * 400 + i * 60
      const y = Math.random() * (this.GAME_HEIGHT - 100) + 50
      const types = ['green', 'red', 'blue']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const asteroid = new window.Asteroid(x, y, size, type, false, difficultyLevel)
      this.obstacles.push(asteroid)
    }
    
          if (shouldLog) console.log(`🌧️ Asteroid Rain Pattern generated (${asteroidCount} asteroids)`)
  }

  generateVFormationPattern(difficultyLevel, shouldLog) {
    // Formación en V de asteroides
    const centerY = this.GAME_HEIGHT / 2
    const vWidth = 200
    const asteroidCount = 5
    
    for (let i = 0; i < asteroidCount; i++) {
      const progress = i / (asteroidCount - 1) // 0 a 1
      const side = i % 2 === 0 ? 1 : -1 // Alternar lados
      
      const x = this.GAME_WIDTH + i * 80
      const y = centerY + (side * progress * vWidth)
      const size = Math.random() * 30 + 60
      const type = i === Math.floor(asteroidCount / 2) ? 'blue' : 'green' // Centro azul, lados verdes
      
      const asteroid = new window.Asteroid(x, y, size, type, false, difficultyLevel)
      this.obstacles.push(asteroid)
    }
    
    if (shouldLog) console.log("✈️ V-Formation Pattern generated")
  }

  generateCircularWavePattern(difficultyLevel, shouldLog) {
    // Onda circular de asteroides
    const centerY = this.GAME_HEIGHT / 2
    const radius = 150
    const asteroidCount = 6
    
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2
      const x = this.GAME_WIDTH + i * 100
      const y = centerY + Math.sin(angle) * radius
      const size = Math.random() * 25 + 55
      const types = ['purple', 'red', 'green']
      const type = types[i % types.length]
      
      const asteroid = new window.Asteroid(x, y, size, type, false, difficultyLevel)
      this.obstacles.push(asteroid)
    }
    
    if (shouldLog) console.log("🌊 Circular Wave Pattern generated")
  }

  updateObstacles() {
    // Only move obstacles if the game has started
    if (!this.gameStarted) {
      // Clear any existing obstacles when game hasn't started
      this.obstacles = []
      return
    }

    // Validate game speed before updating obstacles
    if (!isFinite(this.gameSpeed) || this.gameSpeed <= 0) {
      console.warn('Invalid game speed detected:', this.gameSpeed)
      this.gameSpeed = this.baseGameSpeed || 3 // Reset to base speed
    }

    // Update obstacle positions
    this.obstacles.forEach((obstacle) => {
      if (obstacle.update) {
        // Check if obstacle is an Asteroid (needs gameEngine), Building (needs gameSpeed), or gem/shield (needs gameSpeed)
        if (obstacle.type === "building" || obstacle.type === "gem_blue" || obstacle.type === "gem_yellow" || obstacle.type === "gem_red" || obstacle.type === "shield") {
          obstacle.update(this.gameSpeed)
        } else {
          obstacle.update(this) // Pasar gameEngine para asteroides
        }
      } else {
        // Fallback para edificios que no tienen update
        obstacle.x -= this.gameSpeed
      }
    })

    // Process obstacles: collisions, collection, cleanup
    this.obstacles = this.obstacles.filter((obstacle, index) => {
      
      // Check for gem collection (all types)
      if ((obstacle.type === "gem_blue" || obstacle.type === "gem_yellow" || obstacle.type === "gem_red") && !obstacle.collected) {
        if (obstacle.collidesWith && obstacle.collidesWith(this.player)) {
          obstacle.collected = true
          this.score += obstacle.value
          this.addCollectionEffect(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2)
          console.log(`${obstacle.type} collected! +${obstacle.value} points. Score:`, this.score)
          return false // Eliminar la gema
        }
      }
      
      // Check for shield power-up collection
      if (obstacle.type === "shield" && !obstacle.collected) {
        if (obstacle.collidesWith && obstacle.collidesWith(this.player)) {
          obstacle.collected = true
          this.shieldActive = true
          this.shieldEndTime = Date.now() + 5000 // 5 segundos
          this.addCollectionEffect(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2)
          console.log('Shield power-up collected! Shield active for 5 seconds')
          return false // Eliminar el power-up
        }
      }
      

      
      // Check for regular collisions (non-collectible obstacles)
      if (obstacle.collidesWith && obstacle.collidesWith(this.player)) {
        // Excluir gemas, power-ups y cristales azules de hard mode
        if (!(this.level === "hard" && obstacle.type === "blue") && 
            obstacle.type !== "gem_blue" && obstacle.type !== "gem_yellow" && obstacle.type !== "gem_red" && obstacle.type !== "shield") {
          
          if (this.shieldActive) {
            // Con escudo activo: destruir el obstáculo en lugar de game over
            this.addCollectionEffect(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2)
            console.log('Obstacle destroyed by shield!')
            return false // Eliminar el obstáculo
          } else {
            // Sin escudo: game over normal
            this.gameOver()
            return true // Keep obstacle for game over state
          }
        }
      }
      
      // Check if obstacle is off screen
      if (obstacle.isOffScreen && obstacle.isOffScreen(this)) {
        return false
      }
      
      // Legacy off-screen check for buildings
      if (obstacle.x + (obstacle.width || obstacle.size || 0) < 0) {
        return false
      }

      // Score points for passing obstacles
      if (!obstacle.passed && obstacle.x + (obstacle.width || obstacle.size || 0) < this.player.x) {
        obstacle.passed = true
        
        if (this.level === "easy") {
          // En modo fácil, solo contar edificios superiores para evitar doble conteo
          if (obstacle.type === "building" && obstacle.side === "top") {
            this.score += 1
          }
        } else if (this.level === "hard") {
          // En modo difícil, cristales azules dan puntos al pasar
          if (obstacle.type === "blue") {
            this.score += 1
            this.addCollectionEffect(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2)
            console.log('Blue crystal passed! +1 point. Score:', this.score)
          }
        }
      }

      return true
    })

    // Update game speed based on score
    this.updateGameSpeed()
  }

  updateGameSpeed() {
    if (this.level === "easy") {
      // Modo fácil: incrementar cada 3 puntos (SÚPER activo)
      const pointsForIncrement = 3
      const speedIncrement = Math.floor(this.score / pointsForIncrement)
      const incrementValue = 0.3 // Slower increments
      const targetSpeed = Math.min(this.baseGameSpeed + speedIncrement * incrementValue, this.maxGameSpeed)
      
      // Solo actualizar si cambió
      if (this.gameSpeed !== targetSpeed) {
        this.gameSpeed = targetSpeed
        console.log(`Game speed increased to: ${this.gameSpeed} (easy mode - EXTREME)`)
      }
    } else {
      // Modo difícil: incrementar cada 10 puntos
      const pointsForIncrement = 10
      const speedIncrement = Math.floor(this.score / pointsForIncrement)
      const incrementValue = 0.8
      const targetSpeed = Math.min(this.baseGameSpeed + speedIncrement * incrementValue, this.maxGameSpeed)
      
      // Solo actualizar si cambió
      if (this.gameSpeed !== targetSpeed) {
        this.gameSpeed = targetSpeed
        console.log(`Game speed increased to: ${this.gameSpeed} (hard mode, level ${speedIncrement + 1})`)
      }
    }
  }

  updateParticles() {
    // Add trail particles (reduced frequency for better performance)
    if (Math.random() < 0.3) {
      this.addTrailParticle()
    }

    // Update existing particles and limit count
    this.particles = this.particles.filter((particle) => {
      particle.update()
      return particle.opacity > 0
    })

    // Keep particle count reasonable for performance
    if (this.particles.length > 50) {
      this.particles = this.particles.slice(-30)
    }
  }

  addTrailParticle() {
    if ((this.level === "easy" && this.player.isHolding) || this.level === "hard") {
      const color = this.level === "easy" ? "#ff6b6b" : "#4dabf7"
      this.particles.push(
        new window.TrailParticle(
          this.player.x + this.PLAYER_SIZE / 2 + (Math.random() - 0.5) * 10,
          this.player.y + this.PLAYER_SIZE + (Math.random() - 0.5) * 10,
          color
        )
      )
    }
  }

  addCollectionEffect(x, y) {
    // Crear efecto de explosión de partículas azules brillantes
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      const speed = 3 + Math.random() * 4
      const particle = new window.TrailParticle(x, y, "#00BFFF")
      particle.vx = Math.cos(angle) * speed
      particle.vy = Math.sin(angle) * speed
      particle.size = 8 + Math.random() * 6
      particle.opacity = 1
      this.particles.push(particle)
    }
    
    // Partículas adicionales con brillo
    for (let i = 0; i < 6; i++) {
      const particle = new window.TrailParticle(x, y, "#87CEEB")
      particle.vx = (Math.random() - 0.5) * 6
      particle.vy = (Math.random() - 0.5) * 6
      particle.size = 4 + Math.random() * 4
      particle.opacity = 0.8
      this.particles.push(particle)
    }
  }

  updateExplosionEffect() {
    if (this.explosionEffect) {
      const elapsed = Date.now() - this.explosionEffect.startTime
      
      if (elapsed >= this.explosionEffect.duration) {
        // Eliminar explosión cuando termine
        this.explosionEffect = null
      } else {
        // Actualizar opacidad (fade out)
        const progress = elapsed / this.explosionEffect.duration
        this.explosionEffect.opacity = 1 - progress
        
        // Opcional: hacer que la explosión crezca ligeramente
        this.explosionEffect.size = this.PLAYER_SIZE * 2 * (1 + progress * 0.5)
      }
    }
  }

  checkCollisions() {
    // Grace period - no collisions for first 2 seconds in hard mode
    if (this.level === "hard" && Date.now() - this.gameStartTime < 2000) {
      return
    }

    this.obstacles.forEach((obstacle) => {
      if (this.checkCollision(this.player, obstacle)) {
        // IMPORTANTE: Excluir gemas y escudos de las colisiones fatales
        if (obstacle.type === "gem_blue" || obstacle.type === "gem_yellow" || obstacle.type === "gem_red" || obstacle.type === "shield") {
          // Estos objetos son recolectables, NO causan game over
          return
        }
        
        // Verificar si el escudo está activo antes de game over
        if (this.shieldActive) {
          // Con escudo activo: destruir el obstáculo y efecto visual
          this.addCollectionEffect(obstacle.x + (obstacle.width || obstacle.size) / 2, obstacle.y + (obstacle.height || obstacle.size) / 2)
          console.log('Obstacle destroyed by shield!')
          
          // Marcar el obstáculo para eliminación
          if (obstacle.type === "building") {
            obstacle.x = -1000 // Mover fuera de pantalla para eliminación
          }
          return
        } else {
          // Sin escudo: game over normal (solo para edificios y asteroides peligrosos)
          
          // Mostrar explosión exactamente en la posición del jugador
          this.showExplosionAtPlayer()
          
          // Reproducir sonido de explosión
          if (window.audioManager) {
            window.audioManager.playExplosionSound()
          }
          
          this.gameOver()
          return
        }
      }
    })
  }

  checkCollision(player, obstacle) {
    // Use more generous hitbox for better gameplay
    const margin = this.level === "hard" ? 30 : 15 // Reducido margin para compensar vehículo más grande
    
    // Dimensiones del player considerando si es modo fácil (más ancho)
    const playerWidth = this.level === "easy" ? this.PLAYER_SIZE * 1.4 : this.PLAYER_SIZE
    const playerHeight = this.PLAYER_SIZE
    
    if (obstacle.collidesWith) {
      // Para obstacles con collidesWith personalizado, simular el tamaño aumentado
      const tempPlayer = {
        x: player.x,
        y: player.y,
        size: playerWidth // Usar la anchura como referencia principal
      }
      return obstacle.collidesWith(tempPlayer)
    }
    
    // Legacy collision check for buildings con nuevas dimensiones
    return (
      player.x < obstacle.x + (obstacle.width || obstacle.size) - margin &&
      player.x + playerWidth > obstacle.x + margin &&
      player.y < obstacle.y + (obstacle.height || obstacle.size) - margin &&
      player.y + playerHeight > obstacle.y + margin
    )
  }

  render() {
    if (!this.ctx) {
      console.error('No context available for rendering')
      return
    }

    // Clear canvas to show CSS background images
    this.ctx.clearRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)

    // Background is now handled by CSS - leveleasy.png for easy mode, space-background.jpg for hard mode

    // Draw obstacles
    this.obstacles.forEach((obstacle, index) => {
      if (obstacle.draw) {
        obstacle.draw(this.ctx)
      } else if (obstacle.render) {
        obstacle.render(this.ctx)
      } else {
        // Fallback para debugging
        console.warn('Obstacle has no render method:', obstacle, 'at index', index)
      }
    })

    // Draw player
    if (this.player) {
      // Draw shield effect if active
      if (this.shieldActive) {
        this.ctx.save()
        this.ctx.translate(this.player.x + this.PLAYER_SIZE / 2, this.player.y + this.PLAYER_SIZE / 2)
        
        // Pulsating blue shield around player
        const time = Date.now() * 0.01
        const pulse = Math.sin(time) * 0.3 + 0.7
        this.ctx.globalAlpha = pulse * 0.6
        this.ctx.strokeStyle = "#00BFFF"
        this.ctx.lineWidth = 4
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = "#00BFFF"
        
        // Draw shield circle
        this.ctx.beginPath()
        this.ctx.arc(0, 0, this.PLAYER_SIZE / 2 + 15, 0, Math.PI * 2)
        this.ctx.stroke()
        
        this.ctx.restore()
      }
      
      this.player.render(this.ctx, this.PLAYER_SIZE)
    }

    // Draw particles
    this.particles.forEach((particle) => {
      if (particle.draw) {
        particle.draw(this.ctx)
      } else if (particle.render) {
        particle.render(this.ctx)
      }
    })

    // Draw explosion effect on top of everything
    if (this.explosionEffect && this.explosionImage) {
      this.ctx.save()
      this.ctx.globalAlpha = this.explosionEffect.opacity
      
      // Dibujar la imagen de explosión centrada en la posición
      const halfSize = this.explosionEffect.size / 2
      this.ctx.drawImage(
        this.explosionImage,
        this.explosionEffect.x - halfSize,
        this.explosionEffect.y - halfSize,
        this.explosionEffect.size,
        this.explosionEffect.size
      )
      
      this.ctx.restore()
    }

    // Draw UI
    this.drawUI()
  }

  drawUI() {
    // 🎯 NO DIBUJAR HUD EN CANVAS CUANDO ESTÉ EN GAME OVER
    const gameOverActive = !this.gameRunning && !this.levelCompleted
    
    if (!gameOverActive) {
      // Draw score
      this.ctx.save()
      this.ctx.fillStyle = "#ffffff"
      this.ctx.font = "24px Orbitron"
      this.ctx.textAlign = "left"
      this.ctx.fillText(`Score: ${this.score}`, 20, 40)
      
      // Draw speed indicator
      this.ctx.font = "16px Orbitron"
      this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}`, 20, 70)
      
      // Draw shield indicator if active
      if (this.shieldActive) {
        const timeLeft = Math.max(0, (this.shieldEndTime - Date.now()) / 1000)
        this.ctx.fillStyle = "#00BFFF"
        this.ctx.font = "18px Orbitron"
        this.ctx.fillText(`🛡️ Shield: ${timeLeft.toFixed(1)}s`, 20, 100)
      }
      this.ctx.restore()
    }
    
    // Draw waiting message if game hasn't started
    if (!this.gameStarted) {
      this.drawWaitingMessage()
    }
    
    // Draw level complete screen
    if (this.levelCompleted) {
      this.drawLevelCompleteScreen()
    }
    
    // Draw game over screen
    if (!this.gameRunning && !this.levelCompleted) {
      this.drawGameOverScreen()
    }
  }

  drawWaitingMessage() {
    this.ctx.save()
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
    
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "32px Orbitron"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    
    const message = this.level === "easy" 
      ? "Press SPACE or CLICK to start!" 
      : "Press SPACE or CLICK to start!"
    
    this.ctx.fillText(message, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2)
    
    // Add instructions
    this.ctx.font = "18px Orbitron"
    if (this.level === "easy") {
      this.ctx.fillText("Hold down to rise", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 50)
      this.ctx.fillText("Collect golden gems and blue power-ups", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 80)
      this.ctx.fillText("Shield protects you for 5 seconds", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 110)
    } else {
      this.ctx.fillText("Tap to boost upward", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 50)
      this.ctx.fillText("Collect glowing blue crystals", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 80)
    }
    
    this.ctx.restore()
  }

  drawGameOverScreen() {
    this.ctx.save()
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
    
    this.ctx.fillStyle = "#ff4444"
    this.ctx.font = "48px Orbitron"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    
    this.ctx.fillText("GAME OVER", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 60)
    
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "24px Orbitron"
    this.ctx.fillText(`Final Score: ${this.score}`, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2)
    
    this.ctx.font = "18px Orbitron"
    this.ctx.fillText("Press SPACE or CLICK to restart", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 40)
    
    this.ctx.restore()
  }

  drawLevelCompleteScreen() {
    this.ctx.save()
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.2)"
    this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
    
    // Gradient background
    const gradient = this.ctx.createRadialGradient(
      this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, 0,
      this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, this.GAME_WIDTH / 2
    )
    gradient.addColorStop(0, "rgba(0, 255, 0, 0.3)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
    
    // Title
    this.ctx.fillStyle = "#00ff00"
    this.ctx.font = "48px Orbitron"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.strokeStyle = "#ffffff"
    this.ctx.lineWidth = 2
    this.ctx.strokeText("LEVEL COMPLETED!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 80)
    this.ctx.fillText("LEVEL COMPLETED!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 80)
    
    // Score
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "32px Orbitron"
    this.ctx.fillText(`100 POINTS REACHED!`, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 20)
    
    // Final score
    this.ctx.font = "24px Orbitron"
    this.ctx.fillText(`Final Score: ${this.score}`, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 20)
    
    // Instructions
    this.ctx.fillStyle = "#ffff00"
    this.ctx.font = "20px Orbitron"
    this.ctx.fillText("Get ready for CRYPTO SPACE!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 60)
    
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "16px Orbitron"
    this.ctx.fillText("Press SPACE or CLICK to continue", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 100)
    
    this.ctx.restore()
  }

  togglePause() {
    if (!this.gameRunning) return

    this.gamePaused = !this.gamePaused
    const pauseOverlay = document.getElementById("pauseOverlay")

    if (pauseOverlay) {
      if (this.gamePaused) {
        // 🔄 VOLVER A ORIENTACIÓN VERTICAL AL PAUSAR
        this.forceVerticalOrientation()
        pauseOverlay.classList.remove("hidden")
        
        // Pausar audio
        if (window.audioManager) {
          window.audioManager.pauseAllAudio()
        }
      } else {
        // 🔄 VOLVER A ORIENTACIÓN HORIZONTAL AL RESUMIR
        this.forceHorizontalOrientation()
        pauseOverlay.classList.add("hidden")
        
        // Reanudar audio
        if (window.audioManager) {
          window.audioManager.resumeAllAudio()
        }
      }
    }
  }

  gameOver() {
    this.gameRunning = false

    // 🔄 VOLVER A ORIENTACIÓN VERTICAL EN MÓVILES
    this.forceVerticalOrientation()

    // Reproducir sonido de game over
    if (window.audioManager) {
      window.audioManager.playGameOverSound()
    }

    // Update high scores and check for unlocks
    const unlocks = window.gameState.updateScore(this.score, this.level)

    // Show game over screen
    const finalScoreElement = document.getElementById("finalScore")
    const bestScoreElement = document.getElementById("bestScore")

    if (finalScoreElement) {
      finalScoreElement.textContent = this.score
    }

    if (bestScoreElement) {
      const bestScore = this.level === "easy" ? window.gameState.easyHighScore : window.gameState.hardHighScore
      bestScoreElement.textContent = bestScore
    }

    // Show unlock notification if any
    const unlockNotification = document.getElementById("unlockNotification")
    if (unlockNotification) {
      if (unlocks.length > 0) {
        unlockNotification.classList.remove("hidden")
      } else {
        unlockNotification.classList.add("hidden")
      }
    }

    // Submit score to leaderboards
    this.submitScoreToLeaderboards()

    const gameOverOverlay = document.getElementById("gameOverOverlay")
    const gameScreen = document.getElementById("gameScreen")
    
    // 🎯 AGREGAR CLASE PARA OCULTAR HUD Y INSTRUCCIONES
    if (gameScreen) {
      gameScreen.classList.add("game-over-active")
    }
    
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove("hidden")
    }
  }

  async submitScoreToLeaderboards() {
    try {
      // Get player name from gameState
      const playerName = window.gameState.playerName || 'Anonymous'
      
      // Submit score to backend
      const response = await window.submitGameScore(playerName, this.score, this.level)
      
      if (response && response.success) {
        // Show leaderboard position
        window.showLeaderboardPosition(response.data)
        console.log('Score submitted successfully:', response.data)
      } else {
        // Show fallback position if there's an error
        const fallbackData = {
          position: 1,
          top10: [{
            playerName: playerName,
            score: this.score,
            date: new Date().toLocaleDateString('es-ES')
          }],
          totalPlayers: 1,
          isNewRecord: true
        }
        window.showLeaderboardPosition(fallbackData)
        console.log('Using fallback leaderboard data')
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      
      // Show minimal fallback
      const fallbackData = {
        position: 1,
        top10: [{
          playerName: window.gameState.playerName || 'Anonymous',
          score: this.score,
          date: new Date().toLocaleDateString('es-ES')
        }],
        totalPlayers: 1,
        isNewRecord: true
      }
      window.showLeaderboardPosition(fallbackData)
    }
  }

  showLevelCompleteScreen() {
    this.gameRunning = false
    this.gamePaused = true
    
    // 🔄 VOLVER A ORIENTACIÓN VERTICAL EN NIVEL COMPLETADO
    this.forceVerticalOrientation()
    
    // Update high scores
    const unlocks = window.gameState.updateScore(this.score, this.level)
    
    // Show level complete screen with canvas overlay
    this.drawLevelCompleteScreen()
    
    // Add click/key listener to continue to next level
    const continueHandler = (e) => {
      if (e.type === 'keydown' && e.code !== 'Space') return
      e.preventDefault()
      
      // Remove event listeners
      document.removeEventListener('keydown', continueHandler)
      this.canvas.removeEventListener('click', continueHandler)
      
      // Go to hard mode
      this.levelCompleted = false
      this.startGame("hard")
    }
    
    document.addEventListener('keydown', continueHandler)
    this.canvas.addEventListener('click', continueHandler)
    
            console.log('Level completed! Press SPACE or CLICK to continue to Crypto Space')
  }
}

// Game control functions
function pauseGame() {
  if (window.gameEngine) {
    window.gameEngine.togglePause()
  }
}

function resumeGame() {
  if (window.gameEngine) {
    window.gameEngine.togglePause()
  }
}

function restartGame() {
  const gameOverOverlay = document.getElementById("gameOverOverlay")
  const pauseOverlay = document.getElementById("pauseOverlay")
  const gameScreen = document.getElementById("gameScreen")

  // 🎯 QUITAR CLASE PARA MOSTRAR HUD Y INSTRUCCIONES
  if (gameScreen) {
    gameScreen.classList.remove("game-over-active")
  }

  if (gameOverOverlay) gameOverOverlay.classList.add("hidden")
  if (pauseOverlay) pauseOverlay.classList.add("hidden")

  if (window.gameEngine) {
    window.gameEngine.startGame(window.gameEngine.level)
  }
}

// Initialize game engine
window.gameEngine = new GameEngine()

// 🔄 DEBUG: Funciones de orientación manual (para testing)
window.debugOrientation = {
  forceHorizontal() {
    if (window.gameEngine && window.gameEngine.forceHorizontalOrientation) {
      window.gameEngine.forceHorizontalOrientation()
      console.log('🔄 Forced horizontal orientation')
    }
  },
  
  forceVertical() {
    if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
      window.gameEngine.forceVerticalOrientation()
      console.log('🔄 Forced vertical orientation')
    }
  },
  
  unlock() {
    if (window.gameEngine && window.gameEngine.unlockOrientation) {
      window.gameEngine.unlockOrientation()
      console.log('🔄 Unlocked orientation')
    }
  },
  
  info() {
    const engine = window.gameEngine
    if (engine) {
      console.log('🔄 Orientation Control Info:')
      console.log('   - Mobile device:', engine.isMobile)
      console.log('   - Orientation API supported:', engine.orientationSupported)
      console.log('   - Current orientation:', screen.orientation ? screen.orientation.type : 'unknown')
      console.log('\n💡 Manual commands:')
      console.log('   - debugOrientation.forceHorizontal() - Force landscape')
      console.log('   - debugOrientation.forceVertical() - Force portrait')
      console.log('   - debugOrientation.unlock() - Unlock orientation')
    }
  }
}

// Debug utilities for advanced patterns
window.debugPatterns = {
  showInfo() {
    if (window.gameEngine) {
      const score = window.gameEngine.score
      const level = window.gameEngine.level
      
      console.log("🎮 ADVANCED PATTERNS INFORMATION")
      console.log(`📊 Current Score: ${score}`)
      console.log(`🎯 Game Level: ${level}`)
      
      if (level === "easy") {
        const patternLevel = Math.floor(score / 50)
        const nextPatternAt = (patternLevel + 1) * 50
        
        console.log(`🏗️ EASY LEVEL - Building Patterns:`)
        console.log(`  📈 Pattern Level: ${patternLevel}`)
        console.log(`  ⏭️ Next pattern at: ${nextPatternAt} points`)
        console.log(`  🔓 Unlocked patterns:`)
        console.log(`    • Classic: ✅ Always available`)
        console.log(`    • Narrow Tunnel: ${score >= 50 ? '✅' : '❌'} (50+ points)`)
        console.log(`    • Staircase: ${score >= 100 ? '✅' : '❌'} (100+ points)`)
        console.log(`    • Zigzag: ${score >= 150 ? '✅' : '❌'} (150+ points)`)
        console.log(`    • Maze: ${score >= 200 ? '✅' : '❌'} (200+ points)`)
      } else {
        const difficultyLevel = Math.floor(score / 10)
        
        console.log(`🌌 HARD LEVEL - Asteroid Patterns:`)
        console.log(`  📈 Difficulty Level: ${difficultyLevel + 1}`)
        console.log(`  🔓 Unlocked patterns:`)
        console.log(`    • Classic: ✅ Always available`)
        console.log(`    • Circular Wave: ${score >= 60 ? '✅' : '❌'} (60+ points)`)
        console.log(`    • V-Formation: ${score >= 80 ? '✅' : '❌'} (80+ points)`)
        console.log(`    • Rain: ${score >= 100 ? '✅' : '❌'} (100+ points)`)
      }
    } else {
      console.log("❌ The game is not started")
    }
  },
  
  forcePattern(patternName) {
    if (!window.gameEngine || !window.gameEngine.gameRunning) {
      console.log("❌ The game must be in progress to force patterns")
      return
    }
    
    const level = window.gameEngine.level
    console.log(`🔧 Forcing pattern: ${patternName}`)
    
    if (level === "easy") {
      switch(patternName.toLowerCase()) {
        case 'tunel':
        case 'narrow':
          window.gameEngine.generateNarrowTunnelPattern()
          break
        case 'escalera':
        case 'stair':
          window.gameEngine.generateStairPattern()
          break
        case 'zigzag':
          window.gameEngine.generateZigzagPattern()
          break
        case 'laberinto':
        case 'labyrinth':
          window.gameEngine.generateLabyrinthPattern()
          break
        default:
          console.log("❌ Available patterns: 'tunel', 'escalera', 'zigzag', 'laberinto'")
      }
    } else {
      switch(patternName.toLowerCase()) {
        case 'lluvia':
        case 'rain':
          window.gameEngine.generateAsteroidRainPattern(Math.floor(window.gameEngine.score / 10), true)
          break
        case 'v':
        case 'formation':
          window.gameEngine.generateVFormationPattern(Math.floor(window.gameEngine.score / 10), true)
          break
        case 'onda':
        case 'wave':
          window.gameEngine.generateCircularWavePattern(Math.floor(window.gameEngine.score / 10), true)
          break
        default:
          console.log("❌ Available patterns: 'lluvia', 'v', 'onda'")
      }
    }
  }
}

// Mostrar info de orientación al cargar
if (window.gameEngine && window.gameEngine.isMobile && window.gameEngine.orientationSupported) {
  console.log('🎮 Kokok The Roach - Control Automático de Orientación Habilitado!')
  console.log('📱 El juego rotará automáticamente a horizontal cuando juegues')
  console.log('📵 Los menús volverán a vertical automáticamente')
  console.log('🔧 Usa debugOrientation.info() para más detalles')
}

// Mostrar info de patrones avanzados
console.log('🎯 PATRONES AVANZADOS ACTIVADOS!')
console.log('🏗️ Nivel Fácil: Túnel Estrecho (50), Escalera (100), Zigzag (150), Laberinto (200)')
console.log('🌌 Nivel Difícil: Onda Circular (60), Formación V (80), Lluvia (100)')
console.log('🔧 Usa debugPatterns.showInfo() para ver detalles de tu progreso')
console.log('🎮 Usa debugPatterns.forcePattern("nombre") para probar patrones manualmente')
