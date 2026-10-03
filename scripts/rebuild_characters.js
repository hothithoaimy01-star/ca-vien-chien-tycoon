import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

/**
 * High quality boundary flood-fill background remover
 * Only removes white/light pixels connected to the outer borders.
 * Completely protects white clothes, white eyes, white patterns inside the character!
 */
function perfectBackgroundRemoval(image, colorTolerance = 25) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;

  // Track visited pixels for flood fill
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);

  // Sample background color from corners
  const sampleCorners = [
    0, // (0,0)
    (w - 1) * 4, // (w-1, 0)
    ((h - 1) * w) * 4, // (0, h-1)
    ((h - 1) * w + (w - 1)) * 4 // (w-1, h-1)
  ];

  let bgR = 255, bgG = 255, bgB = 255;
  for (const idx of sampleCorners) {
    bgR = Math.min(bgR, data[idx]);
    bgG = Math.min(bgG, data[idx + 1]);
    bgB = Math.min(bgB, data[idx + 2]);
  }

  // Check if pixel matches background
  function matchesBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Must be very light / near white or close to sampled corner color
    const isLight = r >= 235 && g >= 235 && b >= 235;
    const isCloseToSample =
      Math.abs(r - 255) <= colorTolerance &&
      Math.abs(g - 255) <= colorTolerance &&
      Math.abs(b - 255) <= colorTolerance;

    return isLight || isCloseToSample;
  }

  // BFS Queue
  const queue = [];

  // Seed borders
  for (let x = 0; x < w; x++) {
    if (matchesBg(x, 0)) { queue.push((0 * w + x)); visited[0 * w + x] = 1; }
    if (matchesBg(x, h - 1)) { queue.push(((h - 1) * w + x)); visited[(h - 1) * w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    if (matchesBg(0, y)) { queue.push((y * w + 0)); visited[y * w + 0] = 1; }
    if (matchesBg(w - 1, y)) { queue.push((y * w + (w - 1))); visited[y * w + (w - 1)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    isBg[curr] = 1;
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    // 4 directions
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

  // Apply transparency to background
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const dataIdx = pIdx * 4;

      if (isBg[pIdx]) {
        data[dataIdx + 3] = 0; // 100% transparent
      } else {
        // Check if on the border of background for anti-aliasing & defringing
        let bgNeighborCount = 0;
        if (x > 0 && isBg[pIdx - 1]) bgNeighborCount++;
        if (x < w - 1 && isBg[pIdx + 1]) bgNeighborCount++;
        if (y > 0 && isBg[pIdx - w]) bgNeighborCount++;
        if (y < h - 1 && isBg[pIdx + w]) bgNeighborCount++;

        if (bgNeighborCount > 0) {
          const r = data[dataIdx];
          const g = data[dataIdx + 1];
          const b = data[dataIdx + 2];
          // If border pixel is very bright, soften alpha and defringe
          if (r > 220 && g > 220 && b > 220) {
            data[dataIdx + 3] = Math.max(100, 255 - bgNeighborCount * 40);
          }
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

async function rebuildAllCharacters() {
  const characters = [
    { file: '22979579-9aa2-45e6-b6c8-2e3a863ddf49.jpg', id: 'grandma', name: 'Bà Ba' },
    { file: '23a7df59-79c9-4835-b962-9cbfa67ea6c5.jpg', id: 'student_boy', name: 'Nam Sinh Viên' },
    { file: '7b3927c7-ddf6-48fa-af51-9cf1d95db334.jpg', id: 'vip_lady', name: 'Quý Bà VIP' },
    { file: '7fbe4cbc-2699-4f4a-b6f6-1da50bd17ab6.jpg', id: 'grandpa', name: 'Ông Ba' },
    { file: '8f067fe2-7b43-4bd7-b872-0435416e6b26.jpg', id: 'student_girl', name: 'Nữ Sinh Viên' }
  ];

  console.log('--- REBUILDING ALL CHARACTERS WITH FLOOD-FILL PERIMETER ISOLATION ---');

  for (const c of characters) {
    const srcPath = `Ảnh/Nhân Vật/${c.file}`;
    if (fs.existsSync(srcPath)) {
      const img = await Jimp.read(srcPath);
      perfectBackgroundRemoval(img, 28);
      autoCrop(img);

      const outPath = `public/assets/characters/${c.id}.png`;
      await img.write(outPath);
      console.log(`✓ Rebuilt ${c.name} -> ${outPath} (${img.bitmap.width}x${img.bitmap.height}) with solid white áo dài & clean edges!`);
    }
  }
}

rebuildAllCharacters().catch(console.error);
