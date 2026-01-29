/**
 * ALGORITMO MODERNO WEB PARA PONTO CRUZ
 * Inspirado em geradores online profissionais
 */

export function modernWebConversion(imageData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  console.log('🌐 Usando algoritmo moderno web...');
  
  // ETAPA 1: Pré-processamento da imagem
  const preprocessed = preprocessImage(imageData, sourceWidth, sourceHeight);
  
  // ETAPA 2: Redimensionamento inteligente
  const resized = intelligentResize(preprocessed, sourceWidth, sourceHeight, targetWidth, targetHeight);
  
  // ETAPA 3: Quantização de cores otimizada
  const quantized = optimizedQuantization(resized, targetWidth, targetHeight);
  
  // ETAPA 4: Pós-processamento para nitidez
  const final = postProcessForSharpness(quantized, targetWidth, targetHeight);
  
  console.log('✅ Conversão moderna concluída');
  return final;
}

// Pré-processamento: realce de contraste e saturação
function preprocessImage(imageData, width, height) {
  const processed = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Converter para HSL para melhor controle
    const hsl = rgbToHsl(r, g, b);
    
    // Aumentar saturação e contraste
    hsl.s = Math.min(1, hsl.s * 1.25);
    hsl.l = hsl.l < 0.5 ? hsl.l * 0.9 : hsl.l * 1.1;
    
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    
    processed[i] = rgb.r;
    processed[i + 1] = rgb.g;
    processed[i + 2] = rgb.b;
    processed[i + 3] = a;
  }
  
  return processed;
}

// Redimensionamento com preservação máxima de detalhes
function intelligentResize(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // Calcular área de amostragem para preservar detalhes
      const startX = Math.floor(x * scaleX);
      const endX = Math.min(Math.ceil((x + 1) * scaleX), sourceWidth);
      const startY = Math.floor(y * scaleY);
      const endY = Math.min(Math.ceil((y + 1) * scaleY), sourceHeight);
      
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      let maxContrast = 0;
      let detailPixel = { r: 0, g: 0, b: 0, a: 255 };
      
      // Analisar toda a área para encontrar detalhes importantes
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const idx = (sy * sourceWidth + sx) * 4;
          const pr = sourceData[idx];
          const pg = sourceData[idx + 1];
          const pb = sourceData[idx + 2];
          const pa = sourceData[idx + 3];
          
          r += pr;
          g += pg;
          b += pb;
          a += pa;
          count++;
          
          // Calcular contraste local para detectar detalhes
          const contrast = calculateLocalContrast(sourceData, sourceWidth, sourceHeight, sx, sy);
          if (contrast > maxContrast) {
            maxContrast = contrast;
            detailPixel = { r: pr, g: pg, b: pb, a: pa };
          }
        }
      }
      
      const idx = (y * targetWidth + x) * 4;
      
      // Se há detalhes importantes, preservá-los
      if (maxContrast > 50) {
        result[idx] = detailPixel.r;
        result[idx + 1] = detailPixel.g;
        result[idx + 2] = detailPixel.b;
        result[idx + 3] = detailPixel.a;
      } else {
        // Usar média
        result[idx] = Math.round(r / count);
        result[idx + 1] = Math.round(g / count);
        result[idx + 2] = Math.round(b / count);
        result[idx + 3] = Math.round(a / count);
      }
    }
  }
  
  return result;
}

// Calcular contraste local para detectar detalhes
function calculateLocalContrast(data, width, height, x, y) {
  const idx = (y * width + x) * 4;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  
  let maxDiff = 0;
  
  // Verificar vizinhos
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const nx = Math.max(0, Math.min(width - 1, x + dx));
      const ny = Math.max(0, Math.min(height - 1, y + dy));
      const nIdx = (ny * width + nx) * 4;
      
      const diff = Math.abs(r - data[nIdx]) + Math.abs(g - data[nIdx + 1]) + Math.abs(b - data[nIdx + 2]);
      maxDiff = Math.max(maxDiff, diff);
    }
  }
  
  return maxDiff;
}

// Interpolação bicúbica para alta qualidade
function bicubicInterpolation(data, width, height, x, y) {
  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  
  let r = 0, g = 0, b = 0, a = 0;
  let totalWeight = 0;
  
  // Amostragem 4x4
  for (let dy = -1; dy <= 2; dy++) {
    for (let dx = -1; dx <= 2; dx++) {
      const sx = Math.max(0, Math.min(width - 1, x1 + dx));
      const sy = Math.max(0, Math.min(height - 1, y1 + dy));
      
      const idx = (sy * width + sx) * 4;
      
      const wx = cubicWeight(x - (x1 + dx));
      const wy = cubicWeight(y - (y1 + dy));
      const weight = wx * wy;
      
      r += data[idx] * weight;
      g += data[idx + 1] * weight;
      b += data[idx + 2] * weight;
      a += data[idx + 3] * weight;
      totalWeight += weight;
    }
  }
  
  return {
    r: Math.round(r / totalWeight),
    g: Math.round(g / totalWeight),
    b: Math.round(b / totalWeight),
    a: Math.round(a / totalWeight)
  };
}

function cubicWeight(t) {
  const absT = Math.abs(t);
  if (absT <= 1) {
    return 1 - 2 * absT * absT + absT * absT * absT;
  } else if (absT <= 2) {
    return 4 - 8 * absT + 5 * absT * absT - absT * absT * absT;
  }
  return 0;
}

// Quantização otimizada para web
function optimizedQuantization(imageData, width, height) {
  const quantized = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Quantização suave (16 níveis por canal)
    quantized[i] = Math.round(r / 16) * 16;
    quantized[i + 1] = Math.round(g / 16) * 16;
    quantized[i + 2] = Math.round(b / 16) * 16;
    quantized[i + 3] = a;
  }
  
  return quantized;
}

// Pós-processamento para nitidez
function postProcessForSharpness(imageData, width, height) {
  const sharpened = new Uint8ClampedArray(imageData.length);
  sharpened.set(imageData);
  
  // Kernel de nitidez moderado
  const kernel = [
    [0, -0.25, 0],
    [-0.25, 2, -0.25],
    [0, -0.25, 0]
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += imageData[pixelIdx] * kernel[ky + 1][kx + 1];
          }
        }
        
        sharpened[idx + c] = Math.max(0, Math.min(255, Math.round(sum)));
      }
    }
  }
  
  return sharpened;
}

// Conversões de cor
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const l = (max + min) / 2;
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
  
  return { h: h / 360, s, l };
}

function hslToRgb(h, s, l) {
  h *= 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}