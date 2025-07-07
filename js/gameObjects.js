// Game Objects - FIXED VERSION

// Sistema de precarga de imágenes building
class BuildingImagePreloader {
  constructor() {
    this.images = {
      // Imágenes building (aéreos)
      building: {},
      // Imágenes de suelo
      ground: {}
    }
    this.loadingPromises = []
    this.isLoaded = false
  }

  preloadAllImages() {
    console.log("Precargando imágenes building...")
    
    // Precargar imágenes building (1-6)
    for (let i = 1; i <= 6; i++) {
      const key = `building-${i.toString().padStart(2, '0')}`
      const image = new Image()
      
      const loadPromise = new Promise((resolve, reject) => {
        image.onload = () => {
          console.log(`✓ Imagen building ${i} cargada`)
          resolve()
        }
        image.onerror = () => {
          console.warn(`✗ Error cargando imagen building ${i}`)
          reject()
        }
      })
      
      this.loadingPromises.push(loadPromise)
      this.images.building[key] = image
      image.src = `images/obstaculos/building-${i.toString().padStart(2, '0')}.png`
    }
    
    // Precargar imágenes de suelo (1-4)
    for (let i = 1; i <= 4; i++) {
      const key = `ground-${i}`
      const image = new Image()
      
      const loadPromise = new Promise((resolve, reject) => {
        image.onload = () => {
          console.log(`✓ Imagen suelo ${i} cargada`)
          resolve()
        }
        image.onerror = () => {
          console.warn(`✗ Error cargando imagen suelo ${i}`)
          reject()
        }
      })
      
      this.loadingPromises.push(loadPromise)
      this.images.ground[key] = image
      image.src = `images/obstaculo${i}piso.png`
    }
    
    // Esperar a que todas las imágenes se carguen
    return Promise.all(this.loadingPromises).then(() => {
      this.isLoaded = true
      console.log("✓ Todas las imágenes building precargadas exitosamente")
    }).catch(() => {
      console.warn("✗ Algunas imágenes no pudieron cargarse")
    })
  }
  
  getRandomBuildingImage() {
    if (!this.isLoaded) return null
    const randomIndex = Math.floor(Math.random() * 6) + 1
    const key = `building-${randomIndex.toString().padStart(2, '0')}`
    return this.images.building[key]
  }
  
  getRandomGroundImage() {
    if (!this.isLoaded) return null
    const randomIndex = Math.floor(Math.random() * 4) + 1
    const key = `ground-${randomIndex}`
    return this.images.ground[key]
  }
}

// Instancia global del precargador
window.buildingPreloader = new BuildingImagePreloader()

// Debug utilities for building rendering
window.debugBuildings = {
  enable: () => { window.DEBUG_BUILDINGS = true; console.log("Building debug mode enabled - You can now see collision boxes"); },
  disable: () => { window.DEBUG_BUILDINGS = false; console.log("Building debug mode disabled"); },
  status: () => console.log("Building debug mode:", window.DEBUG_BUILDINGS ? "ON" : "OFF"),
  toggle: () => { 
    window.DEBUG_BUILDINGS = !window.DEBUG_BUILDINGS; 
    console.log("Building debug mode:", window.DEBUG_BUILDINGS ? "ON" : "OFF");
  },
  preloadStatus: () => {
    console.log("🔍 DIAGNÓSTICO DEL SISTEMA DE PRECARGA");
    console.log("=====================================");
    
    if (window.buildingPreloader) {
      const preloader = window.buildingPreloader;
      console.log("✅ Building preloader existe");
      console.log("📊 Estado de carga:", preloader.isLoaded ? "✅ COMPLETO" : "❌ PENDIENTE");
      console.log("🏢 Imágenes building:", Object.keys(preloader.images.building).length, "/ 6");
      console.log("🏠 Imágenes suelo:", Object.keys(preloader.images.ground).length, "/ 4");
      console.log("🔄 Promesas de carga:", preloader.loadingPromises.length);
      
      console.log("\n🏢 IMÁGENES BUILDING:");
      Object.entries(preloader.images.building).forEach(([key, img]) => {
        console.log(`  ${key}: ${img.complete ? '✅' : '❌'} (${img.src})`);
      });
      
      console.log("\n🏠 IMÁGENES SUELO:");
      Object.entries(preloader.images.ground).forEach(([key, img]) => {
        console.log(`  ${key}: ${img.complete ? '✅' : '❌'} (${img.src})`);
      });
      
      // Test de obtención de imágenes
      console.log("\n🧪 TEST DE OBTENCIÓN:");
      const testBuilding = preloader.getRandomBuildingImage();
      const testGround = preloader.getRandomGroundImage();
      console.log("  Building aleatorio:", testBuilding ? "✅" : "❌");
      console.log("  Suelo aleatorio:", testGround ? "✅" : "❌");
      
    } else {
      console.log("❌ Building preloader NO EXISTE");
      console.log("💡 Intenta recargar la página o ejecutar debugBuildings.forcePreload()");
    }
  },
  forcePreload: () => {
    console.log("🔄 Forzando recarga del sistema...");
    
    if (!window.buildingPreloader) {
      console.log("🔧 Creando building preloader...");
      window.buildingPreloader = new BuildingImagePreloader();
    }
    
    window.buildingPreloader.preloadAllImages().then(() => {
      console.log("✅ Precarga forzada completada");
      window.debugBuildings.preloadStatus();
    }).catch((error) => {
      console.error("❌ Error en precarga forzada:", error);
    });
  },
  fixLag: () => {
    console.log("🔧 EJECUTANDO CORRECCIÓN DE LAG...");
    console.log("1. Verificando building preloader...");
    
    if (!window.buildingPreloader) {
      console.log("2. ❌ No existe - Creando nuevo...");
      window.buildingPreloader = new BuildingImagePreloader();
    } else {
      console.log("2. ✅ Existe");
    }
    
    console.log("3. Forzando precarga completa...");
    return window.buildingPreloader.preloadAllImages().then(() => {
      console.log("4. ✅ CORRECCIÓN COMPLETADA");
      console.log("💡 El lag debería estar eliminado ahora");
      window.debugBuildings.preloadStatus();
    }).catch((error) => {
      console.log("4. ❌ Error en corrección:", error);
    });
  }
};

// Player class
class GamePlayer {
  constructor(x, y, level, size = 60) {
    this.x = x
    this.y = y
    this.size = size
    this.velocityY = 0
    this.level = level
    this.isHolding = false
    this.rotation = 0
    this.imageLoaded = false
    this.imageError = false

    // Load player image
    this.image = new Image()
    this.image.onload = () => {
      this.imageLoaded = true
      console.log('Player image loaded successfully:', this.image.src)
    }
    this.image.onerror = () => {
      this.imageError = true
      console.warn('Error loading player image:', this.image.src)
    }
    this.image.src = this.getPlayerImage()
    
    console.log('Player created at:', this.x, this.y, 'Level:', this.level)
  }

  getPlayerImage() {
    const vehicle = window.gameState.getCurrentVehicle()
    if (vehicle && vehicle.image) {
      return vehicle.image
    }
    // Fallback to default images based on level
    return this.level === "easy" ? "images/kokok-rocket.png" : "images/kokok-ufo.png"
  }

  update(gravity, riseForce, gameHeight, playerSize, level) {
    // IMPROVED PHYSICS FOR BOTH MODES - SUAVIZADO
    if (level === "easy") {
      // Easy mode: Hold to rise, release to fall
      if (this.isHolding) {
        this.velocityY += riseForce * 0.8 // Reducido para mayor control
      } else {
        this.velocityY += gravity * 0.6 // Gravedad más suave
      }

      // Terminal velocity for easy mode - REDUCIDO
      this.velocityY = Math.max(-8, Math.min(8, this.velocityY))
    } else {
      // Hard mode: UFO physics - MUY MEJORADO
      this.velocityY += gravity * 0.4 // Gravedad muy reducida para UFO

      // Terminal velocity for hard mode - MUY REDUCIDO
      this.velocityY = Math.max(-7, Math.min(7, this.velocityY))
    }

    // Update position
    this.y += this.velocityY

    // Update rotation based on velocity - SUAVIZADO
    this.rotation = Math.max(-12, Math.min(12, this.velocityY * 1.2))

    // Boundaries - MEJORADO
    if (this.y < 0) {
      this.y = 0
      this.velocityY = Math.max(0, this.velocityY) // Don't bounce off top
    }
    if (this.y > gameHeight - playerSize) {
      this.y = gameHeight - playerSize
      this.velocityY = Math.min(0, this.velocityY) // Don't bounce off bottom
    }
  }

  render(ctx, size) {
    if (!ctx) {
      console.error('No context provided to render player')
      return
    }

    ctx.save()

    // Dimensiones diferentes para modo fácil - más ancho
    const width = this.level === "easy" ? size * 1.4 : size // 40% más ancho en modo fácil
    const height = size

    // Move to player center for rotation
    ctx.translate(this.x + width / 2, this.y + height / 2)
    ctx.rotate((this.rotation * Math.PI) / 180)

    // Always try to draw fallback first to ensure something is visible
    let imageDrawn = false
    
    // Try to draw player image
    if (this.imageLoaded && this.image.complete && !this.imageError) {
      try {
        ctx.drawImage(this.image, -width / 2, -height / 2, width, height)
        imageDrawn = true
      } catch (error) {
        console.warn('Error drawing image:', error)
        imageDrawn = false
      }
    }

    // If image wasn't drawn, always draw fallback
    if (!imageDrawn) {
      this.drawFallback(ctx, width, height)
    }

    ctx.restore()
  }

  drawFallback(ctx, width, height) {
    // Fallback with different shapes and colors for each mode
    if (this.level === "easy") {
      // Ship fallback - rocket shape más ancho
      ctx.fillStyle = "#ff6b6b"
      ctx.fillRect(-width / 2, -height / 2, width, height)
      
      // Rocket tip - adaptado a la nueva anchura
      ctx.fillStyle = "#ff5252"
      ctx.beginPath()
      ctx.moveTo(-width / 2, -height / 2)
      ctx.lineTo(0, -height / 2 - 10)
      ctx.lineTo(width / 2, -height / 2)
      ctx.closePath()
      ctx.fill()
      
      // Window - centrada en el nuevo tamaño
      ctx.fillStyle = "#87ceeb"
      ctx.fillRect(-width / 8, -height / 6, width / 4, height / 3)
      
      // Engines/thrusters - múltiples para nave más ancha
      ctx.fillStyle = "#ff8a80"
      ctx.fillRect(-width / 2 + width * 0.1, height / 2 - 8, width * 0.15, 8)
      ctx.fillRect(width / 2 - width * 0.25, height / 2 - 8, width * 0.15, 8)
    } else {
      // UFO fallback - saucer shape (se mantiene igual)
      ctx.fillStyle = "#4dabf7"
      ctx.beginPath()
      ctx.ellipse(0, 0, width / 2, height / 4, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // UFO dome
      ctx.fillStyle = "#74c0fc"
      ctx.beginPath()
      ctx.ellipse(0, -height / 8, width / 4, height / 8, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // UFO lights
      ctx.fillStyle = "#ffeb3b"
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        const x = Math.cos(angle) * width / 3
        const y = Math.sin(angle) * height / 6
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }
}

// Building class (for easy mode) - COMPLETELY STATIC
class GameBuilding {
  constructor(x, y, width, height, side) {
    // Validate input parameters
    this.x = isFinite(x) ? x : 0
    this.y = isFinite(y) ? y : 0
    this.width = isFinite(width) && width > 0 ? width : 100
    this.height = isFinite(height) && height > 0 ? height : 100
    this.type = "building"
    this.side = side // 'top' or 'bottom'
    this.passed = false
    
    // Cargar imagen apropiada según el lado y seleccionar aleatoriamente
    this.loadBuildingImage()
    
    // Debug log for invalid values
    if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
      console.warn('Building created with invalid parameters:', {
        originalX: x, originalY: y, originalWidth: width, originalHeight: height,
        correctedX: this.x, correctedY: this.y, correctedWidth: this.width, correctedHeight: this.height
      })
    }
  }

  loadBuildingImage() {
    // Verificación mejorada del sistema de precarga
    const preloaderAvailable = window.buildingPreloader && window.buildingPreloader.isLoaded
    
    if (preloaderAvailable) {
      // MÉTODO 1: Usar imágenes precargadas (SIN LAG)
      if (this.side === "bottom") {
        // Edificios del suelo - usar imágenes precargadas
        this.image = window.buildingPreloader.getRandomGroundImage()
      } else {
        // Edificios del aire - usar imágenes building precargadas
        this.image = window.buildingPreloader.getRandomBuildingImage()
      }
      
      if (this.image && this.image.complete) {
        this.imageLoaded = true
        this.imageError = false
        this.originalWidth = this.image.naturalWidth
        this.originalHeight = this.image.naturalHeight
        
        if (window.DEBUG_BUILDINGS) {
          console.log(`✅ PRECARGADA: ${this.image.src} (${this.originalWidth}x${this.originalHeight})`)
        }
        return // ✅ ÉXITO - Sin lag
      }
    }
    
    // MÉTODO 2: Intentar esperar a que la precarga termine
    if (window.buildingPreloader && !window.buildingPreloader.isLoaded) {
      console.warn(`⏳ Esperando precarga... (isLoaded: ${window.buildingPreloader.isLoaded})`)
      
      // Intentar usar las imágenes aunque no estén completamente listas
      const image = this.side === "bottom" 
        ? window.buildingPreloader.getRandomGroundImage()
        : window.buildingPreloader.getRandomBuildingImage()
        
      if (image) {
        this.image = image
        // Verificar si ya está cargada
        if (image.complete) {
          this.imageLoaded = true
          this.imageError = false
          this.originalWidth = image.naturalWidth
          this.originalHeight = image.naturalHeight
          console.log(`⚡ Imagen disponible inmediatamente: ${image.src}`)
          return
        } else {
          // Esperar a que termine de cargar
          this.imageLoaded = false
          this.imageError = false
          this.originalWidth = 0
          this.originalHeight = 0
          
          image.addEventListener('load', () => {
            this.imageLoaded = true
            this.originalWidth = image.naturalWidth
            this.originalHeight = image.naturalHeight
            console.log(`⚡ Imagen cargada (modo espera): ${image.src}`)
          })
          
          image.addEventListener('error', () => {
            this.imageError = true
            console.warn(`❌ Error cargando (modo espera): ${image.src}`)
          })
          
          return
        }
      }
    }
    
    // MÉTODO 3: Fallback dinámico (CON LAG) - Solo como último recurso
    console.warn("🐌 FALLBACK DINÁMICO - Esto causará lag")
    
    this.image = new Image()
    this.imageLoaded = false
    this.imageError = false
    this.originalWidth = 0
    this.originalHeight = 0
    
    // Seleccionar imagen aleatoria según el lado
    if (this.side === "bottom") {
      const randomIndex = Math.floor(Math.random() * 4) + 1
      this.image.src = `images/obstaculo${randomIndex}piso.png`
    } else {
      const randomIndex = Math.floor(Math.random() * 6) + 1
      this.image.src = `images/obstaculos/building-${randomIndex.toString().padStart(2, '0')}.png`
    }
    
    this.image.onload = () => {
      this.imageLoaded = true
      this.originalWidth = this.image.naturalWidth
      this.originalHeight = this.image.naturalHeight
      console.log(`🐌 Fallback cargado: ${this.image.src}`)
    }
    
    this.image.onerror = () => {
      this.imageError = true
      console.warn('❌ Error en fallback:', this.image.src)
    }
  }

  update(gameSpeed) {
    // Validate gameSpeed to prevent corruption
    if (!isFinite(gameSpeed) || gameSpeed < 0) {
      console.warn('Invalid gameSpeed provided to building update:', gameSpeed)
      return
    }
    
    // Only move horizontally - completely static vertically
    this.x -= gameSpeed
  }

  render(ctx) {
    // Validate building properties to prevent createLinearGradient errors
    if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.width) || !isFinite(this.height)) {
      console.warn('Building has invalid properties:', {
        x: this.x, y: this.y, width: this.width, height: this.height
      })
      return
    }

    ctx.save()
    
    // Intentar dibujar la imagen, si no está cargada usar fallback
    let imageDrawn = false
    if (this.imageLoaded && this.image && this.image.complete && !this.imageError && this.originalWidth > 0 && this.originalHeight > 0) {
      try {
        if (this.side === "top") {
          // OBSTÁCULOS AÉREOS - Imagen completa sin espacios, puede ser más grande que la box collider
          
          // Calcular escalas para ancho y alto
          const scaleX = this.width / this.originalWidth
          const scaleY = this.height / this.originalHeight
          
          // Usar la escala MAYOR para asegurar que no haya espacios vacíos
          // Esto significa que la imagen puede ser más grande que la box collider
          const scale = Math.max(scaleX, scaleY)
          
          // Calcular dimensiones finales
          const imageWidth = this.originalWidth * scale
          const imageHeight = this.originalHeight * scale
          
          // Centrar la imagen en la box collider
          const imageX = this.x + (this.width - imageWidth) / 2
          const imageY = this.y + (this.height - imageHeight) / 2
          
          // Dibujar la imagen escalada (puede extenderse más allá de la box collider)
          ctx.drawImage(this.image, imageX, imageY, imageWidth, imageHeight)
          
          // DEBUG: Dibujar el borde del área de colisión (solo si está activado)
          if (window.DEBUG_BUILDINGS) {
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
            ctx.lineWidth = 2
            ctx.strokeRect(this.x, this.y, this.width, this.height)
            
            // Mostrar dimensiones
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
            ctx.fillRect(this.x, this.y - 25, 120, 20)
            ctx.fillStyle = "white"
            ctx.font = "12px Arial"
            ctx.fillText(`${this.width}x${this.height}`, this.x + 5, this.y - 10)
          }
        } else {
          // EDIFICIOS DEL SUELO - Imagen completa pero más estricta con la box collider
          
          // Calcular escalas para ancho y alto
          const scaleX = this.width / this.originalWidth
          const scaleY = this.height / this.originalHeight
          
          // Usar la escala mayor pero con un límite para ser más estricto
          const baseScale = Math.max(scaleX, scaleY)
          // Limitar la escala para que no se extienda demasiado (máximo 15% extra)
          const scale = Math.min(baseScale, Math.max(scaleX, scaleY) * 1.15)
          
          // Calcular dimensiones finales
          const imageWidth = this.originalWidth * scale
          const imageHeight = this.originalHeight * scale
          
          // Centrar la imagen en la box collider
          const imageX = this.x + (this.width - imageWidth) / 2
          const imageY = this.y + (this.height - imageHeight) / 2
          
          // Dibujar la imagen escalada (limitada para ser más estricta)
          ctx.drawImage(this.image, imageX, imageY, imageWidth, imageHeight)
        }
        
        imageDrawn = true
      } catch (error) {
        console.warn('Error drawing building image:', error)
        imageDrawn = false
      }
    }
    
    // Si la imagen no se pudo dibujar, usar fallback
    if (!imageDrawn) {
      this.drawFallback(ctx)
    }
    
    ctx.restore()
  }

  drawFallback(ctx) {
    // Fallback para dibujar edificios sin imagen
    // Building gradient
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height)
    gradient.addColorStop(0, "#555555")
    gradient.addColorStop(0.5, "#777777")
    gradient.addColorStop(1, "#333333")

    ctx.fillStyle = gradient
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Building border
    ctx.strokeStyle = "#999999"
    ctx.lineWidth = 3
    ctx.strokeRect(this.x, this.y, this.width, this.height)

    // Building windows (static pattern)
    ctx.fillStyle = "#ffff88"
    const windowWidth = 12
    const windowHeight = 18
    const windowSpacingX = 25
    const windowSpacingY = 35

    for (let i = 0; i < Math.floor(this.width / windowSpacingX); i++) {
      for (let j = 0; j < Math.floor(this.height / windowSpacingY); j++) {
        // Deterministic pattern based on position
        const windowId = i + j * 10
        if (windowId % 3 !== 0) {
          // 2/3 chance for lit window
          const windowX = this.x + 8 + i * windowSpacingX
          const windowY = this.y + 10 + j * windowSpacingY

          ctx.fillRect(windowX, windowY, windowWidth, windowHeight)

          // Window frame
          ctx.strokeStyle = "#444444"
          ctx.lineWidth = 1
          ctx.strokeRect(windowX, windowY, windowWidth, windowHeight)
        }
      }
    }
  }
}

// Asteroid class (for hard mode) - ENHANCED WITH BETTER MOVEMENT
class Asteroid {
  constructor(x, y, size, type, givesPoints = false, difficultyLevel = 0, isFragment = false) {
    this.x = x
    this.y = y
    this.size = size
    this.type = type
    this.givesPoints = givesPoints
    this.passed = false
    this.isFragment = isFragment // Para distinguir fragmentos de asteroides principales
    
    // Cargar imágenes de asteroides
    this.loadAsteroidImages()
    
    // Multiplicador de velocidad basado en el nivel de dificultad
    const speedMultiplier = 1 + (difficultyLevel * 0.2) // 20% más rápido por nivel
    
    // Comportamientos específicos por tipo
    switch (type) {
      case "green":
        this.vx = (-4 - Math.random() * 2) * speedMultiplier // Velocidad recta moderada escalada
        this.vy = 0
        this.color = "#4CAF50"
        break
      case "blue":
        this.vx = 0 // Estático
        this.vy = 0
        this.color = "#2196F3"
        break
      case "red":
        this.vx = (-4 - Math.random() * 3) * speedMultiplier // Velocidad inicial moderada escalada
        this.vy = (Math.random() - 0.5) * 6 * speedMultiplier // Velocidad vertical moderada escalada
        this.bounceCount = 0
        this.maxBounces = 15 + Math.random() * 10
        this.color = "#F44336"
        break
      case "purple":
        this.vx = (-3 - Math.random() * 2) * speedMultiplier
        this.vy = (Math.random() - 0.5) * 3 * speedMultiplier
        this.hasExploded = false
        this.color = "#9C27B0"
        break
      default:
        this.vx = -3 * speedMultiplier
        this.vy = 0
        this.color = "#FF9800"
    }
  }

  update(gameEngine) {
    // Comportamiento específico por tipo
    switch (this.type) {
      case "green":
        this.updateGreen(gameEngine)
        break
      case "blue":
        this.updateBlue(gameEngine)
        break
      case "red":
        this.updateRed(gameEngine)
        break
      case "purple":
        this.updatePurple(gameEngine)
        break
    }
    
    this.x += this.vx
    this.y += this.vy
  }

  updateGreen(gameEngine) {
    // Verde: Movimiento recto simple
    // La velocidad se ajusta con gameSpeed (velocidad constante una vez creado)
    if (!this.baseVx) {
      this.baseVx = -4 - Math.random() * 2 // Solo calcular una vez
    }
    // Ajustar velocidad base según el nivel
    const baseSpeed = gameEngine.level === "easy" ? 7 : 5.5
    this.vx = this.baseVx * (gameEngine.gameSpeed / baseSpeed)
  }

  updateBlue(gameEngine) {
    // Azul: Completamente estático
    this.vx = 0
    this.vy = 0
  }

  updateRed(gameEngine) {
    // Rojo: Rebota por todo el mapa pero desaparece al llegar al límite izquierdo
    const margin = 20
    
    // Rebote en bordes verticales
    if (this.y <= margin || this.y >= gameEngine.GAME_HEIGHT - margin - this.size) {
      this.vy = -this.vy * 0.9 // Pierde un poco de energía
      this.bounceCount++
      
      // Cambiar dirección aleatoriamente
      if (Math.random() < 0.3) {
        this.vx += (Math.random() - 0.5) * 2
        this.vy += (Math.random() - 0.5) * 2
      }
    }
    
    // Rebote con otros asteroides (verdes y rojos)
    this.checkAsteroidCollisions(gameEngine)
    
    // Desaparecer al llegar al límite izquierdo en lugar de rebotar
    if (this.x <= -this.size) {
      this.x = -100 // Marcar para eliminación
      return
    }
    
    // Aplicar fricción gradual
    this.vx *= 0.998
    this.vy *= 0.998
    
    // Limitar velocidades extremas
    this.vx = Math.max(-8, Math.min(8, this.vx))
    this.vy = Math.max(-8, Math.min(8, this.vy))
    
    // Desaparece después de muchos rebotes
    if (this.bounceCount > this.maxBounces) {
      this.x = -100 // Marcar para eliminación
    }
  }

  checkAsteroidCollisions(gameEngine) {
    // Verificar colisión con otros asteroides para rebotes (solo para rojos)
    gameEngine.obstacles.forEach(obstacle => {
      if (obstacle !== this && obstacle instanceof Asteroid) {
        const dx = this.x - obstacle.x
        const dy = this.y - obstacle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = (this.size + obstacle.size) / 2
        
        if (distance < minDistance && 
            (obstacle.type === "green" || obstacle.type === "red")) {
          // Rebote elástico simple
          const angle = Math.atan2(dy, dx)
          const speed = 3 + Math.random() * 2
          
          this.vx = Math.cos(angle) * speed
          this.vy = Math.sin(angle) * speed
          this.bounceCount++
          
          // Separar para evitar colisiones continuas
          this.x += Math.cos(angle) * 5
          this.y += Math.sin(angle) * 5
        }
      }
    })
  }

  updatePurple(gameEngine) {
    // Morado: Movimiento normal hasta que explota
    if (!this.baseVx) {
      this.baseVx = -3 - Math.random() * 2 // Solo calcular una vez
    }
    // Ajustar velocidad base según el nivel
    const baseSpeed = gameEngine.level === "easy" ? 7 : 5.5
    this.vx = this.baseVx * (gameEngine.gameSpeed / baseSpeed)
    
    // Verificar colisiones con otros asteroides para explotar
    if (!this.hasExploded && !this.isFragment) {
      this.checkExplosionCollisions(gameEngine)
    }
  }

  checkExplosionCollisions(gameEngine) {
    // Verificar colisión con otros asteroides
    gameEngine.obstacles.forEach(obstacle => {
      if (obstacle !== this && obstacle instanceof Asteroid) {
        const dx = this.x - obstacle.x
        const dy = this.y - obstacle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = (this.size + obstacle.size) / 2
        
        if (distance < minDistance && 
            (obstacle.type === "green" || obstacle.type === "blue" || obstacle.type === "red")) {
          this.explode(gameEngine)
          return
        }
      }
    })
  }

  explode(gameEngine) {
    if (this.hasExploded) return
    
    this.hasExploded = true
    
    // Crear 4-5 fragmentos moderados
    const fragmentCount = Math.floor(Math.random() * 2) + 4 // 4-5 fragmentos
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (Math.PI * 2 * i) / fragmentCount + Math.random() * 0.5
      const speed = 2 + Math.random() * 2 // Fragmentos a velocidad moderada
      const fragmentSize = this.size * 0.8 // Fragmentos más grandes para mantener proporción
      
      const fragment = new Asteroid(
        this.x,
        this.y,
        fragmentSize,
        "purple",
        false,
        0, // Los fragmentos no escalan con dificultad
        true // isFragment = true
      )
      
      fragment.vx = Math.cos(angle) * speed
      fragment.vy = Math.sin(angle) * speed
      fragment.hasExploded = true // Los fragmentos no explotan
      fragment.color = "#673AB7" // Color más oscuro para fragmentos
      
      gameEngine.obstacles.push(fragment)
    }
    
    // Marcar el asteroide original para eliminación
    this.x = -100
  }

  loadAsteroidImages() {
    // Cargar imágenes según el tipo de asteroide
    this.image = new Image()
    this.imageLoaded = false
    this.imageError = false
    
    switch (this.type) {
      case "green":
        this.image.src = "images/piedra2.png"
        break
      case "blue":
        this.image.src = "images/piedraazul.png"
        break
      case "red":
        this.image.src = "images/piedraroja.png"
        break
      case "purple":
        if (this.isFragment) {
          this.image.src = "images/piedra2.png" // Fragmentos usan piedra2
        } else {
          this.image.src = "images/piedraazul.png" // Asteroides morados usan piedraazul
        }
        break
      default:
        this.image.src = "images/piedra2.png"
    }
    
    this.image.onload = () => {
      this.imageLoaded = true
    }
    
    this.image.onerror = () => {
      this.imageError = true
      console.warn('Error loading asteroid image:', this.image.src)
    }
  }

  draw(ctx) {
    // Verificar que las propiedades básicas existan
    if (!ctx || !isFinite(this.x) || !isFinite(this.y) || !isFinite(this.size)) {
      console.warn('Invalid asteroid properties for drawing:', {
        x: this.x, y: this.y, size: this.size, type: this.type
      })
      return
    }
    
    ctx.save()
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2)
    
    // Efectos visuales según el tipo
    if (this.type === "blue") {
      // Cristal azul: Brillo estático brillante
      ctx.shadowBlur = 20
      ctx.shadowColor = "#00BFFF"
      ctx.globalAlpha = 0.9
    } else if (this.type === "red") {
      // Rojo: Rotación por rebotes
      ctx.rotate((this.bounceCount || 0) * 0.1)
    } else if (this.type === "purple" && this.isFragment) {
      // Fragmentos morados: Efecto de dispersión
      ctx.globalAlpha = 0.8
    }
    
    // Intentar dibujar la imagen, si no está cargada usar fallback
    let imageDrawn = false
    if (this.imageLoaded && this.image.complete && !this.imageError) {
      try {
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size)
        imageDrawn = true
      } catch (error) {
        console.warn('Error drawing asteroid image:', error)
        imageDrawn = false
      }
    }
    
    // Si la imagen no se pudo dibujar, usar fallback
    if (!imageDrawn) {
      this.drawFallback(ctx)
    }
    
    ctx.restore()
  }

  drawFallback(ctx) {
    // Fallback para dibujar asteroides sin imagen
    ctx.fillStyle = this.color || "#FF9800"
    ctx.beginPath()
    
    // Formas diferentes según el tipo
    if (this.type === "blue") {
      // Cristal azul: Forma de diamante brillante
      this.drawCrystalShape(ctx)
    } else if (this.isFragment) {
      // Fragmentos: Forma irregular pequeña
      this.drawFragmentShape(ctx)
    } else {
      // Otros: Forma de asteroide regular
      this.drawAsteroidShape(ctx)
    }
    
    ctx.fill()
    
    // Añadir contorno para mejor visibilidad
    if (this.type === "blue") {
      ctx.strokeStyle = "#87CEEB"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  drawCrystalShape(ctx) {
    const size = this.size / 2
    
    // Dibujar cristal en forma de diamante con múltiples facetas
    ctx.beginPath()
    
    // Parte superior del cristal (punta)
    ctx.moveTo(0, -size * 0.8)
    ctx.lineTo(size * 0.4, -size * 0.4)
    ctx.lineTo(size * 0.6, 0)
    ctx.lineTo(size * 0.4, size * 0.4)
    ctx.lineTo(0, size * 0.8)
    ctx.lineTo(-size * 0.4, size * 0.4)
    ctx.lineTo(-size * 0.6, 0)
    ctx.lineTo(-size * 0.4, -size * 0.4)
    ctx.closePath()
    
    // Añadir brillo interno
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
    gradient.addColorStop(0, "#87CEEB")
    gradient.addColorStop(0.5, "#4682B4")
    gradient.addColorStop(1, "#191970")
    ctx.fillStyle = gradient
  }

  drawFragmentShape(ctx) {
    const size = this.size / 2
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6
      const radius = size * (0.7 + Math.random() * 0.3)
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
  }

  drawAsteroidShape(ctx) {
    const size = this.size / 2
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const radius = size * (0.8 + Math.random() * 0.2)
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
  }

  collidesWith(player) {
    const dx = this.x + this.size / 2 - (player.x + player.size / 2)
    const dy = this.y + this.size / 2 - (player.y + player.size / 2)
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Hitbox más generosa para el jugador
    const playerRadius = player.size / 2 - 5
    const asteroidRadius = this.size / 2 - 5
    
    return distance < playerRadius + asteroidRadius
  }

  isOffScreen(gameEngine) {
    // Use dynamic game dimensions instead of hardcoded values
    const GAME_WIDTH = gameEngine ? gameEngine.GAME_WIDTH : 900
    const GAME_HEIGHT = gameEngine ? gameEngine.GAME_HEIGHT : 700
    
    return this.x + this.size < -50 || 
           this.x > GAME_WIDTH + 100 || 
           this.y + this.size < -50 || 
           this.y > GAME_HEIGHT + 100
  }
}

// Trail Particle class - ENHANCED
class GameTrailParticle {
  constructor(x, y, color) {
    this.x = x + (Math.random() - 0.5) * 20
    this.y = y + (Math.random() - 0.5) * 20
    this.color = color
    this.opacity = 1
    this.size = Math.random() * 12 + 6
    this.velocityX = (Math.random() - 0.5) * 2
    this.velocityY = Math.random() * 3 + 1
    
    // Support for custom velocities (for collection effects)
    this.vx = this.velocityX
    this.vy = this.velocityY
  }

  update() {
    this.opacity -= 0.04
    this.x += this.vx || this.velocityX
    this.y += this.vy || this.velocityY
    this.size *= 0.97
  }

  render(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity

    // Create gradient for glow effect
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(0.5, this.color + "80")
    gradient.addColorStop(1, "transparent")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

// Make classes globally available with unique names
window.Player = GamePlayer
window.Building = GameBuilding
window.Asteroid = Asteroid
window.TrailParticle = GameTrailParticle
window.BuildingImagePreloader = BuildingImagePreloader

// Initialize building preloader globally - FORZADO
if (!window.buildingPreloader) {
  console.log('🔧 Inicializando building preloader globalmente...');
  window.buildingPreloader = new BuildingImagePreloader();
  console.log('✅ Building preloader creado:', window.buildingPreloader);
}
