import { useState, useRef, useCallback } from "react";
import CanvasGrid from "./components/CanvasGrid";
import { generateMonogram, MONOGRAM_STYLES } from "./utils/monograms";

// ================= ALGORITMO PROFISSIONAL SEM DITHERING =================

function getCrossStitchPalette() {
  return [
    { r: 0, g: 0, b: 0, name: 'Black-310' },
    { r: 255, g: 220, b: 177, name: 'Skin-Light' },
    { r: 241, g: 194, b: 125, name: 'Skin-Medium' },
    { r: 210, g: 150, b: 90, name: 'Skin-Dark' },
    { r: 255, g: 255, b: 255, name: 'White' },
    { r: 230, g: 230, b: 230, name: 'Gray-Light' },
    { r: 150, g: 150, b: 150, name: 'Gray-Medium' },
    { r: 135, g: 206, b: 250, name: 'Blue-Light' },
    { r: 70, g: 130, b: 180, name: 'Blue-Medium' },
    { r: 30, g: 70, b: 120, name: 'Blue-Dark' },
    { r: 255, g: 223, b: 0, name: 'Gold-Bright' },
    { r: 218, g: 165, b: 32, name: 'Gold-Medium' },
    { r: 184, g: 134, b: 11, name: 'Gold-Dark' },
    { r: 144, g: 238, b: 144, name: 'Green-Light' },
    { r: 60, g: 179, b: 113, name: 'Green-Medium' },
    { r: 255, g: 182, b: 193, name: 'Pink-Light' },
    { r: 255, g: 105, b: 180, name: 'Pink-Medium' },
    { r: 220, g: 20, b: 60, name: 'Red-Dark' },
    { r: 139, g: 90, b: 43, name: 'Brown-Light' },
    { r: 101, g: 67, b: 33, name: 'Brown-Medium' },
    { r: 70, g: 40, b: 20, name: 'Brown-Dark' }
  ];
}

function smartResize(imageData, width, height, targetWidth, targetHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  const tempImageData = tempCtx.createImageData(width, height);
  tempImageData.data.set(imageData);
  tempCtx.putImageData(tempImageData, 0, 0);
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, targetWidth, targetHeight);
  
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

function removeBackground(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    const isTransparent = a < 20 || (r > 250 && g > 250 && b > 250);
    
    if (isTransparent) {
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
      output[i + 3] = 0;
    } else {
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
      output[i + 3] = a;
    }
  }
  
  return output;
}

function detectAndEnhanceContours(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  output.set(imageData);
  
  const getPixel = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    const idx = (y * width + x) * 4;
    return {
      r: imageData[idx],
      g: imageData[idx + 1],
      b: imageData[idx + 2],
      a: imageData[idx + 3]
    };
  };
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const center = getPixel(x, y);
      
      if (!center || center.a < 20) continue;
      
      const neighbors = [
        getPixel(x - 1, y),
        getPixel(x + 1, y),
        getPixel(x, y - 1),
        getPixel(x, y + 1)
      ];
      
      let maxDiff = 0;
      for (const n of neighbors) {
        if (!n || n.a < 20) {
          maxDiff = 255;
          break;
        }
        
        const diff = Math.abs(center.r - n.r) + 
                     Math.abs(center.g - n.g) + 
                     Math.abs(center.b - n.b);
        maxDiff = Math.max(maxDiff, diff);
      }
      
      if (maxDiff > 80) {
        output[idx] = 0;
        output[idx + 1] = 0;
        output[idx + 2] = 0;
        output[idx + 3] = 255;
      }
    }
  }
  
  return output;
}

function findClosestPaletteColor(r, g, b, palette) {
  let minDist = Infinity;
  let closest = palette[0];
  
  for (const color of palette) {
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    const dist = Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
    
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }
  
  return closest;
}

function quantizeToLimitedPalette(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  const palette = getCrossStitchPalette();
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    if (a < 20) {
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
      output[i + 3] = 0;
      continue;
    }
    
    if (r < 30 && g < 30 && b < 30) {
      output[i] = 0;
      output[i + 1] = 0;
      output[i + 2] = 0;
      output[i + 3] = 255;
      continue;
    }
    
    const closest = findClosestPaletteColor(r, g, b, palette);
    output[i] = closest.r;
    output[i + 1] = closest.g;
    output[i + 2] = closest.b;
    output[i + 3] = 255;
  }
  
  return output;
}

function postProcess(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  output.set(imageData);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      const a = imageData[idx + 3];
      
      if (a < 20) continue;
      
      const brightness = (r + g + b) / 3;
      
      if (brightness > 200) {
        let darkNeighbors = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              const nBrightness = (imageData[nIdx] + imageData[nIdx + 1] + imageData[nIdx + 2]) / 3;
              
              if (nBrightness < 100) darkNeighbors++;
            }
          }
        }
        
        if (darkNeighbors >= 4) {
          output[idx] = 255;
          output[idx + 1] = 255;
          output[idx + 2] = 255;
        }
      }
    }
  }
  
  return output;
}

function professionalCrossStitchConversion(imageData, width, height, targetWidth, targetHeight) {
  console.log('1️⃣ Redimensionando...');
  const resized = smartResize(imageData, width, height, targetWidth, targetHeight);
  
  console.log('2️⃣ Removendo fundo...');
  const cleaned = removeBackground(resized.data, targetWidth, targetHeight);
  
  console.log('3️⃣ Detectando contornos...');
  const withContours = detectAndEnhanceContours(cleaned, targetWidth, targetHeight);
  
  console.log('4️⃣ Aplicando paleta limitada (SEM dithering)...');
  const quantized = quantizeToLimitedPalette(withContours, targetWidth, targetHeight);
  
  console.log('5️⃣ Pós-processamento...');
  const final = postProcess(quantized, targetWidth, targetHeight);
  
  return final;
}

// ================= COMPONENTE APP =================

export default function App() {
  const [gridSize, setGridSize] = useState({ width: 150, height: 100 });
  const [customWidth, setCustomWidth] = useState(150);
  const [customHeight, setCustomHeight] = useState(100);
  const [monogramText, setMonogramText] = useState('');
  const [monogramStyle, setMonogramStyle] = useState('classic');
  const [showMonogram, setShowMonogram] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState({ colors: {}, pixelMap: [] });
  const [contourEnabled, setContourEnabled] = useState(true);
  const currentImageRef = useRef(null);

  const processImage = useCallback((img, width, height) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;
    
    // Obter dados da imagem original
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    const originalData = tempCtx.getImageData(0, 0, img.width, img.height).data;
    
    // Redimensionamento com qualidade profissional
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, width, height);
    
    let processedImageData = ctx.getImageData(0, 0, width, height);
    
    // Aplicar nitidez profissional
    processedImageData = applySharpen(processedImageData, width, height);
    
    // Aumentar saturação e contraste
    processedImageData = enhanceColors(processedImageData, width, height);
    
    // Aplicar de volta ao canvas
    ctx.putImageData(processedImageData, 0, 0);
    
    processedImageData = ctx.getImageData(0, 0, width, height);
    
    // Detectar contorno profissional automaticamente
    const contourMap = detectProfessionalContour(processedImageData, width, height);

    const pixelMap = Array(height)
      .fill(null)
      .map(() => Array(width).fill(false));

    const colors = {};

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = processedImageData.data[i];
        const g = processedImageData.data[i + 1];
        const b = processedImageData.data[i + 2];
        const a = processedImageData.data[i + 3];

        // Capturar todos os pixels
        pixelMap[y][x] = true;
        colors[`${x},${y}`] = `rgb(${r},${g},${b})`;
      }
    }

    setPixels({ 
      pixelMap, 
      colors, 
      contourMap: contourMap,
      edgeAlgorithm: 'professional' 
    });
    setGridSize({ width, height });
    
    console.log('✅ Conversão completa!', Object.keys(colors).length, 'pixels');
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      currentImageRef.current = img;
      processImage(img, customWidth, customHeight);
    };

    img.src = URL.createObjectURL(file);
  };

  const handleWidthChange = (newWidth) => {
    setCustomWidth(newWidth);
    if (currentImageRef.current) {
      processImage(currentImageRef.current, newWidth, customHeight);
    }
  };

  const handleHeightChange = (newHeight) => {
    setCustomHeight(newHeight);
    if (currentImageRef.current) {
      processImage(currentImageRef.current, customWidth, newHeight);
    }
  };

  const detectProfessionalContour = (imageData, width, height) => {
    const contour = {};
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIdx = (y * width + x) * 4;
        const centerR = data[centerIdx];
        const centerG = data[centerIdx + 1];
        const centerB = data[centerIdx + 2];
        
        // Pular pixels muito claros (fundos brancos)
        const centerBrightness = (centerR + centerG + centerB) / 3;
        if (centerBrightness > 240) continue;
        
        let hasColorChange = false;
        
        // Verificar vizinhos diretos (4 direções)
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighborIdx = (ny * width + nx) * 4;
            const neighborR = data[neighborIdx];
            const neighborG = data[neighborIdx + 1];
            const neighborB = data[neighborIdx + 2];
            
            const neighborBrightness = (neighborR + neighborG + neighborB) / 3;
            
            // Só marcar contorno se vizinho for muito diferente
            if (Math.abs(centerBrightness - neighborBrightness) > 50) {
              const colorDiff = Math.abs(centerR - neighborR) + 
                               Math.abs(centerG - neighborG) + 
                               Math.abs(centerB - neighborB);
              
              // Se diferença > 60, é mudança significativa
              if (colorDiff > 60) {
                hasColorChange = true;
                break;
              }
            }
          }
        }
        
        if (hasColorChange) {
          contour[`${x},${y}`] = true;
        }
      }
    }
    
    return contour;
  };

  // Aplicar nitidez profissional
  const applySharpen = (imageData, width, height) => {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Kernel de nitidez profissional
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
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
        
        const alphaIdx = (y * width + x) * 4 + 3;
        output[alphaIdx] = 255;
      }
    }
    
    // Copiar bordas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          const idx = (y * width + x) * 4;
          output[idx] = data[idx];
          output[idx + 1] = data[idx + 1];
          output[idx + 2] = data[idx + 2];
          output[idx + 3] = 255;
        }
      }
    }
    
    return new ImageData(output, width, height);
  };

  // Aumentar saturação e contraste
  const enhanceColors = (imageData, width, height) => {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Aumentar contraste
      const contrast = 1.3;
      const factor = (259 * (contrast + 1)) / (259 - contrast);
      
      let newR = factor * (r - 128) + 128;
      let newG = factor * (g - 128) + 128;
      let newB = factor * (b - 128) + 128;
      
      // Aumentar saturação
      const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB;
      const saturation = 1.4;
      
      newR = gray + saturation * (newR - gray);
      newG = gray + saturation * (newG - gray);
      newB = gray + saturation * (newB - gray);
      
      output[i] = Math.max(0, Math.min(255, newR));
      output[i + 1] = Math.max(0, Math.min(255, newG));
      output[i + 2] = Math.max(0, Math.min(255, newB));
      output[i + 3] = 255;
    }
    
    return new ImageData(output, width, height);
  };

  return (
    <div style={{ padding: 20, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 30, 
        padding: 20, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 12, 
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5em', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🧵 Zaíra.Cruz
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1em', opacity: 0.9 }}>
          Transforme suas imagens em padrões profissionais de ponto cruz
        </p>
      </div>

      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        background: '#f8f9fa', 
        borderRadius: 8, 
        border: '1px solid #dee2e6' 
      }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold', 
            color: '#495057' 
          }}>
            📁 Selecionar Imagem:
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            style={{
              padding: '8px 12px',
              border: '2px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            🔍 <strong>Zoom:</strong>
            <input
              type="range"
              min="0.3"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span style={{ 
              minWidth: '45px', 
              padding: '4px 8px', 
              background: 'white', 
              border: '1px solid #ced4da', 
              borderRadius: '3px',
              fontSize: '12px'
            }}>
              {zoom}x
            </span>
          </label>
          
          {gridSize.width > 0 && (
            <>
              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  const link = document.createElement('a');
                  link.download = 'cross-stitch-pattern.png';
                  link.href = canvas.toDataURL();
                  link.click();
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💾 Exportar PNG
              </button>
              
              <div style={{ 
                padding: '6px 12px', 
                background: 'white', 
                border: '1px solid #28a745', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#28a745',
                fontWeight: 'bold'
              }}>
                📐 {gridSize.width} × {gridSize.height} pontos
              </div>
            </>
          )}
        </div>
      </div>
      
      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        background: '#fff3cd', 
        borderRadius: 8, 
        border: '1px solid #ffeaa7' 
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>⚙️ Configurações do Padrão</h4>
        
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong>📏 Largura:</strong>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              min="50"
              max="400"
              style={{ 
                width: '80px', 
                padding: '6px 8px', 
                border: '2px solid #ffc107', 
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            />
            <span style={{ fontSize: '12px', color: '#856404' }}>pontos</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong>📐 Altura:</strong>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              min="50"
              max="300"
              style={{ 
                width: '80px', 
                padding: '6px 8px', 
                border: '2px solid #ffc107', 
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            />
            <span style={{ fontSize: '12px', color: '#856404' }}>pontos</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={contourEnabled}
              onChange={(e) => setContourEnabled(e.target.checked)}
            />
            <strong>🖤 Contorno Preto</strong>
          </label>
          
          <div style={{ 
            padding: '8px 12px', 
            background: customWidth < 100 || customHeight < 80 ? '#f8d7da' : '#d4edda', 
            border: `1px solid ${customWidth < 100 || customHeight < 80 ? '#f5c6cb' : '#c3e6cb'}`, 
            borderRadius: '4px',
            fontSize: '12px',
            color: customWidth < 100 || customHeight < 80 ? '#721c24' : '#155724'
          }}>
            {customWidth < 100 || customHeight < 80 ? (
              <>⚠️ Tamanho pequeno pode perder detalhes. Recomendado: 100x80+</>
            ) : (
              <>💡 Usando paleta limitada (20 cores) - SEM dithering!</>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: 20, padding: 15, border: '1px solid #ddd', borderRadius: 5 }}>
        <h3 style={{ marginBottom: 10 }}>Monogramas Profissionais</h3>
        
        <label style={{ marginRight: 15 }}>
          Texto:
          <input
            type="text"
            value={monogramText}
            onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
            placeholder="Digite as letras"
            maxLength="10"
            style={{ marginLeft: 5, padding: '5px', width: '120px' }}
          />
        </label>
        
        <label style={{ marginRight: 15 }}>
          Estilo:
          <select
            value={monogramStyle}
            onChange={(e) => setMonogramStyle(e.target.value)}
            style={{ marginLeft: 5, padding: '5px' }}
          >
            {Object.entries(MONOGRAM_STYLES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </label>
        
        <button
          onClick={() => {
            if (monogramText.trim()) {
              const monogram = generateMonogram(monogramText, monogramStyle);
              setPixels({ 
                colors: monogram.pixels, 
                pixelMap: [], 
                contourMap: {}, 
                edgeAlgorithm: 'monogram' 
              });
              setGridSize({ width: monogram.width, height: monogram.height });
              setShowMonogram(true);
            }
          }}
          style={{ 
            marginLeft: 10, 
            padding: '8px 15px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Gerar Monograma
        </button>
        
        {showMonogram && (
          <button
            onClick={() => {
              setPixels({ colors: {}, pixelMap: [], contourMap: {}, edgeAlgorithm: 'none' });
              setShowMonogram(false);
            }}
            style={{ 
              marginLeft: 10, 
              padding: '8px 15px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpar
          </button>
        )}
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