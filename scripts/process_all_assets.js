import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

// Helper to remove white background by turning pixels close to pure white into transparent
function removeWhiteBackground(image, threshold = 245) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;

  // Flood-fill or perimeter-based transparency or pure white removal with smooth alpha edge
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if near white
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // transparent
    } else if (r >= threshold - 20 && g >= threshold - 20 && b >= threshold - 20) {
      // Soft antialiasing edge
      const minVal = Math.min(r, g, b);
      const alpha = Math.max(0, Math.min(255, (255 - minVal) * 10));
      data[i + 3] = alpha;
    }
  }
  return image;
}

// Helper to auto-crop transparent borders
function autoCrop(image) {
  let minX = image.bitmap.width, maxX = 0;
  let minY = image.bitmap.height, maxY = 0;
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 20) { // non-transparent
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX <= maxX && minY <= maxY) {
    const pad = 4;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    return image.crop({ x: minX, y: minY, w: cropW, h: cropH });
  }
  return image;
}

async function processAssets() {
  const assetsDir = 'public/assets';
  fs.mkdirSync(`${assetsDir}/characters`, { recursive: true });
  fs.mkdirSync(`${assetsDir}/ingredients`, { recursive: true });
  fs.mkdirSync(`${assetsDir}/sauces`, { recursive: true });
  fs.mkdirSync(`${assetsDir}/backgrounds`, { recursive: true });
  fs.mkdirSync(`${assetsDir}/ui`, { recursive: true });

  console.log('=== 1. PROCESSING CHARACTERS ===');
  const characterMap = [
    { file: '22979579-9aa2-45e6-b6c8-2e3a863ddf49.jpg', id: 'grandma', name: 'Bà Ba (Khách lớn tuổi)' },
    { file: '23a7df59-79c9-4835-b962-9cbfa67ea6c5.jpg', id: 'student_boy', name: 'Nam Sinh Viên' },
    { file: '7b3927c7-ddf6-48fa-af51-9cf1d95db334.jpg', id: 'vip_lady', name: 'Quý Bà VIP' },
    { file: '7fbe4cbc-2699-4f4a-b6f6-1da50bd17ab6.jpg', id: 'grandpa', name: 'Ông Ba (Chủ Quán / Khách)' },
    { file: '8f067fe2-7b43-4bd7-b872-0435416e6b26.jpg', id: 'student_girl', name: 'Nữ Sinh Viên' }
  ];

  for (const c of characterMap) {
    const srcPath = `Ảnh/Nhân Vật/${c.file}`;
    if (fs.existsSync(srcPath)) {
      const img = await Jimp.read(srcPath);
      removeWhiteBackground(img, 245);
      autoCrop(img);
      const outPath = `${assetsDir}/characters/${c.id}.png`;
      await img.write(outPath);
      console.log(`Processed character: ${c.name} -> ${outPath} (${img.bitmap.width}x${img.bitmap.height})`);
    }
  }

  console.log('=== 2. PROCESSING INGREDIENTS GRID ===');
  const gridPath = 'Ảnh/Nhân Vật/ebd47044-7d93-45a4-9ca8-b4f489a35a9c.jpg';
  if (fs.existsSync(gridPath)) {
    const gridImg = await Jimp.read(gridPath);
    const gw = gridImg.bitmap.width; // 1024
    const gh = gridImg.bitmap.height; // 559

    // 4 columns, 3 rows
    // Row 1: y: 25 to 190
    // Row 2: y: 200 to 365
    // Row 3: y: 375 to 535
    // Cols: x: 30-260, 270-500, 510-740, 750-990
    const items = [
      // Row 1
      { id: 'fish_ball', name: 'Cá Viên Nguyên Bản', col: 0, row: 0 },
      { id: 'fried_fish_ball', name: 'Cá Viên Chiên', col: 1, row: 0 },
      { id: 'beef_ball', name: 'Bò Viên', col: 2, row: 0 },
      { id: 'shrimp_ball', name: 'Tôm Viên', col: 3, row: 0 },
      // Row 2
      { id: 'salted_egg_ball', name: 'Cá Viên Trứng Muối', col: 0, row: 1 },
      { id: 'cheese_ball', name: 'Cá Viên Phô Mai', col: 1, row: 1 },
      { id: 'fish_tofu', name: 'Đậu Hũ Cá', col: 2, row: 1 },
      { id: 'tofu', name: 'Đậu Hũ Giòn', col: 3, row: 1 },
      // Row 3
      { id: 'fish_cake_strip', name: 'Chả Cá Sợi', col: 0, row: 2 },
      { id: 'veggies', name: 'Rau Củ (Dưa Leo/Đậu Bắp)', col: 1, row: 2 },
      { id: 'sauce_trio', name: 'Nước Chấm (Me/Ớt Xanh/Sate)', col: 2, row: 2 },
      { id: 'toppings_side', name: 'Hành Phi Đậu Phộng', col: 3, row: 2 }
    ];

    const colWidth = gw / 4;
    const rowHeight = gh / 3;

    for (const item of items) {
      const cell = gridImg.clone();
      // Crop cell area without label text at bottom of cell
      const cropX = Math.round(item.col * colWidth + 10);
      const cropY = Math.round(item.row * rowHeight + 8);
      const cropW = Math.round(colWidth - 20);
      const cropH = Math.round(rowHeight - 40); // exclude label

      cell.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
      removeWhiteBackground(cell, 245);
      autoCrop(cell);

      const outPath = `${assetsDir}/ingredients/${item.id}.png`;
      await cell.write(outPath);
      console.log(`Extracted ingredient: ${item.name} -> ${outPath} (${cell.bitmap.width}x${cell.bitmap.height})`);
    }
  }

  console.log('=== 3. PROCESSING BACKGROUNDS AND PLATTERS ===');
  // Street shop background
  const bgShopPath = 'Ảnh/Giao diện/4e39b33e-3ca0-4c60-8f58-41e646d71cfd.jpg';
  if (fs.existsSync(bgShopPath)) {
    const bg = await Jimp.read(bgShopPath);
    await bg.write(`${assetsDir}/backgrounds/bg_street_shop.png`);
    console.log(`Saved background street shop: ${assetsDir}/backgrounds/bg_street_shop.png`);
  }

  // School gate / Old town background
  const bgSchoolPath = 'Ảnh/Nhân Vật/Học sinh.jpg';
  if (fs.existsSync(bgSchoolPath)) {
    const bg = await Jimp.read(bgSchoolPath);
    await bg.write(`${assetsDir}/backgrounds/bg_school_gate.png`);
    console.log(`Saved background school gate: ${assetsDir}/backgrounds/bg_school_gate.png`);
  }

  // Platter image
  const platterSrc = 'Ảnh/Giao diện/b97fc63f-1d9b-4943-8e87-aa6d6ff666cc.jpg';
  if (fs.existsSync(platterSrc)) {
    const pImg = await Jimp.read(platterSrc);
    removeWhiteBackground(pImg, 248);
    autoCrop(pImg);
    await pImg.write(`${assetsDir}/ui/platter_basket.png`);
    console.log(`Saved platter: ${assetsDir}/ui/platter_basket.png (${pImg.bitmap.width}x${pImg.bitmap.height})`);
  }

  // Full banner infographic
  const bannerSrc = 'Ảnh/Giao diện/15511b5d-f3aa-4d62-9980-99ddc1c34c15.jpg';
  if (fs.existsSync(bannerSrc)) {
    const bImg = await Jimp.read(bannerSrc);
    await bImg.write(`${assetsDir}/ui/menu_infographic.png`);
    console.log(`Saved menu banner: ${assetsDir}/ui/menu_infographic.png`);
  }

  // Extract individual sauce bottles and side dishes from 44447f0b...
  const compositeSrc = 'Ảnh/Giao diện/44447f0b-b407-48df-8ef9-a294163995a3.jpg';
  if (fs.existsSync(compositeSrc)) {
    const cImg = await Jimp.read(compositeSrc);
    // Chili sauce bottle (top left: x: 50, y: 70, w: 120, h: 260)
    const chili = cImg.clone().crop({ x: 55, y: 80, w: 115, h: 250 });
    removeWhiteBackground(chili, 240);
    autoCrop(chili);
    await chili.write(`${assetsDir}/sauces/sauce_chili.png`);

    // Tomato sauce bottle (top mid-left: x: 175, y: 80, w: 125, h: 250)
    const tomato = cImg.clone().crop({ x: 180, y: 80, w: 120, h: 250 });
    removeWhiteBackground(tomato, 240);
    autoCrop(tomato);
    await tomato.write(`${assetsDir}/sauces/sauce_tomato.png`);

    // Black / Sweet Soy sauce bottle (top mid: x: 305, y: 65, w: 120, h: 265)
    const blackSoy = cImg.clone().crop({ x: 305, y: 65, w: 120, h: 265 });
    removeWhiteBackground(blackSoy, 240);
    autoCrop(blackSoy);
    await blackSoy.write(`${assetsDir}/sauces/sauce_black_soy.png`);

    // Pickled greens (top right: x: 510, y: 270, w: 200, h: 140)
    const pickled = cImg.clone().crop({ x: 510, y: 270, w: 200, h: 140 });
    removeWhiteBackground(pickled, 240);
    autoCrop(pickled);
    await pickled.write(`${assetsDir}/ingredients/pickled_greens.png`);

    // Okra bowl (mid right: x: 460, y: 580, w: 180, h: 150)
    const okra = cImg.clone().crop({ x: 460, y: 580, w: 180, h: 150 });
    removeWhiteBackground(okra, 240);
    autoCrop(okra);
    await okra.write(`${assetsDir}/ingredients/okra_bowl.png`);

    console.log('Saved individual sauces and side dishes from composite artwork!');
  }

  console.log('=== ALL ASSETS PROCESSED SUCCESSFULLY ===');
}

processAssets().catch(err => {
  console.error('Error processing assets:', err);
});
