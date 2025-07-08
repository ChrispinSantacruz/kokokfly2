// Utilidad para probar el sistema de audio - Kokok The Roach
window.audioTestUtil = {
  
  // Probar todos los sonidos uno por uno
  async testAllSounds() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🎵 Iniciando prueba del sistema de audio...')
    
    // Lista de sonidos para probar
    const soundTests = [
      { name: 'Música del menú', fn: () => window.audioManager.playMenuMusic() },
      { name: 'Música nivel fácil', fn: () => window.audioManager.playLevelMusic('easy') },
      { name: 'Música nivel difícil', fn: () => window.audioManager.playLevelMusic('hard') },
      { name: 'Sonido de nave', fn: () => window.audioManager.playNaveSound() },
      { name: 'Sonido de burbuja', fn: () => window.audioManager.playBubbleSound() },
      { name: 'Sonido de explosión', fn: () => window.audioManager.playExplosionSound() },
      { name: 'Sonido de game over', fn: () => window.audioManager.playGameOverSound() },
      { name: 'Sonido de meta', fn: () => window.audioManager.playMetaSound() },
      { name: 'Sonido de botón', fn: () => window.audioManager.playButtonSound() }
    ]
    
    for (let i = 0; i < soundTests.length; i++) {
      const test = soundTests[i]
      console.log(`🔊 Probando: ${test.name}`)
      
      try {
        await test.fn()
        console.log(`✅ ${test.name} - OK`)
      } catch (error) {
        console.error(`❌ ${test.name} - Error:`, error)
      }
      
      // Esperar un poco entre pruebas
      await this.delay(1000)
    }
    
    console.log('✅ Prueba del sistema de audio completada')
  },
  
  // Probar sonidos de música por separado
  async testMusic() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🎵 Probando música...')
    
    // Música del menú
    console.log('🎶 Reproduciendo música del menú...')
    await window.audioManager.playMenuMusic()
    await this.delay(3000)
    
    // Música nivel fácil
    console.log('🎶 Reproduciendo música nivel fácil...')
    await window.audioManager.playLevelMusic('easy')
    await this.delay(3000)
    
    // Música nivel difícil
    console.log('🎶 Reproduciendo música nivel difícil...')
    await window.audioManager.playLevelMusic('hard')
    await this.delay(3000)
    
    // Detener toda la música
    console.log('🔇 Deteniendo toda la música...')
    await window.audioManager.stopAllBackgroundMusic()
    
    console.log('✅ Prueba de música completada')
  },
  
  // Probar efectos de sonido
  async testSfx() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🔊 Probando efectos de sonido...')
    
    const sfxTests = [
      { name: 'Sonido de nave', fn: () => window.audioManager.playNaveSound() },
      { name: 'Sonido de burbuja', fn: () => window.audioManager.playBubbleSound() },
      { name: 'Sonido de explosión', fn: () => window.audioManager.playExplosionSound() },
      { name: 'Sonido de game over', fn: () => window.audioManager.playGameOverSound() },
      { name: 'Sonido de meta', fn: () => window.audioManager.playMetaSound() },
      { name: 'Sonido de botón', fn: () => window.audioManager.playButtonSound() }
    ]
    
    for (const test of sfxTests) {
      console.log(`🔊 ${test.name}`)
      await test.fn()
      await this.delay(1500)
    }
    
    console.log('✅ Prueba de efectos de sonido completada')
  },

  // Probar específicamente el sonido de botones
  async testButtonSound() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🔘 Probando sonido de botones específicamente...')
    
    for (let i = 1; i <= 5; i++) {
      console.log(`🔘 Click ${i}/5`)
      await window.audioManager.playButtonSound()
      await this.delay(800) // Menor delay para simular clicks rápidos
    }
    
    console.log('✅ Prueba de sonido de botones completada')
    console.log('ℹ️ ¿Se escuchó como un click? Si no, intenta: audioTestUtil.testButtonAlternatives()')
  },

  // Probar diferentes configuraciones de sonido de botón
  async testButtonAlternatives() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🔘 Probando configuraciones alternativas para botones...')
    
    // Configuración 1: Meta.mp3 normal
    console.log('🔘 Configuración 1: Meta.mp3 normal')
    const sound1 = window.audioManager.sounds.metaSfx?.cloneNode()
    if (sound1) {
      sound1.volume = 0.7
      sound1.playbackRate = 1.0
      await sound1.play()
      await this.delay(1000)
    }
    
    // Configuración 2: Meta.mp3 más rápido
    console.log('🔘 Configuración 2: Meta.mp3 rápido')
    const sound2 = window.audioManager.sounds.metaSfx?.cloneNode()
    if (sound2) {
      sound2.volume = 0.8
      sound2.playbackRate = 2.0
      await sound2.play()
      await this.delay(1000)
    }
    
    // Configuración 3: Explosión muy rápida y baja
    console.log('🔘 Configuración 3: Explosión como click')
    const sound3 = window.audioManager.sounds.explosionSfx?.cloneNode()
    if (sound3) {
      sound3.volume = 0.3
      sound3.playbackRate = 3.0
      await sound3.play()
      setTimeout(() => {
        sound3.pause()
        sound3.currentTime = 0
      }, 100)
      await this.delay(1000)
    }
    
    console.log('✅ Prueba de configuraciones alternativas completada')
    console.log('ℹ️ ¿Cuál sonó mejor como click? Podemos ajustar la configuración')
  },
  
  // Probar controles de volumen
  testVolumeControls() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('🔊 Probando controles de volumen...')
    
    // Establecer diferentes niveles de volumen
    window.audioManager.setMasterVolume(0.8)
    window.audioManager.setMusicVolume(0.6)
    window.audioManager.setSfxVolume(0.7)
    
    console.log('✅ Volúmenes establecidos:')
    console.log('  - Volumen maestro: 0.8')
    console.log('  - Volumen música: 0.6')
    console.log('  - Volumen efectos: 0.7')
    
    // Probar un sonido con los nuevos volúmenes
    window.audioManager.playButtonSound()
    
    console.log('✅ Prueba de controles de volumen completada')
  },
  
  // Probar funcionalidad de pausa/reanudación
  async testPauseResume() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('⏸️ Probando pausa y reanudación...')
    
    // Reproducir música
    await window.audioManager.playMenuMusic()
    console.log('🎵 Música iniciada')
    
    await this.delay(2000)
    
    // Pausar
    window.audioManager.pauseAllAudio()
    console.log('⏸️ Audio pausado')
    
    await this.delay(2000)
    
    // Reanudar
    window.audioManager.resumeAllAudio()
    console.log('▶️ Audio reanudado')
    
    await this.delay(2000)
    
    // Detener
    await window.audioManager.stopAllBackgroundMusic()
    console.log('🔇 Audio detenido')
    
    console.log('✅ Prueba de pausa/reanudación completada')
  },
  
  // Información del sistema de audio
  showAudioInfo() {
    if (!window.audioManager) {
      console.error('❌ AudioManager no está disponible')
      return
    }
    
    console.log('📊 INFORMACIÓN DEL SISTEMA DE AUDIO')
    console.log('==================================')
    console.log('Estado actual:')
    console.log(`  • Música de fondo reproduciéndose: ${window.audioManager.isBackgroundMusicPlaying}`)
    console.log(`  • Música del menú: ${window.audioManager.isMenuMusicPlaying}`)
    console.log(`  • Música del nivel: ${window.audioManager.isLevelMusicPlaying}`)
    console.log(`  • Sonido de nave: ${window.audioManager.isNaveLooping}`)
    console.log('')
    console.log('Volúmenes:')
    console.log(`  • Volumen maestro: ${window.audioManager.masterVolume}`)
    console.log(`  • Volumen música: ${window.audioManager.musicVolume}`)
    console.log(`  • Volumen efectos: ${window.audioManager.sfxVolume}`)
    console.log(`  • Volumen botones: ${window.audioManager.buttonVolume}`)
    console.log('')
    console.log('Archivos de sonido cargados:')
    Object.keys(window.audioManager.sounds).forEach(key => {
      const sound = window.audioManager.sounds[key]
      console.log(`  • ${key}: ${sound ? 'Cargado' : 'No cargado'}`)
    })
    
    console.log('')
    console.log('💡 Comandos disponibles:')
    console.log('  • audioTestUtil.testAllSounds() - Probar todos los sonidos')
    console.log('  • audioTestUtil.testMusic() - Probar solo música')
    console.log('  • audioTestUtil.testSfx() - Probar solo efectos')
    console.log('  • audioTestUtil.testButtonSound() - Probar sonido de botones específicamente')
    console.log('  • audioTestUtil.testButtonAlternatives() - Probar diferentes configuraciones de botón')
    console.log('  • audioTestUtil.testVolumeControls() - Probar controles de volumen')
    console.log('  • audioTestUtil.testPauseResume() - Probar pausa/reanudación')
    console.log('  • audioTestUtil.showAudioInfo() - Mostrar esta información')
  },
  
  // Utilidad para delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Mostrar información al cargar
console.log('🎵 SISTEMA DE AUDIO CARGADO')
console.log('===========================')
console.log('El sistema de audio está listo para usar.')
console.log('🔘 Los botones usan meta.mp3 como sonido de click.')
console.log('Usa audioTestUtil.showAudioInfo() para ver comandos disponibles.')
console.log('Usa audioTestUtil.testButtonSound() para probar específicamente el sonido de botones.')
console.log('Usa audioTestUtil.testAllSounds() para probar todos los sonidos.') 