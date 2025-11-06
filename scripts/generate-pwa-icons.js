/**
 * PWA Icon Generator Script
 * Generates all required PWA icons from a source image
 * 
 * Usage: node scripts/generate-pwa-icons.js <source-image>
 * 
 * Requirements: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '../client/public/icons');

async function generateIcons(sourceImage) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🎨 Generating PWA icons...\n');

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }

  // Generate shortcut icons
  const shortcuts = [
    { name: 'scan-shortcut.png', size: 96 },
    { name: 'sos-shortcut.png', size: 96 },
    { name: 'chat-shortcut.png', size: 96 },
    { name: 'reminder-shortcut.png', size: 96 }
  ];

  console.log('\n🔗 Generating shortcut icons...\n');

  for (const shortcut of shortcuts) {
    const outputPath = path.join(OUTPUT_DIR, shortcut.name);
    
    try {
      await sharp(sourceImage)
        .resize(shortcut.size, shortcut.size, {
          fit: 'contain',
          background: { r: 37, g: 99, b: 235, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${shortcut.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${shortcut.name}:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!');
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
}

// Get source image from command line argument
const sourceImage = process.argv[2];

if (!sourceImage) {
  console.error('❌ Please provide a source image path');
  console.log('Usage: node scripts/generate-pwa-icons.js <source-image>');
  process.exit(1);
}

if (!fs.existsSync(sourceImage)) {
  console.error(`❌ Source image not found: ${sourceImage}`);
  process.exit(1);
}

generateIcons(sourceImage).catch(error => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});
