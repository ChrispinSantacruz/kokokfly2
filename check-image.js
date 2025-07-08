// Script simple para verificar información de la imagen
const fs = require('fs');
const path = require('path');

function checkImageInfo() {
  const imagePath = path.join(__dirname, 'images', 'bot.png');
  
  try {
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image not found:', imagePath);
      return;
    }
    
    const stats = fs.statSync(imagePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('📊 Image file info:');
    console.log(`   📁 Path: ${imagePath}`);
    console.log(`   💾 Size: ${sizeInMB} MB (${stats.size} bytes)`);
    console.log(`   📅 Modified: ${stats.mtime}`);
    
    // Telegram limits
    const maxSizeMB = 10;
    const sizeOK = stats.size < (maxSizeMB * 1024 * 1024);
    
    console.log('\n🤖 Telegram compatibility:');
    console.log(`   📦 Size limit (10MB): ${sizeOK ? '✅ OK' : '❌ Too large'}`);
    
    if (!sizeOK) {
      console.log('\n💡 Solutions:');
      console.log('   1. Compress the image using online tools');
      console.log('   2. Use a different, smaller image');
      console.log('   3. Send image and text separately');
      console.log('   4. Use text-only with epic emojis');
    }
    
    console.log('\n🎯 Recommended actions:');
    console.log('   1. Try sending image and text separately');
    console.log('   2. Use fallback to text-only with emojis');
    console.log('   3. Consider using a different celebration image');
    
  } catch (error) {
    console.error('❌ Error checking image:', error);
  }
}

// Ejecutar
if (require.main === module) {
  console.log('🖼️  Checking bot.png information...\n');
  checkImageInfo();
}

module.exports = { checkImageInfo }; 