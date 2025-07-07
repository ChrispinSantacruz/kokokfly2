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
    this.shipsCountElement.textContent = `${window.gameState.unlockedShips.length}/5`
    this.ufosCountElement.textContent = `${window.gameState.unlockedUfos.length}/5`
  }

  // Initialize menu
  initialize() {
    this.updateMenu()
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
}

// Initialize menu manager
window.menuManager = new MenuManager()
