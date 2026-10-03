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
    return (r >= 238 && g >= 238 && b >= 238) ||
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

  const items = [
    { prefix: 'takeout_box_open', target: 'public/assets/ui/takeout_box_open.png' },
    { prefix: 'takeout_box_closed', target: 'public/assets/ui/takeout_box_closed.png' },
    { prefix: 'pan_deep_fryer', target: 'public/assets/ui/pan_deep_fryer.png' }
  ];

  for (const it of items) {
    const src = findLatestBrainFile(it.prefix);
    if (src) {
      const img = await Jimp.read(src);
      perfectBackgroundRemoval(img, 30);
      autoCrop(img);
      await img.write(it.target);
      console.log(`✓ Integrated: ${it.prefix} -> ${it.target} (${img.bitmap.width}x${img.bitmap.height})`);
    }
  }

  console.log('=== FRYER AND TAKEOUT BOX ASSETS READY ===');
}

integrate().catch(console.error);
