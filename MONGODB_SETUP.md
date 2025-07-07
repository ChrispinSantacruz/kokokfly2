# 🍃 Configuración MongoDB Atlas para Kokok Fly

## 🚀 Configuración Rápida

### 1. Crear Cuenta en MongoDB Atlas (GRATIS)
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Sandbox - GRATIS)

### 2. Configurar Base de Datos
1. **Database Access**: Crea un usuario
   - Username: `kokokuser` 
   - Password: `tu-password-seguro`
   - Role: `readWrite` to any database

2. **Network Access**: Permitir todas las IPs
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)

### 3. Obtener Connection String
1. Ve a **Clusters** → **Connect**
2. Choose **Connect your application**
3. Copy el connection string:
   ```
   mongodb+srv://kokokuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4. Configurar Variables de Entorno

#### Para Desarrollo Local:
Crea un archivo `.env` en la raíz del proyecto:
```bash
MONGODB_URI=mongodb+srv://kokokuser:tu-password@cluster0.xxxxx.mongodb.net/kokokfly?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

#### Para Render.com (Producción):
En Render Dashboard → Settings → Environment:
```
MONGODB_URI=mongodb+srv://kokokuser:tu-password@cluster0.xxxxx.mongodb.net/kokokfly?retryWrites=true&w=majority
```

## 🔄 Migración Automática

El sistema migra automáticamente los datos del archivo `scores.json` a MongoDB la primera vez que se conecta.

### Verificar Migración:
```bash
# Endpoint para verificar stats
curl http://localhost:3000/api/stats

# Endpoint para ver leaderboards
curl http://localhost:3000/api/leaderboards
```

## 🛠️ Comandos Útiles

### Iniciar con MongoDB:
```bash
npm start
```

### Migrar datos manualmente:
```bash
curl -X POST http://localhost:3000/api/migrate-data
```

### Ver logs del servidor:
```bash
npm start
# Debería mostrar: "✅ MongoDB connected successfully"
```

## ⚡ Ventajas del Nuevo Sistema

✅ **Persistencia Permanente**: Los datos nunca se borran  
✅ **Escalabilidad**: MongoDB maneja millones de records  
✅ **Búsquedas Rápidas**: Índices optimizados  
✅ **Fallback**: Si falla MongoDB, usa JSON automáticamente  
✅ **Migración Automática**: Transfiere datos existentes  

## 🔧 Troubleshooting

### "MongoDB connection failed"
- Verifica las credenciales en MONGODB_URI
- Revisa que las IPs estén permitidas (0.0.0.0/0)
- Comprueba que el usuario tenga permisos readWrite

### "Using JSON file fallback"
- Normal cuando no hay MONGODB_URI configurado
- Los datos se guardan localmente en scores.json
- Para producción, SIEMPRE configura MongoDB

### Verificar Conexión:
```javascript
// En browser console:
debugLeaderboards.info()
```

## 📊 Estructura de Datos

```javascript
// Nuevo esquema MongoDB:
{
  playerName: "chris",
  score: 38,
  level: "easy",
  timestamp: "2025-07-06T05:35:54.817Z",
  date: "6/7/2025",
  playerLevel: "chris_easy" // Índice único
}
```

## 🌐 URLs Importantes

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Documentación**: https://docs.mongodb.com/atlas/
- **Troubleshooting**: https://docs.mongodb.com/atlas/troubleshoot-connection/ 