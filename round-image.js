import sharp from 'sharp';
import fs from 'fs';

async function roundCorners() {
  const image = 'Gemini_Generated_Image_slm7dbslm7dbslm7.png';
  
  console.log(`Adding 60px rounded corners to ${image}...`);
  
  // Get image metadata
  const metadata = await sharp(image).metadata();
  
  // Create SVG mask with rounded corners
  const roundedCorners = Buffer.from(`
    <svg width="${metadata.width}" height="${metadata.height}">
      <rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" rx="60" ry="60" fill="white"/>
    </svg>
  `);
  
  await sharp(image)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png()
    .toFile(image + '.tmp');
  
  // Replace original
  fs.unlinkSync(image);
  fs.renameSync(image + '.tmp', image);
  
  console.log(`✓ 60px rounded corners applied to ${image}`);
}

roundCorners().catch(console.error);
