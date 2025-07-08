// Menu functionality
class MenuManager {
  constructor() {
    this.welcomeNameElement = document.getElementById("welcomeName")
    this.easyScoreElement = document.getElementById("easyScore")
    this.hardScoreElement = document.getElementById("hardScore")
    this.shipsCountElement = document.getElementById("shipsCount")
    this.ufosCountElement = document.getElementById("ufosCount")
  }

  // Update menu with current game state
  updateMenu() {
    this.welcomeNameElement.textContent = window.gameState.playerName
    this.easyScoreElement.textContent = window.gameState.easyHighScore
    this.hardScoreElement.textContent = window.gameState.hardHighScore
    this.shipsCountElement.textContent = `${window.gameState.unlockedShips.length}/3`
    this.ufosCountElement.textContent = `${window.gameState.unlockedUfos.length}/3`
  }

  // Initialize menu
  initialize() {
    this.updateMenu()
    
    // Reproducir música del menú
    if (window.audioManager) {
      window.audioManager.playMenuMusic()
    }
    
    // Verificar visibilidad del botón fullscreen
    setTimeout(() => {
      checkFullscreenButtonVisibility()
    }, 100)
  }
}

// Menu navigation functions
function showLevelSelect() {
  // 🔄 ORIENTACIÓN VERTICAL PARA NAVEGACIÓN
  if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
    window.gameEngine.forceVerticalOrientation()
  }
  window.screenManager.showScreen("levelSelect")
}

function showCustomization() {
  // 🔄 ORIENTACIÓN VERTICAL PARA NAVEGACIÓN
  if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
    window.gameEngine.forceVerticalOrientation()
  }
  window.screenManager.showScreen("customization")
}

function showInstructions() {
  // 🔄 ORIENTACIÓN VERTICAL PARA NAVEGACIÓN
  if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
    window.gameEngine.forceVerticalOrientation()
  }
  window.screenManager.showScreen("instructions")
}

function showMenu() {
  // 🔄 VOLVER A ORIENTACIÓN VERTICAL AL VOLVER AL MENÚ
  if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
    window.gameEngine.forceVerticalOrientation()
  }
  
  window.screenManager.showScreen("menu")
  
  // Asegurar que el botón fullscreen se muestre si es necesario
  setTimeout(() => {
    checkFullscreenButtonVisibility()
    
    // Si está en landscape, mostrar el botón
    if (window.innerWidth > window.innerHeight) {
      console.log('🔧 showMenu: Forzando mostrar botón fullscreen')
      forceShowFullscreenButton()
    }
  }, 200)
}

// Función para activar/desactivar pantalla completa horizontal
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Entrar en pantalla completa
    document.documentElement.requestFullscreen()
      .then(() => {
        console.log('🔄 Pantalla completa activada')
        
        // Forzar orientación horizontal después de entrar en pantalla completa
        if (window.gameEngine && window.gameEngine.forceHorizontalOrientation) {
          setTimeout(() => {
            window.gameEngine.forceHorizontalOrientation()
          }, 100)
        }
        
        // Actualizar texto del botón
        updateFullscreenButton()
      })
      .catch(err => {
        console.error('Error activando pantalla completa:', err)
      })
  } else {
    // Salir de pantalla completa
    document.exitFullscreen()
      .then(() => {
        console.log('🔄 Pantalla completa desactivada')
        
        // Volver a orientación vertical
        if (window.gameEngine && window.gameEngine.forceVerticalOrientation) {
          setTimeout(() => {
            window.gameEngine.forceVerticalOrientation()
          }, 100)
        }
        
        // Actualizar texto del botón
        updateFullscreenButton()
      })
      .catch(err => {
        console.error('Error desactivando pantalla completa:', err)
      })
  }
}

// Función para actualizar el texto del botón de pantalla completa
function updateFullscreenButton() {
  const fullscreenButton = document.querySelector('.btn-fullscreen-style')
  if (fullscreenButton) {
    if (document.fullscreenElement) {
      fullscreenButton.innerHTML = '<span class="icon-compress"></span> EXIT FULLSCREEN'
    } else {
      fullscreenButton.innerHTML = '<span class="icon-expand"></span> FULLSCREEN'
    }
  }
}

// Listener para cambios en el estado de pantalla completa
document.addEventListener('fullscreenchange', () => {
  updateFullscreenButton()
})

// Función para mostrar/ocultar botón de fullscreen basado en orientación
function checkFullscreenButtonVisibility() {
  const fullscreenButton = document.getElementById('fullscreenButton')
  if (fullscreenButton) {
    // Lógica más inclusiva: mostrar en landscape si la altura es menor que el ancho
    const isLandscape = window.innerWidth > window.innerHeight
    const isReasonableSize = window.innerHeight <= 700 && window.innerWidth >= 400
    
    console.log('🔍 Verificando visibilidad del botón fullscreen:', {
      isLandscape,
      isReasonableSize,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      shouldShow: isLandscape && isReasonableSize
    })
    
    if (isLandscape && isReasonableSize) {
      fullscreenButton.style.display = 'block'
      console.log('📱 Botón fullscreen mostrado')
    } else {
      fullscreenButton.style.display = 'none'
      console.log('📱 Botón fullscreen oculto')
    }
  } else {
    console.error('❌ No se encontró el botón fullscreen')
  }
}

// Listener para cambios de orientación y tamaño de pantalla
window.addEventListener('resize', checkFullscreenButtonVisibility)
window.addEventListener('orientationchange', () => {
  setTimeout(checkFullscreenButtonVisibility, 100)
})

// Initialize menu manager
window.menuManager = new MenuManager()

// Función para forzar mostrar el botón (para testing)
function forceShowFullscreenButton() {
  const fullscreenButton = document.getElementById('fullscreenButton')
  if (fullscreenButton) {
    fullscreenButton.style.display = 'block'
    // Forzar posición a la derecha
    forceButtonToRight()
    console.log('🔧 Botón fullscreen forzado a mostrar en la derecha')
  }
}

// Función para ocultar el botón manualmente
function hideFullscreenButton() {
  const fullscreenButton = document.getElementById('fullscreenButton')
  if (fullscreenButton) {
    fullscreenButton.style.display = 'none'
    console.log('🔧 Botón fullscreen forzado a ocultar')
  }
}

// Función de emergencia para mostrar el botón inmediatamente
function emergencyShowFullscreenButton() {
  const fullscreenButton = document.getElementById('fullscreenButton')
  if (fullscreenButton) {
    fullscreenButton.style.display = 'block'
    fullscreenButton.style.visibility = 'visible'
    fullscreenButton.style.opacity = '1'
    fullscreenButton.style.position = 'fixed'
    fullscreenButton.style.top = '1vh'
    fullscreenButton.style.right = '1vw'
    fullscreenButton.style.left = 'unset'
    fullscreenButton.style.transform = 'none'
    fullscreenButton.style.zIndex = '9999'
    fullscreenButton.style.margin = '0'
    console.log('🚨 EMERGENCIA: Botón fullscreen mostrado forzadamente en esquina derecha')
  } else {
    console.error('❌ EMERGENCIA: No se encontró el botón fullscreen')
  }
}

// Función para forzar posición del botón a la derecha
function forceButtonToRight() {
  const fullscreenButton = document.getElementById('fullscreenButton')
  if (fullscreenButton) {
    fullscreenButton.style.position = 'fixed'
    fullscreenButton.style.top = '1vh'
    fullscreenButton.style.right = '1vw'
    fullscreenButton.style.left = 'unset'
    fullscreenButton.style.transform = 'none'
    fullscreenButton.style.margin = '0'
    console.log('🔧 Botón fullscreen forzado a la derecha')
  }
}

// Hacer funciones accesibles globalmente
window.forceShowFullscreenButton = forceShowFullscreenButton
window.hideFullscreenButton = hideFullscreenButton
window.checkFullscreenButtonVisibility = checkFullscreenButtonVisibility
window.emergencyShowFullscreenButton = emergencyShowFullscreenButton
window.forceButtonToRight = forceButtonToRight

// Verificar visibilidad del botón al cargar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    checkFullscreenButtonVisibility()
    
    // Para testing - mostrar temporalmente el botón
    console.log('🔧 Para testing: forceShowFullscreenButton() - forzar mostrar')
    console.log('🔧 Para testing: hideFullscreenButton() - forzar ocultar')
    
    // Si está en landscape, mostrar inmediatamente
    if (window.innerWidth > window.innerHeight) {
      console.log('🔧 Detectado landscape al cargar - mostrando botón')
      forceShowFullscreenButton()
    }
  }, 500)
})

// Verificar cada vez que se muestra el menú
document.addEventListener('screenChange', (event) => {
  if (event.detail.screen === 'menu') {
    setTimeout(() => {
      checkFullscreenButtonVisibility()
      if (window.innerWidth > window.innerHeight) {
        forceShowFullscreenButton()
      }
    }, 100)
  }
})
