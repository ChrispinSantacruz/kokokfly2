# 🤖 Kokok The Roach - Telegram Bot

Get real-time leaderboards and game stats directly in Telegram!

## 🚀 Features

- **Real-time Leaderboards**: Access current top 10 players instantly
- **Dual Mode Support**: See champions from both Sky City and Crypto Space
- **Beautiful Formatting**: Clean display with emojis and rankings
- **Always Updated**: Connects directly to the game's live database
- **Remote Backend**: Fetches data from Render backend for real-time updates
- **Smart Fallbacks**: Render backend → MongoDB → JSON file priority system

## 📱 Bot Commands

### `/start`
Shows welcome message and game overview
- Introduction to Kokok The Roach
- Game modes explanation
- Available commands list

### `/leaderboards`
Displays top 10 champions from both game modes with epic celebration image
- 🖼️ Epic victory celebration image (Kokok with trophy!)
- 🏙️ Sky City Champions (top 10)
- 🌌 Crypto Space Legends (top 10)
- Medal emojis for top 3 positions
- Real-time data from the game server

## 🔧 Technical Details

### Integration
- **Server Integration**: Built into the main game server (server.js)
- **Remote Backend**: Connects to Render backend (https://kokokfly2.onrender.com)
- **Database Connection**: Uses MongoDB from Render backend with local fallbacks
- **Real-time Updates**: Fetches fresh data with each command
- **Error Handling**: Smart fallback system (Render → MongoDB → JSON)
- **Data Priority**: 
  1. Render backend API (`/api/leaderboards`)
  2. Local MongoDB connection
  3. Local JSON file fallback

### Bot Configuration
- **Token**: Configured via environment variable or hardcoded
- **Polling**: Uses long-polling for reliable message delivery
- **Parse Mode**: Markdown formatting for rich text display

## 📋 Installation & Setup

### Prerequisites
- Node.js server running Kokok The Roach game
- Telegram Bot Token from @BotFather

### Setup Steps
1. **Install Dependencies**
   ```bash
   npm install node-telegram-bot-api
   ```

2. **Configure Bot Token**
   - Set environment variable: `TELEGRAM_TOKEN=your_bot_token`
   - Or update the hardcoded token in server.js

3. **Start Server**
   ```bash
   npm start
   ```

4. **Verify Bot**
   - Check console for "Telegram Bot: ✅ Active"
   - Send `/start` to your bot to test

## 🎮 User Experience

### Example Interaction
```
User: /leaderboards
Bot: 🔄 Loading champions data... Please wait! ⏳

[EPIC CELEBRATION IMAGE: Kokok holding golden trophy with victory celebration! 🏆🪳💰]

Caption:
🏆 KOKOK THE ROACH - CHAMPIONS LEADERBOARD 🏆

🏙️ SKY CITY CHAMPIONS 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 PlayerOne - 450 pts
🥈 SpaceAce - 380 pts
🥉 FlyMaster - 320 pts
4. SkyPilot - 280 pts

🌌 CRYPTO SPACE LEGENDS 🛸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 CryptoKing - 200 pts
🥈 StarLord - 180 pts
🥉 AstroNinja - 150 pts

💎 CHALLENGE ACCEPTED? 💎
Play now and claim your spot among the champions!
🎮 Ready to fly with Kokok The Roach? 🪳✨
```

## 🛠️ Customization

### Message Formatting
- Modify `formatLeaderboardMessage()` function
- Update emojis, text, and layout
- Add more game statistics

### Additional Commands
- Add new bot commands in server.js
- Implement game stats, player profiles, etc.
- Extend with game notifications

## 🔍 Error Handling

- **Network Issues**: Fallback error messages
- **Database Errors**: Graceful degradation
- **Image Issues**: Multiple fallback strategies for bot.png
  - Try optimized image first (if exists)
  - Try original image with caption
  - Try image and text separately  
  - Fallback to epic text-only with emojis
- **Bot Errors**: Logging and recovery
- **User Errors**: Helpful error messages

### Image Troubleshooting
If you encounter `PHOTO_INVALID_DIMENSIONS` errors:
1. Run `npm run check-image` to verify image info
2. Try `npm run optimize-image` to create a smaller version
3. The bot automatically uses fallback strategies
4. Epic text-only mode is always available as final fallback

## 📊 Monitoring

### Console Logs
- Bot initialization status
- Command usage tracking
- Error reporting
- Performance metrics

### Debug Information
```javascript
// Available in console
📱 Leaderboards sent to Telegram chat 12345
🤖 Telegram Bot: ✅ Active
📱 Commands: /start, /leaderboards
```

## 🚀 Deployment

### Production Considerations
- Use environment variables for sensitive data
- Implement rate limiting if needed
- Monitor bot usage and performance
- Set up webhooks for better performance (optional)

### Environment Variables
```bash
TELEGRAM_TOKEN=your_bot_token_here
MONGODB_URI=your_mongodb_connection_string
```

## 📞 Support

For bot issues or feature requests:
1. Check console logs for errors
2. Verify bot token and permissions
3. Test network connectivity
4. Review Telegram Bot API documentation

---

**Ready to dominate the leaderboards?** 🏆  
Use `/leaderboards` in Telegram to see current champions and join the competition! 