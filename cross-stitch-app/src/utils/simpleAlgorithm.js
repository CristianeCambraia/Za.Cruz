// ================= ALGORITMO SIMPLES SEM FUNDO PRETO =================

export function simpleConversion(imageData, originalWidth, originalHeight, targetWidth, targetHeight) {
  // 1️⃣ Redimensionar sem processamento agressivo
  const resized = simpleResize(imageData, originalWidth, originalHeight, targetWidth, targetHeight);
  
  // 2️⃣ Apenas leve quantização
  const final = lightQuantization(resized, targetWidth, targetHeight);
  
  return final;
}

// ================= REDIMENSIONAMENTO SIMPLES =================
function simpleResize(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const targetIndex = (y * targetWidth + x) * 4;
      
      // Interpolação bilinear simples
      const sourceX = x * scaleX;
      const sourceY = y * scaleY;
      
      const x1 = Math.floor(sourceX);
      const y1 = Math.floor(sourceY);
      const x2 = Math.min(x1 + 1, sourceWidth - 1);
      const y2 = Math.min(y1 + 1, sourceHeight - 1);
      
      const fx = sourceX - x1;
      const fy = sourceY - y1;
      
      for (let c = 0; c < 4; c++) {
        const p1 = sourceData[(y1 * sourceWidth + x1) * 4 + c];
        const p2 = sourceData[(y1 * sourceWidth + x2) * 4 + c];
        const p3 = sourceData[(y2 * sourceWidth + x1) * 4 + c];
        const p4 = sourceData[(y2 * sourceWidth + x2) * 4 + c];
        
        const i1 = p1 * (1 - fx) + p2 * fx;
        const i2 = p3 * (1 - fx) + p4 * fx;
        const final = i1 * (1 - fy) + i2 * fy;
        
        targetData[targetIndex + c] = Math.round(final);
      }
    }
  }
  
  return targetData;
}

// ================= QUANTIZAÇÃO LEVE =================
function lightQuantization(data, width, height) {
  const output = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Preservar cores claras completamente
    const brightness = (r + g + b) / 3;
    
    if (brightness > 200) {
      // Manter cores claras
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
    } else {
      // Quantização muito suave para outras cores
      const step = 16; // 16 níveis por canal
      output[i] = Math.round(r / step) * step;
      output[i + 1] = Math.round(g / step) * step;
      output[i + 2] = Math.round(b / step) * step;
    }
    
    output[i + 3] = 255;
  }
  
  return output;
}