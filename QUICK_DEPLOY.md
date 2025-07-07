# ⚡ Guía Rápida de Deployment

## 🚀 Pasos Esenciales

### 1. Git & GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Backend → Render
1. render.com → New Web Service
2. Connect GitHub repo
3. Name: `kokok-roach-backend`
4. Build: `npm install`
5. Start: `npm start`
6. **COPIAR URL**: https://tu-backend.onrender.com

### 3. Actualizar Frontend
Editar `js/leaderboards.js` línea 17:
```javascript
return 'https://TU-URL-DE-RENDER.onrender.com/api';
```

### 4. Frontend → Vercel
1. vercel.com → New Project
2. Import GitHub repo
3. Deploy (sin configuración extra)
4. **JUEGO LISTO**: https://tu-proyecto.vercel.app

## 🧪 Verificar
```javascript
// En consola del navegador:
debugLeaderboards.testConnection()
```

## 🔗 URLs Importantes
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Tu Juego**: https://tu-proyecto.vercel.app

---
📖 **Guía completa**: Ver `DEPLOYMENT_TUTORIAL.md` 