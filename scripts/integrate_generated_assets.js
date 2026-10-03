import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

function perfectBackgroundRemoval(image, colorTolerance = 30) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;

  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);

  function matchesBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return (r >= 240 && g >= 240 && b >= 240) ||
           (Math.abs(r - 255) <= colorTolerance && Math.abs(g - 255) <= colorTolerance && Math.abs(b - 255) <= colorTolerance);
  }

  const queue = [];
  for (let x = 0; x < w; x++) {
    if (matchesBg(x, 0)) { queue.push(0 * w + x); visited[0 * w + x] = 1; }
    if (matchesBg(x, h - 1)) { queue.push((h - 1) * w + x); visited[(h - 1) * w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    if (matchesBg(0, y)) { queue.push(y * w + 0); visited[y * w + 0] = 1; }
    if (matchesBg(w - 1, y)) { queue.push(y * w + (w - 1)); visited[y * w + (w - 1)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    isBg[curr] = 1;
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          if (matchesBg(nx, ny)) {
            queue.push(nIdx);
          }
        }
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const dataIdx = pIdx * 4;
      if (isBg[pIdx]) {
        data[dataIdx + 3] = 0;
      } else {
        let bgNeighbors = 0;
        if (x > 0 && isBg[pIdx - 1]) bgNeighbors++;
        if (x < w - 1 && isBg[pIdx + 1]) bgNeighbors++;
        if (y > 0 && isBg[pIdx - w]) bgNeighbors++;
        if (y < h - 1 && isBg[pIdx + w]) bgNeighbors++;
        if (bgNeighbors > 0 && data[dataIdx] > 220 && data[dataIdx + 1] > 220 && data[dataIdx + 2] > 220) {
          data[dataIdx + 3] = Math.max(120, 255 - bgNeighbors * 35);
        }
      }
    }
  }
  return image;
}

function autoCrop(image) {
  let minX = image.bitmap.width, maxX = 0;
  let minY = image.bitmap.height, maxY = 0;
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 20) {
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
    return image.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  return image;
}

async function integrate() {
  const brainDir = 'C:/Users/vop11/.gemini/antigravity-ide/brain/c3ecd001-c167-4c80-9393-c6c3cd1188b4';
  const brainFiles = fs.readdirSync(brainDir);

  function findLatestBrainFile(prefix) {
    const matches = brainFiles.filter(f => f.startsWith(prefix) && f.endsWith('.jpg'));
    if (matches.length === 0) return null;
    matches.sort();
    return path.join(brainDir, matches[matches.length - 1]);
  }

  // 1. Characters
  const charMappings = [
    { prefix: 'char_student_boy', target: 'public/assets/characters/student_boy.png' },
    { prefix: 'char_student_girl', target: 'public/assets/characters/student_girl.png' },
    { prefix: 'char_grandma', target: 'public/assets/characters/grandma.png' },
    { prefix: 'char_grandpa', target: 'public/assets/characters/grandpa.png' },
    { prefix: 'char_vip_lady', target: 'public/assets/characters/vip_lady.png' }
  ];

  for (const c of charMappings) {
    const src = findLatestBrainFile(c.prefix);
    if (src) {
      const img = await Jimp.read(src);
      perfectBackgroundRemoval(img, 30);
      autoCrop(img);
      await img.write(c.target);
      console.log(`✓ Integrated Character: ${c.prefix} -> ${c.target}`);
    }
  }

  // 2. Backgrounds
  const bgShopSrc = findLatestBrainFile('bg_street_shop');
  if (bgShopSrc) {
    const bgImg = await Jimp.read(bgShopSrc);
    await bgImg.write('public/assets/backgrounds/bg_street_shop.png');
    await bgImg.write('public/assets/backgrounds/bg_school_gate.png');
    console.log('✓ Integrated Background: bg_street_shop.png');
  }

  // 3. Platter
  const platterSrc = findLatestBrainFile('ui_platter');
  if (platterSrc) {
    const pImg = await Jimp.read(platterSrc);
    perfectBackgroundRemoval(pImg, 30);
    autoCrop(pImg);
    await pImg.write('public/assets/ui/platter_basket.png');
    console.log('✓ Integrated Platter: platter_basket.png');
  }

  // 4. Food Items
  const foodMappings = [
    { prefix: 'food_fish_balls', target: 'public/assets/ingredients/fish_ball.png' },
    { prefix: 'food_fish_balls', target: 'public/assets/ingredients/fried_fish_ball.png' },
    { prefix: 'food_beef_balls', target: 'public/assets/ingredients/beef_ball.png' },
    { prefix: 'food_cheese_balls', target: 'public/assets/ingredients/cheese_ball.png' }
  ];

  for (const f of foodMappings) {
    const src = findLatestBrainFile(f.prefix);
    if (src) {
      const img = await Jimp.read(src);
      perfectBackgroundRemoval(img, 30);
      autoCrop(img);
      await img.write(f.target);
      console.log(`✓ Integrated Food: ${f.prefix} -> ${f.target}`);
    }
  }

  console.log('=== ALL GENERATED ASSETS INTEGRATED SUCCESSFULLY ===');
}

integrate().catch(console.error);
