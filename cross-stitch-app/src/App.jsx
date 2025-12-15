import { useState } from "react";
import CanvasGrid from "./components/CanvasGrid";
import { processImageProfessional } from "./utils/edgeDetection";

export default function App() {
  const [gridSize, setGridSize] = useState({ width: 300, height: 200 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState({ colors: {}, pixelMap: [] });
  const [contourEnabled, setContourEnabled] = useState(true);
  const [edgeAlgorithm, setEdgeAlgorithm] = useState('outline');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 300;
      const maxHeight = 200;

      const scale = Math.min(
        maxWidth / img.width,
        maxHeight / img.height
      );

      const imgWidth = Math.floor(img.width * scale);
      const imgHeight = Math.floor(img.height * scale);

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      ctx.imageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      
      // 🔬 EDGE DETECTION PROFISSIONAL
      const edgeResult = processImageProfessional(imageData, imgWidth, imgHeight, edgeAlgorithm);

      const pixelMap = Array(imgHeight)
        .fill(null)
        .map(() => Array(imgWidth).fill(false));

      const colors = {};

      for (let y = 0; y < imgHeight; y++) {
        for (let x = 0; x < imgWidth; x++) {
          const i = (y * imgWidth + x) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];

          // Capturar TODOS os pixels da imagem (incluindo brancos)
          pixelMap[y][x] = true;
          colors[`${x},${y}`] = `rgb(${r},${g},${b})`;
        }
      }

      setPixels({ 
        pixelMap, 
        colors, 
        contourMap: edgeResult.backstitch,
        edgeAlgorithm: edgeResult.algorithm 
      });
      setGridSize({ width: imgWidth, height: imgHeight });
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cross Stitch Designer</h2>

      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />

        <label style={{ marginLeft: 15 }}>
          Zoom:
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          {zoom}x
        </label>

        <label style={{ marginLeft: 15 }}>
          <input
            type="checkbox"
            checked={contourEnabled}
            onChange={(e) => setContourEnabled(e.target.checked)}
          />
          Contorno Profissional
        </label>
        
        <label style={{ marginLeft: 15 }}>
          Algoritmo:
          <select
            value={edgeAlgorithm}
            onChange={(e) => setEdgeAlgorithm(e.target.value)}
            style={{ marginLeft: 5 }}
          >
            <option value="outline">Contorno Fino</option>
            <option value="canny">Canny Edge Detection</option>
            <option value="sobel">Sobel Edge Detection</option>
          </select>
        </label>
      </div>

      {gridSize.width > 0 && (
        <CanvasGrid
          width={gridSize.width}
          height={gridSize.height}
          zoom={zoom}
          pixels={pixels}
          contourEnabled={contourEnabled}
        />
      )}
    </div>
  );
}
