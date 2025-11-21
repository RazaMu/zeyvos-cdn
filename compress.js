import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function compressImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const originalSize = fs.statSync(inputPath).size;
  
  console.log(`Processing ${inputPath}...`);
  
  // Get image metadata to determine current size
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  
  // Resize to max width of 600px for email clients (maintains aspect ratio)
  const maxWidth = 600;
  let resizeWidth = originalWidth > maxWidth ? maxWidth : originalWidth;
  
  // Create rounded corners SVG overlay
  const roundedCorners = Buffer.from(`
    <svg>
      <rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" rx="10" ry="10"/>
    </svg>
  `);
  
  if (ext === '.png') {
    await sharp(inputPath)
      .resize(resizeWidth, null, { withoutEnlargement: true })
      .composite([{
        input: roundedCorners,
        blend: 'dest-in'
      }])
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(inputPath + '.tmp');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(inputPath)
      .resize(resizeWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(inputPath + '.tmp');
  }
  
  const compressedSize = fs.statSync(inputPath + '.tmp').size;
  const newMetadata = await sharp(inputPath + '.tmp').metadata();
  
  // Replace original with compressed
  fs.unlinkSync(inputPath);
  fs.renameSync(inputPath + '.tmp', inputPath);
  
  const saved = originalSize - compressedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);
  
  console.log(`  Original: ${originalWidth}x${originalHeight}, ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Processed: ${newMetadata.width}x${newMetadata.height}, ${(compressedSize / 1024).toFixed(2)} KB`);
  console.log(`  Saved: ${(saved / 1024).toFixed(2)} KB (${percent}%)\n`);
}

async function main() {
  const images = ['Frame_5-removebg-preview.png', 'Group_3-removebg-preview.png', 'image.png'];
  
  for (const image of images) {
    if (fs.existsSync(image)) {
      await compressImage(image);
    } else {
      console.log(`Image not found: ${image}`);
    }
  }
  
  console.log('✓ All images compressed!');
}

main().catch(console.error);
