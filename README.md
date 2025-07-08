# 🚀 Kokok The Roach - Space Adventure Game

A thrilling space adventure game featuring Kokok The Roach, with two exciting game modes and multiplayer leaderboards.

## 🎮 Game Features

- **Sky City Mode**: Geometry Dash style controls - Hold to rise, release to fall
- **Crypto Space Mode**: Flappy Bird style controls - Tap to flap and fly
- **Advanced Pattern System**: Unlock complex obstacle patterns as you score higher
- **Vehicle Customization**: Unlock new ships and UFOs by achieving high scores
- **Multiplayer Leaderboards**: Compete with players worldwide
- **Telegram Bot Integration**: Get real-time leaderboards via Telegram
- **Responsive Design**: Play on desktop, mobile, and tablets
- **Automatic Orientation Control**: Smart rotation on mobile devices

## 🤖 Telegram Bot Features

Get real-time game stats and leaderboards directly in Telegram!

### Bot Commands
- `/start` - Welcome message and game overview
- `/leaderboards` - See top 10 champions from both Sky City and Crypto Space modes

### Features
- **Real-time Leaderboards**: Get instant access to current top players
- **Epic Victory Images**: Celebration artwork with Kokok holding trophy
- **Beautiful Formatting**: Clean, readable leaderboard display with emojis
- **Dual Mode Support**: See champions from both game modes
- **Always Updated**: Connects directly to the game's live database

### How to Use
1. Search for the Kokok The Roach bot on Telegram
2. Send `/start` to get started
3. Use `/leaderboards` to see current champions with epic celebration image
4. Challenge yourself to reach the top!

### Bot Features
- **Smart Image Handling**: Automatically optimizes images for Telegram
- **Fallback System**: Multiple strategies ensure leaderboards always work
- **Epic Celebrations**: Victory images with Kokok holding trophy
- **Real-time Data**: Always shows current game statistics

## 🚀 Quick Start

### Option 1: Local Play (Single Device)
```bash
# Install dependencies
npm install

# Start the game server
npm start

# Open browser and go to:
# http://localhost:3000
```

### Option 2: Network Play (Multiple Devices)
```bash
# Install dependencies
npm install

# Start the network server
npm run server

# The game will be available on:
# - Main computer: http://localhost:3000
# - Other devices: http://[YOUR-IP]:3000
```

## 📱 Supported Platforms

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablets**: iPad, Android tablets

## 🎯 Game Modes

### Sky City - Building Navigation
- Hold mouse/touch to rise
- Release to fall
- Navigate between static buildings
- Advanced patterns unlock at 50, 100, 150, 200 points
- Pattern types: Tunnel, Staircase, Zigzag, Maze

### Crypto Space - Asteroid Field
- Tap/click to boost upward
- Gravity pulls you down constantly
- Collect blue crystals for bonus points
- Avoid red meteorites and purple explosives
- Advanced patterns unlock at 60, 80, 100 points
- Pattern types: Circular Wave, V-Formation, Asteroid Rain

## 🏆 Unlock System

### Ships (Sky City Mode)
- **Classic Rocket**: Available by default
- **Score 100**: Unlock Classic Delorean
- **Score 300**: Unlock Gold Rocket

### UFOs (Crypto Space Mode)
- **Basic UFO**: Available by default
- **Score 50**: Unlock Gold Delorean
- **Score 150**: Unlock Gold UFO

## 🔧 Technical Features

- **Canvas-based Rendering**: Smooth 60fps gameplay
- **Smart Image Preloading**: Zero-lag obstacle generation
- **Responsive Canvas**: Adapts to any screen size
- **Network Leaderboards**: Real-time score syncing
- **Local Storage**: Persistent player progress
- **Orientation Control**: Automatic landscape/portrait switching

## 📋 Controls

### Desktop
- **Mouse**: Hold/Click to fly
- **Keyboard**: Spacebar or Arrow Keys
- **ESC**: Pause game

### Mobile/Tablet
- **Touch**: Tap and hold to fly
- **Automatic**: Orientation switches to landscape during play

## 🛠️ Development

### Project Structure
```
kokok-fly-complete/
├── index.html          # Main game file
├── server.js           # Express server for leaderboards
├── package.json        # Dependencies and scripts
├── scores.json         # Leaderboard data storage
├── css/               # Stylesheets
├── js/                # Game logic
├── images/            # Game assets
└── README.md          # This file
```

### Core Files
- **gameEngine.js**: Main game logic and rendering
- **gameObjects.js**: Player, obstacles, and entities
- **gameState.js**: Progress and save management
- **leaderboards.js**: Network scoring system

## 🚀 Deployment

### Frontend Only
```bash
# Serve frontend files
npm run frontend
# Available at http://localhost:8080
```

### Full Stack (Recommended)
```bash
# Start backend server
npm start
# Game available at http://localhost:3000
```

### Network Deployment
1. Start server on main computer: `npm start`
2. Find your IP address in the console output
3. Share the IP:3000 URL with other players
4. Ensure all devices are on the same WiFi network

## 🎨 Customization

The game features customizable:
- **Vehicles**: Multiple ships and UFOs to unlock
- **Backgrounds**: Dynamic space environments
- **Difficulty**: Progressive pattern complexity
- **Controls**: Adaptable to different devices

## 🏆 High Score Tips

1. **Master the Controls**: Practice smooth movements
2. **Learn the Patterns**: Each pattern has safe routes
3. **Stay Centered**: Avoid edge positions
4. **Collect Bonuses**: Blue crystals in hard mode give extra points
5. **Unlock Vehicles**: Better vehicles = better performance

## 🔧 Troubleshooting

### Common Issues
- **Lag on Mobile**: Ensure good WiFi connection
- **Orientation Problems**: Enable auto-rotate in device settings
- **Leaderboard Issues**: Check network connection and firewall
- **Performance Issues**: Close other browser tabs

### Debug Commands
```javascript
// In browser console:
debugPatterns.showInfo()        // Show pattern information
debugBuildings.preloadStatus()  // Check image loading
debugLeaderboards.testConnection() // Test network connection
```

## 📄 License

MIT License - Feel free to modify and distribute!

## 🎮 Credits

Created with ❤️ for space adventure enthusiasts worldwide.

**Kokok The Roach** - The most adventurous roach in the galaxy! 🪳🚀 