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
      name: "Classic Delorean",
      image: "images/kokok-car.png",
      unlockScore: 100,
      description: "Time-traveling classic car",
    },
    {
      id: 2,
      name: "Gold Rocket",
      image: "images/vehicles/easy3.png",
      unlockScore: 300,
      description: "Premium golden rocket ship",
    },
  ],

  ufos: [
    {
      id: 0,
      name: "Basic UFO",
      image: "images/kokok-ufo.png",
      unlockScore: 0,
      description: "Standard alien technology",
    },
    {
      id: 1,
      name: "Gold Delorean",
      image: "images/vehicles/hard2.png",
      unlockScore: 50,
      description: "Golden time machine in space",
    },
    {
      id: 2,
      name: "Gold UFO",
      image: "images/vehicles/hard3.png",
      unlockScore: 150,
      description: "Premium golden flying saucer",
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
