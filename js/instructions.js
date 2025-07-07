// Instructions functionality
class InstructionsManager {
  constructor() {
    // Instructions are mostly static, but we can add interactive elements here
    this.initializeInteractiveElements()
  }

  initializeInteractiveElements() {
    // Add hover effects to control demonstrations
    const controlBtns = document.querySelectorAll(".control-btn")
    controlBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.1)"
      })

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)"
      })
    })

    // Add click effects to rule items
    const ruleItems = document.querySelectorAll(".rule-item")
    ruleItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.style.animation = "pulse 0.5s ease-out"
        setTimeout(() => {
          item.style.animation = ""
        }, 500)
      })
    })
  }

  // Initialize instructions
  initialize() {
    // Instructions are static, no dynamic content needed
  }
}

// Initialize instructions manager
window.instructionsManager = new InstructionsManager()
