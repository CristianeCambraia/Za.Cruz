import { useState } from "react";
import CanvasGrid from "./components/CanvasGrid";
import { processImageProfessional } from "./utils/edgeDetection";

export default function App() {
  const [gridSize, setGridSize] = useState({ width: 150, height: 100 });
  const [customWidth, setCustomWidth] = useState(150);
  const [customHeight, setCustomHeight] = useState(100);
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

      // Redimensionar para exatamente as dimensões especificadas
      const imgWidth = customWidth;
      const imgHeight = customHeight;

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      // Usar interpolação de alta qualidade para preservar detalhes
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
      
      // Aplicar sharpening para realçar detalhes
      const tempImageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      const sharpenedData = applySharpen(tempImageData, imgWidth, imgHeight);
      ctx.putImageData(sharpenedData, 0, 0);

      const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      
      // 🔬 EDGE DETECTION PROFISSIONAL (desabilitado para preservar detalhes)
      // const edgeResult = processImageProfessional(imageData, imgWidth, imgHeight, edgeAlgorithm);
      const edgeResult = { backstitch: {}, algorithm: 'none' };

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
  
  // Função para aplicar sharpening e realçar detalhes
  const applySharpen = (imageData, width, height) => {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Kernel de sharpening
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB apenas
          let sum = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[idx] * kernel[ky + 1][kx + 1];
            }
          }
          
          const idx = (y * width + x) * 4 + c;
          output[idx] = Math.max(0, Math.min(255, sum));
        }
        
        // Manter alpha
        const alphaIdx = (y * width + x) * 4 + 3;
        output[alphaIdx] = data[alphaIdx];
      }
    }
    
    // Copiar bordas
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
      
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        output[i] = data[i];
        output[i + 1] = data[i + 1];
        output[i + 2] = data[i + 2];
        output[i + 3] = data[i + 3];
      }
    }
    
    return new ImageData(output, width, height);
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
        
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 15 }}>
          Largura (pixels):
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(Number(e.target.value))}
            min="50"
            max="300"
            style={{ marginLeft: 5, width: '80px' }}
          />
        </label>
        
        <label>
          Altura (pixels):
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(Number(e.target.value))}
            min="50"
            max="200"
            style={{ marginLeft: 5, width: '80px' }}
          />
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
