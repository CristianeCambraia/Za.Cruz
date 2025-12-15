import React, { useRef } from 'react';

export default function SimpleImageConverter({ onGridGenerated }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = {};
      const contour = {};

      const idx = (x, y) => (y * img.width + x) * 4;

      for (let y = 1; y < img.height - 1; y++) {
        for (let x = 1; x < img.width - 1; x++) {
          const i = idx(x, y);
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];

          if (a < 20) continue;

          const color = `rgb(${r},${g},${b})`;
          pixels[`${x},${y}`] = color;

          // 🔴 DETECÇÃO REAL DE CONTORNO
          const neighbors = [
            idx(x + 1, y),
            idx(x - 1, y),
            idx(x, y + 1),
            idx(x, y - 1),
          ];

          for (const n of neighbors) {
            const nr = imageData.data[n];
            const ng = imageData.data[n + 1];
            const nb = imageData.data[n + 2];

            const diff =
              Math.abs(r - nr) +
              Math.abs(g - ng) +
              Math.abs(b - nb);

            if (diff > 60) {
              contour[`${x},${y}`] = true;
              break;
            }
          }
        }
      }

      onGridGenerated({
        colors: pixels,
        contourMap: contour,
        width: img.width,
        height: img.height
      });
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileChange}
    />
  );
}
