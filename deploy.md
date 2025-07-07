# 🚀 Kokok The Roach - Deployment Guide

## Frontend + Backend Deployment Options

### Option 1: Full Stack Deployment (Recommended)

**Files needed:**
```
kokok-fly-complete/
├── index.html
├── server.js
├── package.json
├── package-lock.json
├── css/ (all files)
├── js/ (all files)
├── images/ (all files)
└── start-network.bat/.sh
```

**Steps:**
```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Access game
# Local: http://localhost:3000
# Network: http://[YOUR-IP]:3000
```

### Option 2: Frontend Only Deployment

**Files needed:**
```
frontend/
├── index.html
├── css/ (all files)
├── js/ (all files - except server.js)
└── images/ (all files)
```

**Steps:**
```bash
# Serve static files
npx serve . -p 8080

# Or upload to any web hosting
# (GitHub Pages, Netlify, Vercel, etc.)
```

### Option 3: Separate Frontend/Backend

**Backend (API Server):**
```
backend/
├── server.js
├── package.json
├── package-lock.json
└── scores.json (created automatically)
```

**Frontend (Game Client):**
```
frontend/
├── index.html
├── css/ (all files)
├── js/ (all files except server.js)
├── images/ (all files)
└── Update API URL in leaderboards.js
```

## 🌐 Network Play Setup

### For Local Network (WiFi)
1. Run `npm start` on main computer
2. Note the IP address shown in console
3. Share `http://[IP]:3000` with other players
4. Ensure all devices are on same WiFi

### For Internet Deployment
1. Deploy backend to cloud service (Heroku, Railway, Fly.io)
2. Deploy frontend to static hosting (Netlify, Vercel, GitHub Pages)
3. Update `baseURL` in `js/leaderboards.js` to point to backend

## 🔧 Configuration

### Backend Configuration
**server.js** - Main server file
- Port: 3000 (configurable)
- CORS: Enabled for all origins
- Static files: Serves frontend automatically

### Frontend Configuration
**js/leaderboards.js** - Line ~16
```javascript
// For local network:
this.baseURL = `http://${window.location.hostname}:3000/api`;

// For cloud deployment:
this.baseURL = 'https://your-backend-url.com/api';
```

## 📋 Deployment Checklist

### Before Deployment:
- [ ] All images are optimized
- [ ] No console errors in browser
- [ ] Leaderboards working on local network
- [ ] Game works on mobile devices
- [ ] All vehicle unlocks functional

### Testing:
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS Safari, Android Chrome)
- [ ] Tablet devices
- [ ] Network play with multiple devices
- [ ] Orientation changes on mobile

### Performance:
- [ ] Game runs at 60fps
- [ ] No lag when obstacles appear
- [ ] Images preload correctly
- [ ] Responsive canvas works on all screen sizes

## 🌟 Production Recommendations

### Security:
- Add rate limiting for score submissions
- Validate all user inputs
- Use HTTPS in production

### Performance:
- Enable gzip compression
- Add CDN for static assets
- Implement image caching

### Monitoring:
- Add error logging
- Monitor server performance
- Track game analytics

## 🚀 Quick Deploy Commands

### Local Testing:
```bash
npm install && npm start
```

### Production Build:
```bash
npm run deploy
```

### Network Discovery:
```bash
# Windows
npm run server

# Linux/Mac
npm run server
```

## 📱 Mobile Optimization

The game is fully optimized for mobile:
- Touch controls
- Automatic orientation switching
- Responsive canvas
- Network play support

No additional mobile setup required! 🎮 