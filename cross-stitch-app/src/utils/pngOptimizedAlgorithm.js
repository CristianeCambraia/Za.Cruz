// ================= ALGORITMO OTIMIZADO PARA PNG =================
// Especialmente desenvolvido para preservar cores exatas em PNG

export function pngOptimizedConversion(imageData, originalWidth, originalHeight, targetWidth, targetHeight) {
  // 1️⃣ Pré-processamento para PNG
  const preprocessed = preprocessForPNG(imageData, originalWidth, originalHeight);
  
  // 2️⃣ Redimensionamento inteligente
  const resized = intelligentResize(preprocessed, originalWidth, originalHeight, targetWidth, targetHeight);
  
  // 3️⃣ Quantização de cores otimizada para ponto cruz
  const quantized = crossStitchQuantization(resized, targetWidth, targetHeight);
  
  // 4️⃣ Pós-processamento para nitidez
  const final = sharpenForPNG(quantized, targetWidth, targetHeight);
  
  return final;
}

// ================= PRÉ-PROCESSAMENTO PNG =================
function preprocessForPNG(data, width, height) {
  const output = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Preservar cores muito claras (fundos)
    const brightness = (r + g + b) / 3;
    
    if (brightness > 230) {
      // Manter cores claras como estão
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
    } else {
      // Aumentar saturação apenas para cores não-claras
      const hsl = rgbToHsl(r, g, b);
      hsl[1] = Math.min(1, hsl[1] * 1.2); // +20% saturação
      
      const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      
      output[i] = rgb[0];
      output[i + 1] = rgb[1];
      output[i + 2] = rgb[2];
    }
    output[i + 3] = 255;
  }
  
  return output;
}

// ================= REDIMENSIONAMENTO INTELIGENTE =================
function intelligentResize(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const targetIndex = (y * targetWidth + x) * 4;
      
      // Amostragem de área com peso por contraste
      const startX = Math.floor(x * scaleX);
      const endX = Math.min(Math.ceil((x + 1) * scaleX), sourceWidth);
      const startY = Math.floor(y * scaleY);
      const endY = Math.min(Math.ceil((y + 1) * scaleY), sourceHeight);
      
      let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
      
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const sourceIndex = (sy * sourceWidth + sx) * 4;
          const r = sourceData[sourceIndex];
          const g = sourceData[sourceIndex + 1];
          const b = sourceData[sourceIndex + 2];
          
          // Peso baseado no contraste local
          const contrast = calculatePixelContrast(sourceData, sx, sy, sourceWidth, sourceHeight);
          const weight = 1 + contrast * 2; // Pixels com mais contraste têm mais peso
          
          totalR += r * weight;
          totalG += g * weight;
          totalB += b * weight;
          totalWeight += weight;
        }
      }
      
      if (totalWeight > 0) {
        targetData[targetIndex] = Math.round(totalR / totalWeight);
        targetData[targetIndex + 1] = Math.round(totalG / totalWeight);
        targetData[targetIndex + 2] = Math.round(totalB / totalWeight);
        targetData[targetIndex + 3] = 255;
      }
    }
  }
  
  return targetData;
}

// ================= QUANTIZAÇÃO PARA PONTO CRUZ =================
function crossStitchQuantization(data, width, height) {
  const output = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Preservar cores claras como branco
    const brightness = (r + g + b) / 3;
    if (brightness > 240) {
      output[i] = 255;
      output[i + 1] = 255;
      output[i + 2] = 255;
    } else {
      // Quantizar apenas cores não-brancas
      const quantized = quantizeColor(r, g, b);
      output[i] = quantized[0];
      output[i + 1] = quantized[1];
      output[i + 2] = quantized[2];
    }
    output[i + 3] = 255;
  }
  
  return output;
}

// ================= QUANTIZAÇÃO SIMPLES =================
function quantizeColor(r, g, b) {
  // Quantização suave - reduzir para 32 níveis por canal
  const levels = 32;
  const step = 255 / (levels - 1);
  
  const qR = Math.round(r / step) * step;
  const qG = Math.round(g / step) * step;
  const qB = Math.round(b / step) * step;
  
  return [Math.min(255, qR), Math.min(255, qG), Math.min(255, qB)];
}



// ================= NITIDEZ PARA PNG =================
function sharpenForPNG(data, width, height) {
  const output = new Uint8ClampedArray(data.length);
  
  // Kernel de nitidez otimizado para PNG
  const kernel = [
    [-1, -1, -1],
    [-1,  9, -1],
    [-1, -1, -1]
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
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);
    
    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
      output[i] = data[i];
      output[i + 1] = data[i + 1];
      output[i + 2] = data[i + 2];
      output[i + 3] = 255;
    }
  }
  
  return output;
}

// ================= UTILITÁRIOS =================
function calculatePixelContrast(data, x, y, width, height) {
  const centerIdx = (y * width + x) * 4;
  const centerR = data[centerIdx];
  const centerG = data[centerIdx + 1];
  const centerB = data[centerIdx + 2];
  
  let totalDiff = 0;
  let count = 0;
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !(dx === 0 && dy === 0)) {
        const idx = (ny * width + nx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        const diff = Math.abs(centerR - r) + Math.abs(centerG - g) + Math.abs(centerB - b);
        totalDiff += diff;
        count++;
      }
    }
  }
  
  return count > 0 ? totalDiff / (count * 255 * 3) : 0;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}