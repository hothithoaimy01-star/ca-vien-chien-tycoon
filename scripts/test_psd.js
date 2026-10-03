import { readPsd, initializeCanvas } from 'ag-psd';
import fs from 'fs';
import { Jimp } from 'jimp';

initializeCanvas(
  (width, height) => {
    return {
      width,
      height,
      getContext: () => ({
        createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) })
      })
    };
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) })
);

async function testPsd() {
  const files = ['Tương Cà.jpg', 'Tương ớt.jpg', 'Đồ chua.jpg'];
  for (const f of files) {
    const p = 'Ảnh/Nhân Vật/' + f;
    const buf = fs.readFileSync(p);
    const psd = readPsd(buf, { useImageData: true, skipCompositeImageData: false });
    console.log(f, 'PSD size:', psd.width, psd.height, 'has imageData:', !!psd.imageData);
    if (psd.imageData) {
      const img = new Jimp({ width: psd.width, height: psd.height, data: Buffer.from(psd.imageData.data) });
      const outPath = `public/assets/sauces/${f.replace('.jpg', '.png')}`;
      fs.mkdirSync('public/assets/sauces', { recursive: true });
      await img.write(outPath);
      console.log('Saved successfully:', outPath);
    }
  }
}

testPsd();
