// Game State Management
class GameState {
  constructor() {
    this.playerName = ""
    this.easyHighScore = 0
    this.hardHighScore = 0
    this.unlockedShips = [0] // First ship always unlocked
    this.unlockedUfos = [0] // First UFO always unlocked
    this.selectedShip = 0
    this.selectedUfo = 0
    this.currentLevel = "easy"
    this.currentScore = 0
    this.gameRunning = false
    this.gamePaused = false
    this.allPlayersData = {} // Store data for all players

    this.loadFromStorage()
  }

  // Save game state to localStorage
  saveToStorage() {
    // Save current player data
    if (this.playerName) {
      this.allPlayersData[this.playerName] = {
        easyHighScore: this.easyHighScore,
        hardHighScore: this.hardHighScore,
        unlockedShips: this.unlockedShips,
        unlockedUfos: this.unlockedUfos,
        selectedShip: this.selectedShip,
        selectedUfo: this.selectedUfo,
      }
    }
    
    // Save global data with all players
    const data = {
      lastPlayerName: this.playerName,
      allPlayersData: this.allPlayersData,
    }
    localStorage.setItem("kokok-fly-data", JSON.stringify(data))
  }

  // Load game state from localStorage
  loadFromStorage() {
    const saved = localStorage.getItem("kokok-fly-data")
    if (saved) {
      const data = JSON.parse(saved)
      
      // Load all players data
      this.allPlayersData = data.allPlayersData || {}
      
      // Load last player if exists
      if (data.lastPlayerName) {
        this.loadPlayer(data.lastPlayerName)
      }
    }
  }

  // Load specific player data
  loadPlayer(playerName) {
    this.playerName = playerName
    
    // Load player-specific data if exists
    if (this.allPlayersData[playerName]) {
      const playerData = this.allPlayersData[playerName]
      this.easyHighScore = playerData.easyHighScore || 0
      this.hardHighScore = playerData.hardHighScore || 0
      this.unlockedShips = playerData.unlockedShips || [0]
      this.unlockedUfos = playerData.unlockedUfos || [0]
      this.selectedShip = playerData.selectedShip || 0
      this.selectedUfo = playerData.selectedUfo || 0
    } else {
      // New player - reset to defaults
      this.easyHighScore = 0
      this.hardHighScore = 0
      this.unlockedShips = [0]
      this.unlockedUfos = [0]
      this.selectedShip = 0
      this.selectedUfo = 0
    }
    
    this.saveToStorage()
  }

  // Update high score and check for unlocks
  updateScore(score, level) {
    this.currentScore = score
    const newUnlocks = []

    if (level === "easy") {
      if (score > this.easyHighScore) {
        this.easyHighScore = score
      }

      // Check for ship unlocks
      const shipUnlocks = [10, 25, 50, 100]
      shipUnlocks.forEach((threshold, index) => {
        const shipId = index + 1
        if (score >= threshold && !this.unlockedShips.includes(shipId)) {
          this.unlockedShips.push(shipId)
          newUnlocks.push({ type: "ship", id: shipId, name: `Ship ${shipId + 1}` })
        }
      })
    } else if (level === "hard") {
      if (score > this.hardHighScore) {
        this.hardHighScore = score
      }

      // Check for UFO unlocks
      const ufoUnlocks = [10, 25, 50, 100]
      ufoUnlocks.forEach((threshold, index) => {
        const ufoId = index + 1
        if (score >= threshold && !this.unlockedUfos.includes(ufoId)) {
          this.unlockedUfos.push(ufoId)
          newUnlocks.push({ type: "ufo", id: ufoId, name: `UFO ${ufoId + 1}` })
        }
      })
    }

    this.saveToStorage()
    return newUnlocks
  }

  // Select vehicle
  selectVehicle(type, id) {
    if (type === "ship" && this.unlockedShips.includes(id)) {
      this.selectedShip = id
      this.saveToStorage()
      return true
    } else if (type === "ufo" && this.unlockedUfos.includes(id)) {
      this.selectedUfo = id
      this.saveToStorage()
      return true
    }
    return false
  }

  // Get current vehicle
  getCurrentVehicle() {
    const vehicles = window.vehicles || {
      ships: [{ name: "Default Ship" }],
      ufos: [{ name: "Default UFO" }],
    }

    if (this.currentLevel === "easy") {
      return vehicles.ships[this.selectedShip] || vehicles.ships[0]
    } else {
      return vehicles.ufos[this.selectedUfo] || vehicles.ufos[0]
    }
  }

  // Reset game state (for testing)
  reset() {
    this.playerName = ""
    this.easyHighScore = 0
    this.hardHighScore = 0
    this.unlockedShips = [0]
    this.unlockedUfos = [0]
    this.selectedShip = 0
    this.selectedUfo = 0
    this.saveToStorage()
  }

  // Delete player data
  deletePlayer(playerName) {
    if (this.allPlayersData[playerName]) {
      delete this.allPlayersData[playerName]
      
      // If current player is deleted, reset to defaults
      if (this.playerName === playerName) {
        this.playerName = ""
        this.easyHighScore = 0
        this.hardHighScore = 0
        this.unlockedShips = [0]
        this.unlockedUfos = [0]
        this.selectedShip = 0
        this.selectedUfo = 0
      }
      
      this.saveToStorage()
      return true
    }
    return false
  }

  // Get all players list
  getAllPlayers() {
    return Object.keys(this.allPlayersData).map(name => ({
      name,
      data: this.allPlayersData[name]
    }))
  }
}

// Global game state instance
window.gameState = new GameState()
