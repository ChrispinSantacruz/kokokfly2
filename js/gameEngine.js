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

    // Game constants - IMPROVED PHYSICS
    this.GRAVITY = 0.4
    this.JUMP_FORCE_EASY = -10 // Stronger jump for easy mode
    this.JUMP_FORCE_HARD = -12 // Much stronger jump for hard mode (UFO)
    this.RISE_FORCE = -0.5
    this.PLAYER_SIZE = 60 // Tamaño base del jugador - se ajustará dinámicamente

    // Dynamic canvas size
    this.GAME_WIDTH = 800
    this.GAME_HEIGHT = 600

    if (this.canvas) {
      this.setupCanvas()
      this.initializeControls()
      this.setupOrientationControl()
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
      
      // Detectar si es móvil
      const isMobile = window.innerWidth <= 767
      const isExtraSmall = window.innerWidth <= 479
      const isLandscape = window.innerHeight <= 600 && window.innerWidth > window.innerHeight
      
      // Dimensiones adaptativas según el dispositivo - MÁS PANORÁMICAS
      if (isExtraSmall) {
        this.GAME_WIDTH = Math.max(rect.width, 350)  // Más ancho
        this.GAME_HEIGHT = Math.max(rect.height, 180) // Menos alto
      } else if (isMobile) {
        this.GAME_WIDTH = Math.max(rect.width, 400)  // Más ancho 
        this.GAME_HEIGHT = Math.max(rect.height, 200) // Menos alto
      } else if (isLandscape) {
        this.GAME_WIDTH = Math.max(rect.width, 600)  // Más ancho
        this.GAME_HEIGHT = Math.max(rect.height, 280) // Menos alto
      } else {
        // Desktop - dimensiones panorámicas
        this.GAME_WIDTH = Math.max(rect.width, 1000) // Más ancho
        this.GAME_HEIGHT = Math.max(rect.height, 500) // Menos alto
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
        
        // Fallback responsive - panorámico
        if (isExtraSmall) {
          this.GAME_WIDTH = 350
          this.GAME_HEIGHT = 180
        } else if (isMobile) {
          this.GAME_WIDTH = 400
          this.GAME_HEIGHT = 200
        } else {
          this.GAME_WIDTH = 1000
          this.GAME_HEIGHT = 500
        }
      }

      // Calcular tamaño del jugador proporcionalmente
      this.updatePlayerSize()

      console.log('Canvas dimensions - Width:', this.GAME_WIDTH, 'Height:', this.GAME_HEIGHT, 'Mobile:', isMobile)
      console.log('Player size:', this.PLAYER_SIZE)
      console.log('GameArea rect:', rect)

      this.canvas.width = this.GAME_WIDTH
      this.canvas.height = this.GAME_HEIGHT
      this.canvas.style.width = "100%"
      this.canvas.style.height = "100%"
      
      // Asegurar que el canvas sea visible
      this.canvas.style.display = "block"
      this.canvas.style.background = this.level === "easy" 
        ? "linear-gradient(to bottom, #87ceeb, #98fb98)" 
        : "linear-gradient(to bottom, #0a0a0a, #1a1a2e, #16213e)"
    } else {
      console.error('GameArea or canvas not found:', { gameArea, canvas: this.canvas })
    }
  }

  updatePlayerSize() {
    // Calcular tamaño del jugador basado en las dimensiones del canvas
    const baseSize = 60
    // Usar un promedio entre ancho y alto para mejor escalado panorámico
    const scaleFactor = Math.min(this.GAME_WIDTH / 1000, this.GAME_HEIGHT / 500) // Basado en las dimensiones de referencia
    this.PLAYER_SIZE = Math.max(25, Math.min(120, baseSize * scaleFactor))
  }

  setupOrientationControl() {
    // Detectar si es móvil y si la API está disponible
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
      
      // Esperar un momento para que se complete la rotación
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
      
      // Esperar un momento para que se complete la rotación
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

    // Si el juego no ha empezado, empezar con la primera input
    if (!this.gameStarted && isPressed) {
      this.gameStarted = true
      // Establecer el tiempo inicial para dar un período de gracia antes del primer obstáculo
      this.lastObstacleTime = Date.now() + 1000 // 1 segundo extra de gracia
      
      // Actualizar instrucciones
      const instructionText =
        this.level === "easy"
          ? "¡Mantén presionado para subir, suelta para bajar!"
          : "¡Toca para impulsarte! Recoge cristales azules brillantes"
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
      } else {
        // Hard mode: UFO tap to boost - MEJORADO
        if (isPressed) {
          this.player.velocityY = -4.5 // Impulso más fuerte para UFO
        }
      }
    }
  }

  startGame(level) {
    console.log('Starting game with level:', level)
    
    // ACTUALIZAR EL GAMESTATE PRIMERO
    window.gameState.currentLevel = level
    
    this.level = level
    this.gameRunning = true
    this.gamePaused = false // ASEGURAR QUE NO ESTÉ PAUSADO
    this.gameStarted = false // El juego no empieza hasta que el usuario presione una tecla
    this.gameStartTime = Date.now()
    this.score = 0
    this.baseGameSpeed = level === "easy" ? 10 : 5.5
    this.gameSpeed = this.baseGameSpeed
    this.maxGameSpeed = level === "easy" ? 20 : 16
    this.obstacles = []
    this.particles = []
    this.lastGapPosition = "middle"
    this.previousScore = 0 // Para trackear incrementos de velocidad
    this.levelCompleted = false // Para controlar cuando se completa el nivel
    this.shieldActive = false // Estado del escudo
    this.shieldEndTime = 0 // Cuándo termina el escudo

    // Limpiar overlays de pausa/game over que puedan estar activos
    const pauseOverlay = document.getElementById("pauseOverlay")
    const gameOverOverlay = document.getElementById("gameOverOverlay")
    if (pauseOverlay) pauseOverlay.classList.add("hidden")
    if (gameOverOverlay) gameOverOverlay.classList.add("hidden")

    // Update canvas size immediately
    this.updateCanvasSize()
    
    console.log('Game dimensions after update - Width:', this.GAME_WIDTH, 'Height:', this.GAME_HEIGHT)

    // Initialize player using a safe position - optimized for panoramic view
    const safeY = this.GAME_HEIGHT / 2
    const playerX = this.GAME_WIDTH * 0.15 // Posicionar al jugador más hacia la izquierda (15% del ancho)
    this.player = new window.Player(playerX, safeY, this.level, this.PLAYER_SIZE)
    console.log('Player initialized:', this.player)
    console.log('Player position - x:', this.player.x, 'y:', this.player.y)
    console.log('Current vehicle for level', this.level, ':', window.gameState.getCurrentVehicle())
    
    // Asegurar que no esté pausado después de la inicialización
    this.gamePaused = false
    this.gameRunning = true

    // 🔄 FORZAR ORIENTACIÓN HORIZONTAL EN MÓVILES
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
      currentLevelElement.textContent = level.toUpperCase() + " MODE"
    }
    if (gameScoreElement) {
      gameScoreElement.textContent = "0"
    }

    // Update instructions
    const instructionText =
      level === "easy"
        ? "¡Presiona ESPACIO o CLICK para empezar! Mantén presionado para subir"
        : "¡Presiona ESPACIO o CLICK para empezar! Recolecta cristales azules"
    const gameInstructionElement = document.getElementById("gameInstructionText")
    if (gameInstructionElement) {
      gameInstructionElement.textContent = instructionText
    }

    // Start game loop
    this.lastObstacleTime = 0
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
    // Verificar si el jugador ya fue inicializado
    if (!this.player) {
      console.log('Player not yet initialized, skipping update')
      return
    }

    // Solo actualizar si el juego ha empezado
    if (!this.gameStarted) {
      // Mantener el jugador en posición inicial con suave flotación
      const centerY = this.GAME_HEIGHT / 2
      this.player.y = centerY + Math.sin(Date.now() * 0.003) * 10
      this.player.x = 100 // Mantener posición X fija
      this.player.velocityY = 0 // Sin velocidad vertical
      return
    }

    // Check for level completion (300 points in easy mode)
    if (this.level === "easy" && this.score >= 300 && !this.levelCompleted) {
      this.levelCompleted = true
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
      // Primer obstáculo al segundo, luego intervalos variables según velocidad
      const timeSinceStart = now - this.lastObstacleTime
      const isFirstObstacle = this.obstacles.length === 0
      
      if (isFirstObstacle) {
        // Primer obstáculo al segundo
        if (timeSinceStart < 1000) return
      } else {
        // Intervalos EXTREMADAMENTE frecuentes para acción súper intensa
        const progressFactor = Math.min(this.score / 40, 1) // 0 a 1 basado en 40 puntos (súper rápido)
        const baseInterval = 1200 - progressFactor * 600 // De 1.2s a 0.6s (EXTREMADAMENTE frecuente)
        const speedMultiplier = Math.max(0.25, 1 - (this.gameSpeed - this.baseGameSpeed) * 0.06)
        const randomVariation = Math.random() * 150 + 50 // Variación 50-200ms (menos variación)
        const interval = baseInterval * speedMultiplier + randomVariation
        
        if (timeSinceStart < interval) return
      }
    } else {
      // Modo difícil - intervalos desafiantes pero manejables
      const timeSinceStart = now - this.lastObstacleTime
      const difficultyLevel = Math.floor(this.score / 10) // Nivel de dificultad cada 10 puntos
      const baseInterval = 1000 // Cada 1 segundo base
      const progressFactor = Math.min(this.score / 10, 1) // Escala más gradual
      const difficultyReduction = difficultyLevel * 50 // Reducir 50ms por nivel
      const interval = Math.max(400, baseInterval - progressFactor * 400 - difficultyReduction) // Mínimo 400ms
      
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
    // Progresión SÚPER intensa para máximo desafío
    const difficultyFactor = Math.min(this.score / 30, 1) // 0 a 1 basado en 30 puntos (súper activo)
    const speedFactor = (this.gameSpeed - this.baseGameSpeed) / (this.maxGameSpeed - this.baseGameSpeed)
    const scoreLevel = Math.floor(this.score / 50) // Cada 50 puntos = nuevo nivel de patrones
    
    // Seleccionar patrón según la puntuación
    const patternChance = Math.random()
    
    if (this.score >= 200 && patternChance < 0.15) {
      // Patrón "Laberinto" (puntuación muy alta)
      this.generateLabyrinthPattern()
    } else if (this.score >= 150 && patternChance < 0.25) {
      // Patrón "Zigzag" (puntuación alta)
      this.generateZigzagPattern()
    } else if (this.score >= 100 && patternChance < 0.35) {
      // Patrón "Escalera" (puntuación media-alta)
      this.generateStairPattern()
    } else if (this.score >= 50 && patternChance < 0.45) {
      // Patrón "Túnel estrecho" (puntuación media)
      this.generateNarrowTunnelPattern()
    } else {
      // Patrón clásico mejorado
      this.generateClassicPattern(difficultyFactor, speedFactor)
    }
  }

  generateClassicPattern(difficultyFactor, speedFactor) {
    // Probabilidad de obstáculos múltiples MUY alta
    const multipleChance = difficultyFactor * 0.6 + speedFactor * 0.4 // Máximo 100%!
    
    // Decidir si generar múltiples edificios
    if (Math.random() < multipleChance && this.score > 20) { // Múltiples edificios desde los 20 puntos
      // Probabilidad ALTA de múltiples edificios
      const shouldGenerateSecond = Math.random() < 0.85 // 85% chance de segundo edificio
      const shouldGenerateThird = Math.random() < 0.6 && this.score > 60 // 60% chance de tercero después de 60 puntos
      const shouldGenerateFourth = Math.random() < 0.4 && this.score > 120 // 40% chance de cuarto después de 120 puntos
      
      // Primer edificio
      this.generateBuildingPair()
      
      // Segundo edificio con espaciado más cerrado
      if (shouldGenerateSecond) {
        const minSpacing = 400 + speedFactor * 100 // Mínimo 400px, hasta 500px (ajustado para edificios anchos)
        const spacing = minSpacing + Math.random() * 150 // Variación reducida
        this.generateBuildingPair(spacing)
      }
      
      // Tercer edificio
      if (shouldGenerateThird && shouldGenerateSecond) {
        const extraSpacing = 700 + speedFactor * 150 // Mínimo 700px, hasta 850px (ajustado para edificios anchos)
        const spacing = extraSpacing + Math.random() * 200
        this.generateBuildingPair(spacing)
      }
      
      // Cuarto edificio (solo en puntuaciones muy altas)
      if (shouldGenerateFourth && shouldGenerateThird && shouldGenerateSecond) {
        const megaSpacing = 1000 + speedFactor * 200 // Mínimo 1000px, hasta 1200px (ajustado para edificios anchos)
        const spacing = megaSpacing + Math.random() * 250
        this.generateBuildingPair(spacing)
      }
    } else {
      // Edificio simple
      this.generateBuildingPair()
    }
  }

  generateNarrowTunnelPattern() {
    // Túnel estrecho con gaps más pequeños
    const narrowGapReduction = 50 + Math.random() * 50 // Reducir gap 50-100px
    this.generateBuildingPair(0, narrowGapReduction)
    
    // Segundo túnel estrecho cerca
    const spacing = 350 + Math.random() * 100
    this.generateBuildingPair(spacing, narrowGapReduction)
    
                console.log("🚧 Narrow Tunnel Pattern generated")
  }

  generateStairPattern() {
    // Escalera ascendente o descendente
    const isAscending = Math.random() < 0.5
    const baseHeight = 100
    const stepSize = 60
    
    for (let i = 0; i < 4; i++) {
      const spacing = i * 280
      const heightModifier = isAscending ? i * stepSize : (3 - i) * stepSize
      this.generateBuildingPair(spacing, 0, heightModifier)
    }
    
          console.log(`🪜 Staircase Pattern ${isAscending ? 'Ascending' : 'Descending'} generated`)
  }

  generateZigzagPattern() {
    // Patrón zigzag con gaps alternos
    const positions = ['top', 'bottom', 'top', 'bottom']
    
    for (let i = 0; i < 4; i++) {
      const spacing = i * 300
      const forcedPosition = positions[i]
      this.generateBuildingPair(spacing, 0, 0, forcedPosition)
    }
    
          console.log("⚡ Zigzag Pattern generated")
  }

  generateLabyrinthPattern() {
    // Patrón complejo tipo laberinto
    const patterns = [
      { spacing: 0, gap: 0, height: 50, position: 'top' },
      { spacing: 200, gap: -30, height: -50, position: 'bottom' },
      { spacing: 400, gap: -50, height: 30, position: 'top' },
      { spacing: 600, gap: -20, height: -30, position: 'bottom' },
      { spacing: 800, gap: 0, height: 0, position: 'top' }
    ]
    
    patterns.forEach(pattern => {
      this.generateBuildingPair(pattern.spacing, pattern.gap, pattern.height, pattern.position)
    })
    
          console.log("🌀 Maze Pattern generated")
  }

  generateBuildingPair(xOffset = 0, gapReduction = 0, heightModifier = 0, forcedPosition = null) {
    const minHeight = 80
    const maxHeight = 400
    
    // Usar posición forzada o aleatoria
    let gapPosition
    if (forcedPosition) {
      gapPosition = forcedPosition
    } else {
      // Generación SÚPER ALEATORIA - "así de loco"
      // Alternar completamente aleatorio entre arriba y abajo
      const positions = ["top", "bottom"]
      gapPosition = positions[Math.floor(Math.random() * positions.length)]
    }
    
    this.lastGapPosition = gapPosition
    
    let topHeight, gap
    
    // Gaps cómodos para navegación y recolección
    const speedFactor = Math.min((this.gameSpeed - this.baseGameSpeed) / (this.maxGameSpeed - this.baseGameSpeed), 1)
    const extraGap = speedFactor * 120 // 120px extra cuando esté a máxima velocidad
    const baseGap = 300 + Math.random() * 100 + extraGap
    
    if (gapPosition === "top") {
      // Gap arriba - edificio de abajo muy alto
      topHeight = minHeight + Math.random() * 80 + heightModifier // Edificio superior pequeño + modificador
      gap = Math.max(200, baseGap - gapReduction) // Gap ajustado pero con mínimo
    } else {
      // Gap abajo - edificio de arriba muy alto
      topHeight = maxHeight - Math.random() * 80 + heightModifier // Edificio superior grande + modificador
      gap = Math.max(200, baseGap - gapReduction) // Gap ajustado pero con mínimo
    }
    
    // Asegurar límites realistas
    topHeight = Math.max(minHeight, Math.min(maxHeight, topHeight))

    const xPos = this.GAME_WIDTH + xOffset
    
    // Dimensiones diferenciadas para mejor aspecto visual
    const airBuildingWidth = 100  // Más estrecho para obstáculos aéreos
    const groundBuildingWidth = 140  // Más ancho para edificios del suelo
    
    // Ajustar altura de obstáculos aéreos para mejor proporción
    let adjustedTopHeight = topHeight
    if (gapPosition === "bottom") {
      // Si el gap está abajo, el edificio de arriba es muy alto
      // Reducir un poco la altura para mejor proporción con las imágenes
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

    // Calculate bottom building height and validate
    const bottomY = adjustedTopHeight + gap
    const bottomHeight = this.GAME_HEIGHT - bottomY
    
    if (bottomHeight <= 0) {
      console.warn('Bottom building height is invalid:', {
        bottomHeight: bottomHeight,
        topHeight: adjustedTopHeight,
        gap: gap,
        GAME_HEIGHT: this.GAME_HEIGHT
      })
      return
    }

    // Crear edificios con dimensiones optimizadas
    this.obstacles.push(new window.Building(xPos, 0, airBuildingWidth, adjustedTopHeight, "top"))
    this.obstacles.push(
      new window.Building(xPos, bottomY, groundBuildingWidth, bottomHeight, "bottom"),
    )
    
    // 15% chance de generar algo en el gap (gema o power-up) - reducido más
    if (Math.random() < 0.15) {
      const itemSize = 25
      const itemX = xPos + airBuildingWidth / 2 - itemSize / 2
      
      // 12% chance de power-up de escudo, 88% chance de gema - aumentado escudo
      const isShieldPowerUp = Math.random() < 0.12
      
      if (isShieldPowerUp) {
        // Crear power-up de escudo que CAE DEL CIELO
        const shieldPowerUp = {
          x: itemX,
          y: 0, // Empieza en la parte superior
          size: itemSize,
          type: "shield",
          collected: false,
          passed: false,
          velocityY: 2, // Velocidad de caída
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
              this.y += this.velocityY // Caer del cielo
            }
          }
        }
        
        this.obstacles.push(shieldPowerUp)
      } else {
        // Crear gema EN EL CENTRO DEL GAP - diferentes tipos
        const gemY = adjustedTopHeight + gap / 2 - itemSize / 2 // Posición Y correcta en el gap
        
        // Determinar tipo de gema (50% azul, 35% amarilla, 15% roja) - reducido azul
        const gemRand = Math.random()
        let gemType, gemValue, gemColor, shadowColor, strokeColor
        
        if (gemRand < 0.50) {
          // Gema azul - 1 punto
          gemType = "gem_blue"
          gemValue = 1
          gemColor = "#00BFFF"
          shadowColor = "#00BFFF" 
          strokeColor = "#0099FF"
        } else if (gemRand < 0.85) {
          // Gema amarilla - 2 puntos
          gemType = "gem_yellow"
          gemValue = 2
          gemColor = "#FFD700"
          shadowColor = "#FFD700"
          strokeColor = "#FFA500"
        } else {
          // Gema roja - 5 puntos
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
        // Crear gema - diferentes tipos
        // Determinar tipo de gema (50% azul, 35% amarilla, 15% roja)
        const gemRand = Math.random()
        let gemType, gemValue, gemColor, shadowColor, strokeColor
        
        if (gemRand < 0.50) {
          // Gema azul - 1 punto
          gemType = "gem_blue"
          gemValue = 1
          gemColor = "#00BFFF"
          shadowColor = "#00BFFF" 
          strokeColor = "#0099FF"
        } else if (gemRand < 0.85) {
          // Gema amarilla - 2 puntos
          gemType = "gem_yellow"
          gemValue = 2
          gemColor = "#FFD700"
          shadowColor = "#FFD700"
          strokeColor = "#FFA500"
        } else {
          // Gema roja - 5 puntos
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
      const incrementValue = 0.5 // Incrementos moderados
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

    // Draw UI
    this.drawUI()
  }

  drawUI() {
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
    
    this.ctx.restore()
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
      ? "¡Presiona ESPACIO o CLICK para empezar!" 
      : "¡Presiona ESPACIO o CLICK para empezar!"
    
    this.ctx.fillText(message, this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2)
    
    // Add instructions
    this.ctx.font = "18px Orbitron"
    if (this.level === "easy") {
      this.ctx.fillText("Mantén presionado para subir", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 50)
      this.ctx.fillText("Recoge gemas doradas y power-ups azules", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 80)
      this.ctx.fillText("El escudo te protege por 5 segundos", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 110)
    } else {
      this.ctx.fillText("Toca para impulsar hacia arriba", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 50)
      this.ctx.fillText("Recolecta cristales azules brillantes", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 80)
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
    this.ctx.fillText("Presiona ESPACIO o CLICK para reiniciar", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 40)
    
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
    this.ctx.strokeText("¡NIVEL COMPLETADO!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 80)
    this.ctx.fillText("¡NIVEL COMPLETADO!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 80)
    
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
    this.ctx.fillText("¡Prepárate para el MODO DIFÍCIL!", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 60)
    
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "16px Orbitron"
    this.ctx.fillText("Presiona ESPACIO o CLICK para continuar", this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 + 100)
    
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
      } else {
        // 🔄 VOLVER A ORIENTACIÓN HORIZONTAL AL RESUMIR
        this.forceHorizontalOrientation()
        pauseOverlay.classList.add("hidden")
      }
    }
  }

  gameOver() {
    this.gameRunning = false

    // 🔄 VOLVER A ORIENTACIÓN VERTICAL EN MÓVILES
    this.forceVerticalOrientation()

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
    
    console.log('Level completed! Press SPACE or CLICK to continue to Hard mode')
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
