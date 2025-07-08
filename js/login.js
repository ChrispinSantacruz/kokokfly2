// Login functionality
class LoginManager {
  constructor() {
    this.form = document.getElementById("loginForm")
    this.nameInput = document.getElementById("playerName")
    this.errorElement = document.getElementById("nameError")

    this.initializeEvents()
  }

  initializeEvents() {
    // Form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

    // Real-time validation
    this.nameInput.addEventListener("input", () => {
      this.clearError()
    })

    // Enter key support
    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleSubmit()
      }
    })
  }

  handleSubmit() {
    const name = this.nameInput.value.trim()

    // Validation
    if (!this.validateName(name)) {
      return
    }

    // Success
    this.clearError()
    
    // Load player-specific data
    window.gameState.loadPlayer(name)
    
    // Show welcome message for returning players
    if (window.gameState.allPlayersData[name]) {
      console.log(`Welcome back, ${name}!`)
      console.log(`Easy High Score: ${window.gameState.easyHighScore}`)
      console.log(`Hard High Score: ${window.gameState.hardHighScore}`)
          console.log(`Ships Unlocked: ${window.gameState.unlockedShips.length}/3`)
    console.log(`UFOs Unlocked: ${window.gameState.unlockedUfos.length}/3`)
    } else {
      console.log(`Welcome new player, ${name}!`)
    }
    
    window.screenManager.showScreen("menu")
  }

  validateName(name) {
    if (!name) {
      this.showError("Name is required")
      return false
    }

    if (name.length < 2) {
      this.showError("Name must be at least 2 characters")
      return false
    }

    if (name.length > 20) {
      this.showError("Name must be less than 20 characters")
      return false
    }

    // Check for valid characters
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      this.showError("Name can only contain letters, numbers, and spaces")
      return false
    }

    return true
  }

  showError(message) {
    this.errorElement.textContent = message
    this.errorElement.style.display = "block"
    this.nameInput.focus()
  }

  clearError() {
    this.errorElement.style.display = "none"
  }

  // Pre-fill name if already exists
  initialize() {
    if (window.gameState.playerName) {
      this.nameInput.value = window.gameState.playerName
    }
    this.updatePlayersList()
    this.nameInput.focus()
  }

  // Update players list
  updatePlayersList() {
    const playersList = document.getElementById('playersList')
    const playersContainer = document.getElementById('playersContainer')
    const players = Object.keys(window.gameState.allPlayersData)
    
    if (players.length === 0) {
      playersList.classList.add('hidden')
      return
    }
    
    playersList.classList.remove('hidden')
    playersContainer.innerHTML = ''
    
    players.forEach(playerName => {
      const playerData = window.gameState.allPlayersData[playerName]
      const playerCard = document.createElement('div')
      playerCard.className = 'player-card'
      playerCard.innerHTML = `
        <div class="player-name">${playerName}</div>
        <div class="player-stats">
          Easy: <span>${playerData.easyHighScore}</span><br>
          Hard: <span>${playerData.hardHighScore}</span><br>
          Ships: <span>${playerData.unlockedShips.length}/3</span>
        </div>
      `
      
      playerCard.addEventListener('click', () => {
        this.selectPlayer(playerName)
      })
      
      playersContainer.appendChild(playerCard)
    })
  }

  // Select existing player
  selectPlayer(playerName) {
    this.nameInput.value = playerName
    this.nameInput.focus()
    
    // Add visual feedback
    const playerCards = document.querySelectorAll('.player-card')
    playerCards.forEach(card => {
      card.style.background = 'rgba(255, 255, 255, 0.1)'
    })
    
    // Highlight selected player
    const selectedCard = [...playerCards].find(card => 
      card.querySelector('.player-name').textContent === playerName
    )
    if (selectedCard) {
      selectedCard.style.background = 'rgba(34, 211, 238, 0.3)'
    }
  }

  // Show available players (for debugging)
  showAvailablePlayers() {
    const players = Object.keys(window.gameState.allPlayersData)
    if (players.length > 0) {
      console.log('Available players:', players)
    }
  }
}

// Initialize login manager
window.loginManager = new LoginManager()

// --- OVERLAY DE ROTACIÓN RESPONSIVE ---
function shouldShowRotateOverlay() {
  return window.innerWidth <= 900 || window.matchMedia('(orientation: portrait)').matches;
}

function showRotateOverlayIfNeeded() {
  const overlay = document.getElementById('rotateOverlay');
  if (!overlay) return;
  if (shouldShowRotateOverlay()) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  showRotateOverlayIfNeeded();
  window.addEventListener('resize', showRotateOverlayIfNeeded);
  const btn = document.getElementById('continueRotateBtn');
  if (btn) {
    btn.onclick = function() {
      document.getElementById('rotateOverlay').classList.add('hidden');
    };
  }
});
