#!/usr/bin/env node

const os = require('os');

console.log('🔍 Buscando IP local...\n');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Buscar IPv4 no interna
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push({
          name: name,
          ip: interface.address
        });
      }
    }
  }
  
  return ips;
}

const localIPs = getLocalIP();

if (localIPs.length === 0) {
  console.log('❌ No se encontraron IPs locales');
  console.log('💡 Asegúrate de estar conectado a WiFi o Ethernet');
  process.exit(1);
}

console.log('📡 IPs encontradas:');
localIPs.forEach((item, index) => {
  console.log(`   ${index + 1}. ${item.name}: ${item.ip}`);
});

console.log('\n🎮 URLs para acceder al juego:');
localIPs.forEach((item, index) => {
  console.log(`   ${index + 1}. http://${item.ip}:3000`);
});

console.log('\n💻 Instrucciones:');
console.log('   1. Ejecuta "npm start" en este computador');
console.log('   2. En otros computadores, abre una de las URLs de arriba');
console.log('   3. ¡Todos jugarán con los mismos leaderboards!');

console.log('\n🔧 Si no funciona:');
console.log('   - Verifica que ambos computadores estén en la misma WiFi');
console.log('   - Desactiva temporalmente el firewall');
console.log('   - Prueba con diferentes IPs de la lista'); 