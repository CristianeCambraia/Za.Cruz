/**
 * SISTEMA PROFISSIONAL DE EDGE DETECTION
 * Implementa algoritmos Canny e Sobel para contorno real
 * Pipeline semelhante a PCStitch / Pattern Maker
 */

// Algoritmo Sobel para detecção de bordas
export function sobelEdgeDetection(imageData, width, height) {
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  const edges = new Uint8ClampedArray(width * height);
  
  // Converter para grayscale primeiro
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const idx = i / 4;
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    gray[idx] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Aplicar filtros Sobel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = gray[(y + ky) * width + (x + kx)];
          gx += pixel * sobelX[ky + 1][kx + 1];
          gy += pixel * sobelY[ky + 1][kx + 1];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = magnitude > 50 ? 255 : 0;
    }
  }
  
  return edges;
}

// Algoritmo Canny (versão simplificada)
export function cannyEdgeDetection(imageData, width, height, lowThreshold = 50, highThreshold = 150) {
  // 1. Gaussian blur
  const blurred = gaussianBlur(imageData, width, height);
  
  // 2. Sobel gradients
  const edges = sobelEdgeDetection(blurred, width, height);
  
  // 3. Non-maximum suppression e hysteresis (simplificado)
  const result = new Uint8ClampedArray(width * height);
  
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > highThreshold) {
      result[i] = 255;
    } else if (edges[i] > lowThreshold) {
      result[i] = 128; // Weak edge
    } else {
      result[i] = 0;
    }
  }
  
  return result;
}

// Gaussian blur para suavização
function gaussianBlur(imageData, width, height) {
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
  ];
  const kernelSum = 16;
  
  const result = { data: new Uint8ClampedArray(imageData.data.length) };
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[ky + 1][kx + 1];
          
          r += imageData.data[idx] * weight;
          g += imageData.data[idx + 1] * weight;
          b += imageData.data[idx + 2] * weight;
          a += imageData.data[idx + 3] * weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      result.data[idx] = r / kernelSum;
      result.data[idx + 1] = g / kernelSum;
      result.data[idx + 2] = b / kernelSum;
      result.data[idx + 3] = a / kernelSum;
    }
  }
  
  return result;
}

// Converter edges para backstitch contínuo
export function edgesToBackstitch(edges, width, height) {
  const backstitch = {};
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (edges[idx] > 0) {
        backstitch[`${x},${y}`] = true;
      }
    }
  }
  
  return backstitch;
}

// Detecção de contorno profissional - apenas bordas externas
function detectOutlineOnly(imageData, width, height) {
  const edges = new Uint8ClampedArray(width * height);
  
  // Detectar apenas pixels que fazem fronteira com fundo transparente/branco
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = imageData.data[idx + 3];
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      
      // Detectar bordas por diferença de cor significativa
      const neighbors = [
        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
      ];
      
      let isBorder = false;
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          isBorder = true;
          break;
        }
        
        const nIdx = (ny * width + nx) * 4;
        const nR = imageData.data[nIdx];
        const nG = imageData.data[nIdx + 1];
        const nB = imageData.data[nIdx + 2];
        
        // Calcular diferença de cor
        const colorDiff = Math.abs(r - nR) + Math.abs(g - nG) + Math.abs(b - nB);
        
        // Contorno ultra-fino - apenas diferenças extremas
        if (colorDiff > 300) {
          isBorder = true;
          break;
        }
      }
      
      if (isBorder) {
        edges[y * width + x] = 255;
      }
    }
  }
  
  return edges;
}

// Pipeline completo profissional
export function processImageProfessional(imageData, width, height, algorithm = 'outline') {
  console.log('🔬 Iniciando contorno profissional...');
  
  let edges;
  
  if (algorithm === 'outline') {
    edges = detectOutlineOnly(imageData, width, height);
    console.log('✅ Contorno externo detectado');
  } else if (algorithm === 'canny') {
    edges = cannyEdgeDetection(imageData, width, height);
    console.log('✅ Canny edge detection aplicado');
  } else {
    edges = sobelEdgeDetection(imageData, width, height);
    console.log('✅ Sobel edge detection aplicado');
  }
  
  // Converter para backstitch
  const backstitch = edgesToBackstitch(edges, width, height);
  console.log(`✅ ${Object.keys(backstitch).length} pontos de contorno gerados`);
  
  return {
    edges,
    backstitch,
    algorithm
  };
}