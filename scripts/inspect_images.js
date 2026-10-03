import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

async function check() {
  const folders = ['Ảnh/Giao diện', 'Ảnh/Nhân Vật'];
  for (const folder of folders) {
    if (!fs.existsSync(folder)) continue;
    const files = fs.readdirSync(folder);
    for (const f of files) {
      const fullPath = path.join(folder, f);
      if (fs.statSync(fullPath).isFile()) {
        try {
          const img = await Jimp.read(fullPath);
          console.log(`${f}: ${img.bitmap.width}x${img.bitmap.height}`);
        } catch (e) {
          console.error(`Error reading ${f}:`, e.message);
        }
      }
    }
  }
}

check();
