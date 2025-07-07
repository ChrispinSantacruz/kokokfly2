// Customization functionality
class CustomizationManager {
  constructor() {
    this.shipsContainer = document.getElementById("shipsContainer")
    this.ufosContainer = document.getElementById("ufosContainer")
  }

  // Render vehicle cards
  renderVehicles() {
    this.renderShips()
    this.renderUfos()
  }

  renderShips() {
    if (!this.shipsContainer) return

    this.shipsContainer.innerHTML = ""

    window.vehicles.ships.forEach((ship) => {
      const isUnlocked = window.gameState.unlockedShips.includes(ship.id)
      const isSelected = window.gameState.selectedShip === ship.id

      const vehicleCard = this.createVehicleCard(ship, isUnlocked, isSelected, "ship")
      this.shipsContainer.appendChild(vehicleCard)
    })
  }

  renderUfos() {
    if (!this.ufosContainer) return

    this.ufosContainer.innerHTML = ""

    window.vehicles.ufos.forEach((ufo) => {
      const isUnlocked = window.gameState.unlockedUfos.includes(ufo.id)
      const isSelected = window.gameState.selectedUfo === ufo.id

      const vehicleCard = this.createVehicleCard(ufo, isUnlocked, isSelected, "ufo")
      this.ufosContainer.appendChild(vehicleCard)
    })
  }

  createVehicleCard(vehicle, isUnlocked, isSelected, type) {
    const card = document.createElement("div")
    card.className = `vehicle-card ${isSelected ? "selected" : ""} ${isUnlocked ? "unlocked" : "locked"}`

    if (isUnlocked) {
      card.addEventListener("click", () => this.selectVehicle(type, vehicle.id))
    }

    card.innerHTML = `
            <div class="vehicle-image">
                <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
            </div>
            <div class="vehicle-info">
                <div class="vehicle-name">${vehicle.name}</div>
                <div class="vehicle-unlock">${window.vehicleUtils.getUnlockText(vehicle)}</div>
            </div>
            <div class="vehicle-status">
                ${
                  isSelected ? '<span class="icon-check"></span>' : !isUnlocked ? '<span class="icon-lock"></span>' : ""
                }
            </div>
        `

    return card
  }

  selectVehicle(type, id) {
    const success = window.gameState.selectVehicle(type, id)
    if (success) {
      this.renderVehicles()
      this.showSelectionFeedback(type, id)
    }
  }

  showSelectionFeedback(type, id) {
    const vehicle = window.vehicleUtils.getVehicle(type === "ship" ? "ships" : "ufos", id)
    if (vehicle) {
      console.log(`Selected ${vehicle.name}`)
    }
  }

  // Initialize customization
  initialize() {
    this.renderVehicles()
  }
}

// Initialize customization manager
window.customizationManager = new CustomizationManager()
