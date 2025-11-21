import sharp from 'sharp';
import fs from 'fs';

async function processImages() {
  const images = ['Frame_5-removebg-preview.png', 'Group_3-removebg-preview.png', 'image.png'];
  
  for (const image of images) {
    if (!fs.existsSync(image)) {
      console.log(`Image not found: ${image}`);
      continue;
    }
    
    console.log(`Processing ${image}...`);
    
    // Get image metadata
    const metadata = await sharp(image).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;
    
    // Resize to max width of 600px for email clients
    const maxWidth = 600;
    let resizeWidth = originalWidth > maxWidth ? maxWidth : originalWidth;
    let resizeHeight = null;
    
    if (originalWidth > maxWidth) {
      resizeHeight = Math.round((originalHeight / originalWidth) * maxWidth);
    }
    
    // Create rounded corners by compositing with an SVG mask
    const roundedImage = await sharp(image)
      .resize(resizeWidth, resizeHeight, { withoutEnlargement: true })
      .toBuffer();
    
    const resizedMetadata = await sharp(roundedImage).metadata();
    
    const roundedCorners = Buffer.from(`
      <svg width="${resizedMetadata.width}" height="${resizedMetadata.height}">
        <rect x="0" y="0" width="${resizedMetadata.width}" height="${resizedMetadata.height}" rx="10" ry="10" fill="white"/>
      </svg>
    `);
    
    await sharp(roundedImage)
      .composite([{
        input: roundedCorners,
        blend: 'dest-in'
      }])
      .png()
      .toFile(image + '.tmp');
    
    // Replace original
    fs.unlinkSync(image);
    fs.renameSync(image + '.tmp', image);
    
    const newMetadata = await sharp(image).metadata();
    console.log(`  Resized: ${originalWidth}x${originalHeight} → ${newMetadata.width}x${newMetadata.height}`);
    console.log(`  Rounded corners: 10px\n`);
  }
  
  console.log('✓ All images processed with rounded corners!');
}

processImages().catch(console.error);
