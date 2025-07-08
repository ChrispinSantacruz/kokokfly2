// Script para optimizar la imagen bot.png para Telegram
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImageForTelegram() {
  const inputPath = path.join(__dirname, 'images', 'bot.png');
  const outputPath = path.join(__dirname, 'images', 'bot-optimized.png');
  
  try {
    // Verificar si la imagen existe
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Image not found:', inputPath);
      return;
    }
    
    // Obtener información de la imagen original
    const metadata = await sharp(inputPath).metadata();
    console.log('📊 Original image info:');
    console.log(`   📐 Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`   💾 Size: ${(fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Optimizar para Telegram
    // Telegram límites: max 10MB, max 10000x10000 pixels
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;
    
    // Si es muy grande, redimensionar manteniendo aspect ratio
    if (metadata.width > 2048 || metadata.height > 2048) {
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio > 1) {
        // Landscape
        targetWidth = 2048;
        targetHeight = Math.round(2048 / aspectRatio);
      } else {
        // Portrait or square
        targetHeight = 2048;
        targetWidth = Math.round(2048 * aspectRatio);
      }
    }
    
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        quality: 90,
        compressionLevel: 6
      })
      .toFile(outputPath);
    
    // Verificar resultado
    const optimizedMetadata = await sharp(outputPath).metadata();
    const optimizedSize = fs.statSync(outputPath).size;
    
    console.log('✅ Optimized image created:');
    console.log(`   📐 Dimensions: ${optimizedMetadata.width}x${optimizedMetadata.height}`);
    console.log(`   💾 Size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📁 Saved as: ${outputPath}`);
    
    // Verificar si cumple los límites de Telegram
    const sizeOK = optimizedSize < 10 * 1024 * 1024; // < 10MB
    const dimensionsOK = optimizedMetadata.width <= 10000 && optimizedMetadata.height <= 10000;
    
    if (sizeOK && dimensionsOK) {
      console.log('🎉 Image is now Telegram-compatible!');
    } else {
      console.log('⚠️  Image might still have issues:');
      if (!sizeOK) console.log('   📦 Size too large');
      if (!dimensionsOK) console.log('   📐 Dimensions too large');
    }
    
  } catch (error) {
    console.error('❌ Error optimizing image:', error);
    console.log('\n💡 Alternative solutions:');
    console.log('   1. Use a different image with smaller dimensions');
    console.log('   2. Use an online image compressor');
    console.log('   3. Send image and text separately');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🖼️  Optimizing bot.png for Telegram...\n');
  optimizeImageForTelegram();
}

module.exports = { optimizeImageForTelegram }; 