import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function compressImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const originalSize = fs.statSync(inputPath).size;
  
  console.log(`Compressing ${inputPath}...`);
  
  if (ext === '.png') {
    await sharp(inputPath)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(inputPath + '.tmp');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(inputPath)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(inputPath + '.tmp');
  }
  
  const compressedSize = fs.statSync(inputPath + '.tmp').size;
  
  // Replace original with compressed
  fs.unlinkSync(inputPath);
  fs.renameSync(inputPath + '.tmp', inputPath);
  
  const saved = originalSize - compressedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);
  
  console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
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
