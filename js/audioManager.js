// Sistema de Audio para el Juego - Completo
class AudioManager {
  constructor() {
    this.audioContext = null
    this.sounds = {}
    this.currentBackgroundMusic = null
    this.isBackgroundMusicPlaying = false
    this.gameAudioPlaying = false
    this.masterVolume = 0.7
    this.musicVolume = 0.6
    this.sfxVolume = 0.8
    this.buttonVolume = 0.9 // Aumentar volumen de botones para que se escuchen bien
    this.previousMusicTime = 0
    
    // Estados de audio
    this.isNaveLooping = false
    this.isMenuMusicPlaying = false
    this.isLevelMusicPlaying = false
    
    this.initializeAudio()
  }

  async initializeAudio() {
    try {
      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      console.log('🎵 Inicializando sistema de audio...')
      console.log('🔊 Estado del contexto de audio:', this.audioContext.state)
      
      // Cargar todos los sonidos
      await this.loadAllSounds()
      
      console.log('🎵 Sistema de audio inicializado correctamente')
      console.log('📊 Archivos de sonido cargados:')
      Object.keys(this.sounds).forEach(key => {
        console.log(`  • ${key}: ${this.sounds[key] ? '✅ Cargado' : '❌ Error'}`)
      })
    } catch (error) {
      console.error('❌ Error al inicializar sistema de audio:', error)
    }
  }

  async loadAllSounds() {
    const soundFiles = {
      // Música de fondo
      menuMusic: 'sounds/menu.mp3',
      levelEasyMusic: 'sounds/niveleasy.mp3',
      levelHardMusic: 'sounds/nivelhard.mp3',
      
      // Efectos de sonido
      naveSfx: 'sounds/nave.mp3',
      explosionSfx: 'sounds/Explosion.mp3',
      gameoverSfx: 'sounds/Gameover.mp3',
      metaSfx: 'sounds/meta.mp3',
      
      // Sonidos de botón (usar meta.mp3 que es más corto y apropiado para clicks)
      buttonSfx: 'sounds/meta.mp3' // Usaremos meta.mp3 como sonido de click para botones
    }

    // Cargar cada sonido
    for (const [key, path] of Object.entries(soundFiles)) {
      try {
        this.sounds[key] = await this.loadSound(path)
        console.log(`✅ Sonido cargado: ${key}`)
      } catch (error) {
        console.error(`❌ Error cargando sonido ${key}:`, error)
      }
    }
  }

  async loadSound(path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      
      audio.addEventListener('canplaythrough', () => {
        resolve(audio)
      })
      
      audio.addEventListener('error', (e) => {
        reject(e)
      })
      
      // Configurar propiedades básicas
      audio.volume = 0.5
      audio.loop = false
    })
  }

  // ================================
  // MÚSICA DE FONDO
  // ================================

  async playMenuMusic() {
    if (this.isMenuMusicPlaying) return
    
    try {
      await this.resumeAudioContext()
      await this.stopAllBackgroundMusic()
      
      if (this.sounds.menuMusic) {
        this.sounds.menuMusic.loop = true
        this.sounds.menuMusic.volume = this.musicVolume * this.masterVolume
        await this.sounds.menuMusic.play()
        this.currentBackgroundMusic = this.sounds.menuMusic
        this.isMenuMusicPlaying = true
        this.isBackgroundMusicPlaying = true
        console.log('🎵 Música del menú iniciada')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo música del menú:', error)
      console.log('ℹ️ Posible causa: El navegador requiere interacción del usuario antes de reproducir audio')
    }
  }

  async playLevelMusic(level) {
    if (this.isLevelMusicPlaying) return
    
    try {
      await this.stopAllBackgroundMusic()
      
      const musicKey = level === 'easy' ? 'levelEasyMusic' : 'levelHardMusic'
      
      if (this.sounds[musicKey]) {
        this.sounds[musicKey].loop = true
        this.sounds[musicKey].volume = this.musicVolume * this.masterVolume * 0.7 // Un poco más bajo durante el juego
        await this.sounds[musicKey].play()
        this.currentBackgroundMusic = this.sounds[musicKey]
        this.isLevelMusicPlaying = true
        this.isBackgroundMusicPlaying = true
        console.log(`🎵 Música del nivel ${level} iniciada`)
      }
    } catch (error) {
      console.error(`❌ Error reproduciendo música del nivel ${level}:`, error)
    }
  }

  async stopAllBackgroundMusic() {
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.pause()
      this.currentBackgroundMusic.currentTime = 0
    }
    
    // Detener todos los tipos de música
    Object.values(this.sounds).forEach(sound => {
      if (sound.loop) {
        sound.pause()
        sound.currentTime = 0
      }
    })
    
    this.isBackgroundMusicPlaying = false
    this.isMenuMusicPlaying = false
    this.isLevelMusicPlaying = false
    this.currentBackgroundMusic = null
  }

  // ================================
  // EFECTOS DE SONIDO DEL JUEGO
  // ================================

  async playNaveSound() {
    if (this.isNaveLooping) return
    
    try {
      if (this.sounds.naveSfx) {
        // Clonar el audio para permitir múltiples reproducciones
        const naveSound = this.sounds.naveSfx.cloneNode()
        naveSound.volume = this.sfxVolume * this.masterVolume * 0.6
        naveSound.loop = true
        await naveSound.play()
        
        // Guardar referencia para poder pararlo
        this.currentNaveSound = naveSound
        this.isNaveLooping = true
        console.log('🚀 Sonido de nave iniciado')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de nave:', error)
    }
  }

  stopNaveSound() {
    if (this.currentNaveSound && this.isNaveLooping) {
      this.currentNaveSound.pause()
      this.currentNaveSound.currentTime = 0
      this.isNaveLooping = false
      console.log('🚀 Sonido de nave detenido')
    }
  }

  async playBubbleSound() {
    // Para el nivel hard, usaremos el sonido de nave pero con menos volumen y más agudo
    try {
      if (this.sounds.naveSfx) {
        const bubbleSound = this.sounds.naveSfx.cloneNode()
        bubbleSound.volume = this.sfxVolume * this.masterVolume * 0.4
        bubbleSound.playbackRate = 1.5 // Más agudo para efecto "burbuja"
        await bubbleSound.play()
        console.log('🫧 Sonido de burbuja (nivel hard) reproducido')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de burbuja:', error)
    }
  }

  async playExplosionSound() {
    try {
      if (this.sounds.explosionSfx) {
        const explosionSound = this.sounds.explosionSfx.cloneNode()
        explosionSound.volume = this.sfxVolume * this.masterVolume
        await explosionSound.play()
        console.log('💥 Sonido de explosión reproducido')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de explosión:', error)
    }
  }

  async playGameOverSound() {
    try {
      if (this.sounds.gameoverSfx) {
        const gameoverSound = this.sounds.gameoverSfx.cloneNode()
        gameoverSound.volume = this.sfxVolume * this.masterVolume
        await gameoverSound.play()
        console.log('💀 Sonido de game over reproducido')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de game over:', error)
    }
  }

  async playMetaSound() {
    try {
      if (this.sounds.metaSfx) {
        const metaSound = this.sounds.metaSfx.cloneNode()
        metaSound.volume = this.sfxVolume * this.masterVolume
        await metaSound.play()
        console.log('🎯 Sonido de meta reproducido')
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de meta:', error)
    }
  }

  // ================================
  // SONIDOS DE BOTONES
  // ================================

  async playButtonSound() {
    try {
      await this.resumeAudioContext()
      
      if (this.sounds.buttonSfx) {
        const buttonSound = this.sounds.buttonSfx.cloneNode()
        
        // Configuración específica para sonido de click de botón
        buttonSound.volume = this.buttonVolume * this.masterVolume * 0.8 // Un poco más bajo
        buttonSound.playbackRate = 1.5 // Ligeramente más rápido para efecto de click
        buttonSound.currentTime = 0 // Asegurar que empiece desde el inicio
        
        // Reproducir el sonido completo pero breve
        await buttonSound.play()
        
        // Detener después de un tiempo muy corto para efecto de click
        setTimeout(() => {
          if (!buttonSound.paused) {
            buttonSound.pause()
            buttonSound.currentTime = 0
          }
        }, 300) // Detener después de 300ms
        
        console.log('🔘 Sonido de click de botón reproducido')
      } else {
        console.warn('⚠️ No se encontró el archivo de sonido para botones')
        console.log('📁 Archivos disponibles:', Object.keys(this.sounds))
      }
    } catch (error) {
      console.error('❌ Error reproduciendo sonido de botón:', error)
      console.log('ℹ️ Posible causa: El navegador requiere interacción del usuario antes de reproducir audio')
      
      // Fallback: intentar con un sonido alternativo
      this.playFallbackButtonSound()
    }
  }

  // Sonido de botón alternativo (fallback)
  async playFallbackButtonSound() {
    try {
      // Intentar con el sonido de explosión como alternativa
      if (this.sounds.explosionSfx) {
        const fallbackSound = this.sounds.explosionSfx.cloneNode()
        fallbackSound.volume = this.buttonVolume * this.masterVolume * 0.3 // Muy bajo
        fallbackSound.playbackRate = 3.0 // Muy rápido para que suene como click
        fallbackSound.currentTime = 0
        
        await fallbackSound.play()
        
        // Detener muy rápido
        setTimeout(() => {
          if (!fallbackSound.paused) {
            fallbackSound.pause()
            fallbackSound.currentTime = 0
          }
        }, 100) // Solo 100ms
        
        console.log('🔘 Sonido de botón alternativo reproducido')
      } else {
        console.warn('⚠️ No hay sonidos alternativos disponibles para botones')
      }
    } catch (error) {
      console.error('❌ Error con sonido alternativo de botón:', error)
    }
  }

  // ================================
  // CONTROL DE VOLUMEN
  // ================================

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    console.log(`🔊 Volumen maestro establecido: ${this.masterVolume}`)
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.volume = this.musicVolume * this.masterVolume
    }
    console.log(`🎵 Volumen de música establecido: ${this.musicVolume}`)
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    console.log(`🔊 Volumen de efectos establecido: ${this.sfxVolume}`)
  }

  // ================================
  // UTILIDADES
  // ================================

  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
      console.log('🎵 Contexto de audio reanudado')
    }
  }

  pauseAllAudio() {
    // Pausar música de fondo
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.pause()
    }
    
    // Detener sonido de nave
    this.stopNaveSound()
    
    console.log('⏸️ Todo el audio pausado')
  }

  resumeAllAudio() {
    // Reanudar música de fondo
    if (this.currentBackgroundMusic && this.isBackgroundMusicPlaying) {
      this.currentBackgroundMusic.play()
    }
    
    console.log('▶️ Audio reanudado')
  }

  // Método para limpiar recursos
  dispose() {
    this.stopAllBackgroundMusic()
    this.stopNaveSound()
    
    Object.values(this.sounds).forEach(sound => {
      sound.pause()
      sound.currentTime = 0
    })
    
    if (this.audioContext) {
      this.audioContext.close()
    }
    
    console.log('🧹 Sistema de audio limpiado')
  }
}

// Crear instancia global del administrador de audio
window.audioManager = new AudioManager()

// Función global para reproducir sonidos de botón fácilmente
function playButtonSound() {
  if (window.audioManager) {
    window.audioManager.playButtonSound()
  }
}

// Función global simple para probar el click de botón
function testButtonClick() {
  console.log('🔘 Probando sonido de click de botón...')
  playButtonSound()
  setTimeout(() => {
    console.log('✅ ¿Se escuchó el click? Si no, verifica que el audio esté activado.')
    console.log('💡 Usa audioTestUtil.testButtonAlternatives() para probar diferentes configuraciones')
  }, 500)
}

// Función para probar el audio después de la carga inicial
window.testAudioSystem = function() {
  console.log('🎵 PRUEBA DEL SISTEMA DE AUDIO')
  console.log('==============================')
  
  if (!window.audioManager) {
    console.error('❌ AudioManager no está disponible')
    return
  }
  
  console.log('🔊 Estado del contexto de audio:', window.audioManager.audioContext ? window.audioManager.audioContext.state : 'No disponible')
  console.log('📊 Archivos de sonido:')
  
  Object.keys(window.audioManager.sounds).forEach(key => {
    const sound = window.audioManager.sounds[key]
    if (sound) {
      console.log(`  • ${key}: ✅ Cargado (${sound.src})`)
    } else {
      console.log(`  • ${key}: ❌ Error al cargar`)
    }
  })
  
  console.log('')
  console.log('💡 Para probar el audio manualmente:')
  console.log('   testButtonClick() - Probar click de botón (RÁPIDO)')
  console.log('   audioTestUtil.testButtonSound() - Probar botones específicamente')
  console.log('   audioTestUtil.testAllSounds() - Probar todos los sonidos')
  console.log('   audioTestUtil.testMusic() - Probar música')
  console.log('   audioTestUtil.testSfx() - Probar efectos')
  console.log('   playButtonSound() - Probar sonido de botón básico')
  console.log('')
  console.log('🔘 Configuración actual de botones:')
  console.log('   • Archivo: meta.mp3')
  console.log('   • Volumen: ' + (window.audioManager.buttonVolume * 100) + '%')
  console.log('   • Velocidad: 1.5x (para efecto de click)')
  console.log('')
  console.log('ℹ️  Recuerda: Los navegadores requieren interacción del usuario antes de reproducir audio')
}

// Función para reanudar contexto de audio (necesario para algunos navegadores)
function resumeAudioContext() {
  if (window.audioManager) {
    window.audioManager.resumeAudioContext()
  }
}

// Exportar para uso en otros archivos
window.playButtonSound = playButtonSound
window.testButtonClick = testButtonClick
window.resumeAudioContext = resumeAudioContext 