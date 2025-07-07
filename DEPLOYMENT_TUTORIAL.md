# 🚀 Tutorial Completo: Frontend a Vercel + Backend a Render

## PASO 1: Preparar y Subir a Git

### 1.1 Inicializar Git (si no está hecho)
```bash
git init
git add .
git commit -m "Initial commit: Kokok The Roach game"
```

### 1.2 Subir a GitHub
```bash
# Crear repositorio en GitHub (github.com/new)
# Después conectar local con remoto:

git remote add origin https://github.com/TU-USUARIO/kokok-the-roach.git
git branch -M main
git push -u origin main
```

---

## PASO 2: Desplegar Backend en Render

### 2.1 Ir a Render
1. Ve a https://render.com
2. Regístrate con GitHub
3. Click en "New +" → "Web Service"

### 2.2 Conectar Repositorio
1. Selecciona tu repositorio `kokok-the-roach`
2. Click "Connect"

### 2.3 Configurar el Servicio
```
Name: kokok-roach-backend
Environment: Node
Region: Oregon (US West) - o el más cercano
Branch: main
Build Command: npm install
Start Command: npm start
```

### 2.4 Variables de Entorno (opcional)
```
NODE_ENV = production
```

### 2.5 Plan
- Seleccionar "Free Plan" ($0/mes)
- Click "Create Web Service"

### 2.6 Esperar Deploy
- El proceso toma 2-5 minutos
- ✅ Cuando esté listo, verás "Your service is live"
- 📝 ANOTA LA URL: https://kokok-roach-backend-XXXX.onrender.com

---

## PASO 3: Actualizar Frontend con URL de Render

### 3.1 Editar js/leaderboards.js
Busca la línea 17 que dice:
```javascript
return 'https://tu-backend-render.onrender.com/api';
```

Y cámbiala por tu URL real de Render:
```javascript
return 'https://kokok-roach-backend-XXXX.onrender.com/api';
```

### 3.2 Commit y Push
```bash
git add js/leaderboards.js
git commit -m "Update backend URL for Render deployment"
git push origin main
```

---

## PASO 4: Desplegar Frontend en Vercel

### 4.1 Ir a Vercel
1. Ve a https://vercel.com
2. Regístrate con GitHub
3. Click "Add New..." → "Project"

### 4.2 Import Repositorio
1. Busca tu repositorio `kokok-the-roach`
2. Click "Import"

### 4.3 Configurar Deploy
```
Project Name: kokok-the-roach
Framework Preset: Other
Root Directory: ./
Build Command: (dejar vacío)
Output Directory: (dejar vacío)
Install Command: (dejar vacío)
```

### 4.4 Variables de Entorno
- No necesitas ninguna para el frontend

### 4.5 Deploy
- Click "Deploy"
- Espera 1-2 minutos
- ✅ Verás "Your project has been deployed"
- 🎮 URL del juego: https://kokok-the-roach-XXXX.vercel.app

---

## PASO 5: Verificar que Todo Funciona

### 5.1 Probar el Juego
1. Abre tu URL de Vercel
2. Crea un jugador
3. Juega un nivel y termina con puntuación
4. Ve a Leaderboards

### 5.2 Verificar Conexión Backend
```javascript
// En consola del navegador:
debugLeaderboards.testConnection()
// Debería mostrar ✅ Connection successful
```

### 5.3 Problemas Comunes
❌ **"Connection failed"**
- Verifica que la URL en `js/leaderboards.js` sea correcta
- Asegúrate que Render esté funcionando (ve a tu dashboard de Render)

❌ **CORS Error**
- El backend ya tiene CORS habilitado, pero si hay problemas, ve a Render → Settings → Environment Variables y agrega:
```
CORS_ORIGIN = https://tu-proyecto.vercel.app
```

---

## PASO 6: URLs Finales y Compartir

### 🎮 Tu Juego Estará Disponible En:
- **Juego Principal**: https://tu-proyecto.vercel.app
- **API Backend**: https://tu-backend.onrender.com

### 📱 Compartir con Amigos
Simplemente comparte la URL de Vercel:
```
¡Juega Kokok The Roach! 🚀
https://tu-proyecto.vercel.app

- Dos modos de juego
- Leaderboards mundiales
- Funciona en móvil y PC
```

---

## PASO 7: Actualizaciones Futuras

### Para Actualizar el Juego:
```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push origin main
```

- **Vercel**: Se actualiza automáticamente en ~1 minuto
- **Render**: Se actualiza automáticamente en ~2-3 minutos

---

## 🛠️ Comandos de Debug

### Backend (Render)
```bash
# Ver logs en Render Dashboard → Logs
# O usar la API directamente:
curl https://tu-backend.onrender.com/api/stats
```

### Frontend (Vercel)
```javascript
// En consola del navegador:
debugLeaderboards.info()           // Ver configuración
debugLeaderboards.testConnection() // Probar conexión
debugBuildings.preloadStatus()     // Verificar imágenes
```

---

## 🎯 Resultado Final

✅ **Frontend en Vercel**: Juego principal y UI
✅ **Backend en Render**: API y leaderboards  
✅ **Automático**: Updates automáticos con git push
✅ **Global**: Accesible desde cualquier parte del mundo
✅ **Móvil**: Funciona perfectamente en móviles

## 💡 Tips Adicionales

1. **Dominios Custom**: Puedes agregar tu propio dominio en Vercel
2. **Monitoreo**: Render tiene logs en tiempo real
3. **Performance**: Ambos servicios tienen CDN global incluido
4. **SSL**: HTTPS automático en ambos servicios

---

## 🆘 Soporte

Si algo no funciona:
1. Revisa los logs en Render Dashboard
2. Usa F12 → Console en el navegador para ver errores
3. Usa los comandos de debug arriba

¡Tu juego estará disponible 24/7 para el mundo entero! 🌍🎮 