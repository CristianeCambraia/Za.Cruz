import React, { useState, useRef } from 'react';

// ================= PALETA LIMITADA PARA CROSS-STITCH =================
function getCrossStitchPalette() {
  return [
    // Preto para contornos
    { r: 0, g: 0, b: 0, name: 'Black-310' },
    
    // Tons de pele (3 tons)
    { r: 255, g: 220, b: 177, name: 'Skin-Light' },
    { r: 241, g: 194, b: 125, name: 'Skin-Medium' },
    { r: 210, g: 150, b: 90, name: 'Skin-Dark' },
    
    // Brancos e cinzas (para destaques)
    { r: 255, g: 255, b: 255, name: 'White' },
    { r: 230, g: 230, b: 230, name: 'Gray-Light' },
    { r: 150, g: 150, b: 150, name: 'Gray-Medium' },
    
    // Azuis (vestido) - 3 tons
    { r: 135, g: 206, b: 250, name: 'Blue-Light' },
    { r: 70, g: 130, b: 180, name: 'Blue-Medium' },
    { r: 30, g: 70, b: 120, name: 'Blue-Dark' },
    
    // Amarelos/Dourados (coroa/detalhes) - 3 tons
    { r: 255, g: 223, b: 0, name: 'Gold-Bright' },
    { r: 218, g: 165, b: 32, name: 'Gold-Medium' },
    { r: 184, g: 134, b: 11, name: 'Gold-Dark' },
    
    // Verdes (olhos/detalhes)
    { r: 144, g: 238, b: 144, name: 'Green-Light' },
    { r: 60, g: 179, b: 113, name: 'Green-Medium' },
    
    // Rosas/Vermelhos (boca/detalhes)
    { r: 255, g: 182, b: 193, name: 'Pink-Light' },
    { r: 255, g: 105, b: 180, name: 'Pink-Medium' },
    { r: 220, g: 20, b: 60, name: 'Red-Dark' },
    
    // Marrons (cabelo) - 3 tons
    { r: 139, g: 90, b: 43, name: 'Brown-Light' },
    { r: 101, g: 67, b: 33, name: 'Brown-Medium' },
    { r: 70, g: 40, b: 20, name: 'Brown-Dark' }
  ];
}

// ================= REDIMENSIONAMENTO INTELIGENTE =================
function smartResize(imageData, width, height, targetSize) {
  const aspectRatio = width / height;
  let newWidth, newHeight;
  
  if (width > height) {
    newWidth = targetSize;
    newHeight = Math.round(targetSize / aspectRatio);
  } else {
    newHeight = targetSize;
    newWidth = Math.round(targetSize * aspectRatio);
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // Criar ImageData temporária
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  const tempImageData = tempCtx.createImageData(width, height);
  tempImageData.data.set(imageData);
  tempCtx.putImageData(tempImageData, 0, 0);
  
  // Desabilitar suavização para manter pixels nítidos
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, newWidth, newHeight);
  
  const resizedData = ctx.getImageData(0, 0, newWidth, newHeight);
  
  return {
    data: resizedData.data,
    width: newWidth,
    height: newHeight
  };
}

// ================= REMOVER FUNDO =================
function removeBackground(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Considerar transparente se alpha < 20 OU se é branco puro
    const isTransparent = a < 20 || (r > 250 && g > 250 && b > 250);
    
    if (isTransparent) {
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
      output[i + 3] = 0; // Marcar como transparente
    } else {
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
      output[i + 3] = a;
    }
  }
  
  return output;
}

// ================= DETECTAR E REFORÇAR CONTORNOS =================
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
      
      // Pular pixels transparentes
      if (!center || center.a < 20) continue;
      
      // Verificar diferença com vizinhos
      const neighbors = [
        getPixel(x - 1, y),
        getPixel(x + 1, y),
        getPixel(x, y - 1),
        getPixel(x, y + 1)
      ];
      
      let maxDiff = 0;
      for (const n of neighbors) {
        if (!n || n.a < 20) {
          maxDiff = 255; // Borda com transparência
          break;
        }
        
        const diff = Math.abs(center.r - n.r) + 
                     Math.abs(center.g - n.g) + 
                     Math.abs(center.b - n.b);
        maxDiff = Math.max(maxDiff, diff);
      }
      
      // Se diferença grande, é contorno - pintar de preto
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

// ================= ENCONTRAR COR MAIS PRÓXIMA =================
function findClosestPaletteColor(r, g, b, palette) {
  let minDist = Infinity;
  let closest = palette[0];
  
  for (const color of palette) {
    // Distância euclidiana ponderada (olho humano é mais sensível ao verde)
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

// ================= QUANTIZAR PARA PALETA LIMITADA (SEM DITHERING) =================
function quantizeToLimitedPalette(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  const palette = getCrossStitchPalette();
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Manter transparência
    if (a < 20) {
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
      output[i + 3] = 0;
      continue;
    }
    
    // Manter preto de contorno
    if (r < 30 && g < 30 && b < 30) {
      output[i] = 0;
      output[i + 1] = 0;
      output[i + 2] = 0;
      output[i + 3] = 255;
      continue;
    }
    
    // Encontrar cor mais próxima na paleta
    const closest = findClosestPaletteColor(r, g, b, palette);
    
    output[i] = closest.r;
    output[i + 1] = closest.g;
    output[i + 2] = closest.b;
    output[i + 3] = 255;
  }
  
  return output;
}

// ================= PÓS-PROCESSAMENTO =================
function postProcess(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  output.set(imageData);
  
  // Realçar destaques (olhos, brilhos)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      const a = imageData[idx + 3];
      
      if (a < 20) continue;
      
      const brightness = (r + g + b) / 3;
      
      // Se é muito claro E tem vizinhos escuros, realçar como branco puro
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
        
        // Destaque nos olhos
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

// ================= CONVERSÃO PROFISSIONAL COMPLETA =================
function professionalCrossStitchConversion(imageData, width, height, targetSize) {
  console.log('1️⃣ Redimensionando...');
  const resized = smartResize(imageData, width, height, targetSize);
  
  console.log('2️⃣ Removendo fundo...');
  const cleaned = removeBackground(resized.data, resized.width, resized.height);
  
  console.log('3️⃣ Detectando contornos...');
  const withContours = detectAndEnhanceContours(cleaned, resized.width, resized.height);
  
  console.log('4️⃣ Aplicando paleta limitada...');
  const quantized = quantizeToLimitedPalette(withContours, resized.width, resized.height);
  
  console.log('5️⃣ Pós-processamento...');
  const final = postProcess(quantized, resized.width, resized.height);
  
  return {
    data: final,
    width: resized.width,
    height: resized.height
  };
}

// ================= CONVERTER PARA GRID =================
function convertToGrid(imageData, width, height) {
  const grid = {};
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      const a = imageData[idx + 3];
      
      // Pular pixels transparentes
      if (a < 20) continue;
      
      const hex = '#' + [r, g, b].map(x => {
        const h = x.toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      
      grid[`${x},${y}`] = hex;
    }
  }
  
  return grid;
}

// ================= COMPONENTE REACT =================
export default function ImageConverterProfissional({ onGridGenerated }) {
  const [targetSize, setTargetSize] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = async (file) => {
    setIsProcessing(true);
    
    try {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        console.log('🎨 Processando imagem:', img.width, 'x', img.height);
        console.log('📏 Tamanho alvo:', targetSize);
        
        // Aplicar algoritmo profissional
        const result = professionalCrossStitchConversion(
          imageData.data,
          img.width,
          img.height,
          targetSize
        );
        
        console.log('✅ Conversão completa:', result.width, 'x', result.height);
        
        // Converter para formato de grid
        const grid = convertToGrid(result.data, result.width, result.height);
        
        console.log('📊 Grid gerado com', Object.keys(grid).length, 'pixels');
        
        // Passar para o componente pai
        onGridGenerated({
          colors: grid,
          width: result.width,
          height: result.height
        });
        
        setIsProcessing(false);
      };
      
      img.onerror = () => {
        console.error('❌ Erro ao carregar imagem');
        alert('Erro ao carregar a imagem. Tente outro arquivo.');
        setIsProcessing(false);
      };
      
      img.src = URL.createObjectURL(file);
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      alert('Erro ao processar a imagem: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      alert('Por favor, selecione uma imagem válida (PNG, JPG, etc)');
    }
  };

  return (
    <div className="image-converter" style={styles.container}>
      <h3 style={styles.title}>🎨 Conversor Profissional de Ponto Cruz</h3>
      
      <div style={styles.control}>
        <label style={styles.label}>
          📏 Tamanho da grade: {targetSize}x{targetSize} pontos
        </label>
        <input
          type="range"
          min="40"
          max="120"
          step="10"
          value={targetSize}
          onChange={(e) => setTargetSize(Number(e.target.value))}
          style={styles.slider}
          disabled={isProcessing}
        />
        <div style={styles.sizeInfo}>
          {targetSize < 60 && '⚠️ Pequeno - menos detalhes'}
          {targetSize >= 60 && targetSize <= 90 && '✅ Recomendado - boa qualidade'}
          {targetSize > 90 && '⚠️ Grande - pode ficar muito detalhado'}
        </div>
      </div>
      
      <div style={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
          style={styles.fileInput}
          id="file-upload-pro"
        />
        <label htmlFor="file-upload-pro" style={{
          ...styles.uploadButton,
          opacity: isProcessing ? 0.5 : 1,
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}>
          {isProcessing ? '⏳ Processando...' : '📁 Selecionar Imagem'}
        </label>
      </div>
      
      {isProcessing && (
        <div style={styles.processing}>
          <div style={styles.spinner}></div>
          <p>Convertendo para gráfico profissional...</p>
          <p style={styles.tip}>💡 Removendo fundo, detectando contornos e aplicando paleta DMC</p>
        </div>
      )}
      
      <div style={styles.tips}>
        <h4>💡 Dicas:</h4>
        <ul style={styles.tipsList}>
          <li>✅ Use imagens PNG com fundo transparente para melhor resultado</li>
          <li>✅ Imagens simples funcionam melhor que fotos realistas</li>
          <li>✅ O algoritmo detecta automaticamente contornos e adiciona preto</li>
          <li>✅ Tamanho recomendado: 60-80 pontos para personagens</li>
          <li>✅ Paleta limitada (20 cores) - SEM dithering!</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  title: {
    marginBottom: '20px',
    color: '#333'
  },
  control: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555'
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    outline: 'none'
  },
  sizeInfo: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic'
  },
  uploadSection: {
    marginBottom: '20px'
  },
  fileInput: {
    display: 'none'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontWeight: 'bold',
    textAlign: 'center',
    transition: 'background-color 0.3s'
  },
  processing: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 10px'
  },
  tip: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px'
  },
  tips: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  tipsList: {
    marginTop: '10px',
    paddingLeft: '20px',
    lineHeight: '1.8'
  }
};

// Adicionar animação CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById('spinner-animation')) {
    style.id = 'spinner-animation';
    document.head.appendChild(style);
  }
}