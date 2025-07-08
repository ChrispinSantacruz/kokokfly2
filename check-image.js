// Script simple para verificar información de la imagen
const fs = require('fs');
const path = require('path');

function checkImageInfo(imageName) {
  const imagePath = path.join(__dirname, 'images', imageName);
  
  try {
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image not found:', imagePath);
      return false;
    }
    
    const stats = fs.statSync(imagePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`📊 Image file info (${imageName}):`);
    console.log(`   📁 Path: ${imagePath}`);
    console.log(`   💾 Size: ${sizeInMB} MB (${stats.size} bytes)`);
    console.log(`   📅 Modified: ${stats.mtime}`);
    
    // Telegram limits
    const maxSizeMB = 10;
    const sizeOK = stats.size < (maxSizeMB * 1024 * 1024);
    
    console.log('\n🤖 Telegram compatibility:');
    console.log(`   📦 Size limit (10MB): ${sizeOK ? '✅ OK' : '❌ Too large'}`);
    
    return sizeOK;
    
  } catch (error) {
    console.error('❌ Error checking image:', error);
    return false;
  }
}

// Ejecutar
if (require.main === module) {
  console.log('🖼️  Checking bot images information...\n');
  
  // Verificar imagen original
  const originalOK = checkImageInfo('bot.png');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Verificar imagen optimizada
  const optimizedOK = checkImageInfo('bot-optimized.png');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (optimizedOK) {
    console.log('✅ La imagen optimizada es compatible con Telegram!');
    console.log('🎯 Recomendación: Usar bot-optimized.png en el bot');
  } else if (originalOK) {
    console.log('✅ La imagen original es compatible con Telegram!');
    console.log('🎯 Recomendación: Usar bot.png en el bot');
  } else {
    console.log('❌ Ninguna imagen es compatible con Telegram');
    console.log('\n💡 Soluciones:');
    console.log('   1. Comprimir más la imagen usando herramientas online');
    console.log('   2. Usar una imagen diferente y más pequeña');
    console.log('   3. Enviar imagen y texto por separado');
    console.log('   4. Usar solo texto con emojis épicos');
  }
}

module.exports = { checkImageInfo }; 