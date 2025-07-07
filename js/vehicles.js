// Vehicle definitions
window.vehicles = {
  ships: [
    {
      id: 0,
      name: "Classic Rocket",
      image: "images/kokok-rocket.png",
      unlockScore: 0,
      description: "Kokok's original rocket",
    },
    {
      id: 1,
      name: "Speed Car",
      image: "images/kokok-car.png",
      unlockScore: 10,
      description: "Faster and more agile",
    },
    {
      id: 2,
      name: "Turbo Rocket",
      image: "images/kokok-rocket.png",
      unlockScore: 25,
      description: "Enhanced with turbo boost",
    },
    {
      id: 3,
      name: "Plasma Rocket",
      image: "images/kokok-rocket.png",
      unlockScore: 50,
      description: "Powered by plasma energy",
    },
    {
      id: 4,
      name: "Quantum Rocket",
      image: "images/kokok-rocket.png",
      unlockScore: 100,
      description: "La tecnología de cohete definitiva",
    },
  ],

  ufos: [
    {
      id: 0,
      name: "Basic UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 0,
      description: "Tecnología alienígena estándar",
    },
    {
      id: 1,
      name: "Advanced UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 10,
      description: "Enhanced maneuverability",
    },
    {
      id: 2,
      name: "Elite UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 25,
      description: "Nave espacial de grado militar",
    },
    {
      id: 3,
      name: "Stealth UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 50,
      description: "Nearly invisible to enemies",
    },
    {
      id: 4,
      name: "Mothership UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 100,
      description: "The most powerful UFO",
    },
  ],
}

// Vehicle utility functions
window.vehicleUtils = {
  // Get vehicle by type and id
  getVehicle(type, id) {
    return window.vehicles[type] ? window.vehicles[type][id] : null
  },

  // Check if vehicle is unlocked
  isUnlocked(type, id) {
    if (type === "ships") {
      return window.gameState.unlockedShips.includes(id)
    } else if (type === "ufos") {
      return window.gameState.unlockedUfos.includes(id)
    }
    return false
  },

  // Get unlock requirements text
  getUnlockText(vehicle) {
    if (vehicle.unlockScore === 0) {
      return "Default"
    }
    return `Unlock at ${vehicle.unlockScore} points`
  },

  // Get all vehicles of a type
  getVehiclesByType(type) {
    return window.vehicles[type] || []
  },
}
