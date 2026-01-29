// ================= ALGORITMO PROFISSIONAL COMPLETO =================

export function professionalConversion(imageData, originalWidth, originalHeight, targetWidth, targetHeight) {
  // 1️⃣ Redimensionamento inteligente
  const resized = intelligentResize(imageData, originalWidth, originalHeight, targetWidth, targetHeight);
  
  // 2️⃣ Dithering Floyd-Steinberg com paleta profissional
  const dithered = floydSteinbergDithering(resized, targetWidth, targetHeight);
  
  // 3️⃣ Pós-processamento para realce
  const enhanced = enhanceDetails(dithered, targetWidth, targetHeight);
  
  return enhanced;
}

// ================= PALETA PROFISSIONAL PARA PONTO CRUZ =================
function getCrossStitchPalette() {
  return [
    // Brancos e cinzas claros
    [255, 255, 255], [240, 240, 240], [220, 220, 220], [200, 200, 200],
    
    // Cinzas médios e escuros
    [180, 180, 180], [160, 160, 160], [120, 120, 120], [80, 80, 80], [40, 40, 40], [0, 0, 0],
    
    // Tons de pele
    [255, 220, 177], [255, 205, 148], [241, 194, 125], [224, 172, 105], [198, 134, 66],
    
    // Vermelhos
    [255, 0, 0], [220, 20, 60], [178, 34, 34], [139, 0, 0], [255, 182, 193], [255, 105, 180],
    
    // Azuis
    [0, 0, 255], [30, 144, 255], [70, 130, 180], [0, 0, 139], [173, 216, 230], [135, 206, 235],
    
    // Verdes
    [0, 255, 0], [34, 139, 34], [0, 128, 0], [0, 100, 0], [144, 238, 144], [152, 251, 152],
    
    // Amarelos e laranjas
    [255, 255, 0], [255, 215, 0], [255, 165, 0], [255, 140, 0], [255, 69, 0],
    
    // Roxos e rosas
    [128, 0, 128], [75, 0, 130], [138, 43, 226], [221, 160, 221], [255, 20, 147],
    
    // Marrons
    [139, 69, 19], [160, 82, 45], [210, 180, 140], [222, 184, 135], [245, 245, 220]
  ];
}

// ================= REDIMENSIONAMENTO INTELIGENTE =================
function intelligentResize(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const targetIndex = (y * targetWidth + x) * 4;
      
      // Amostragem de área com peso por importância
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
          
          // Peso baseado na importância visual
          const brightness = (r + g + b) / 3;
          const weight = brightness < 50 || brightness > 200 ? 2 : 1; // Dar mais peso a extremos
          
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

// ================= DITHERING FLOYD-STEINBERG =================
function floydSteinbergDithering(imageData, width, height) {
  const data = new Float32Array(imageData.length);
  const output = new Uint8ClampedArray(imageData.length);
  const palette = getCrossStitchPalette();
  
  // Copiar dados para array de float para cálculos precisos
  for (let i = 0; i < imageData.length; i++) {
    data[i] = imageData[i];
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const oldR = data[idx];
      const oldG = data[idx + 1];
      const oldB = data[idx + 2];
      
      // Encontrar cor mais próxima na paleta
      const newColor = findClosestColor([oldR, oldG, oldB], palette);
      
      output[idx] = newColor[0];
      output[idx + 1] = newColor[1];
      output[idx + 2] = newColor[2];
      output[idx + 3] = 255;
      
      // Calcular erro
      const errorR = oldR - newColor[0];
      const errorG = oldG - newColor[1];
      const errorB = oldB - newColor[2];
      
      // Distribuir erro Floyd-Steinberg
      if (x + 1 < width) {
        const rightIdx = (y * width + (x + 1)) * 4;
        data[rightIdx] += errorR * 7/16;
        data[rightIdx + 1] += errorG * 7/16;
        data[rightIdx + 2] += errorB * 7/16;
      }
      
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4;
          data[bottomLeftIdx] += errorR * 3/16;
          data[bottomLeftIdx + 1] += errorG * 3/16;
          data[bottomLeftIdx + 2] += errorB * 3/16;
        }
        
        const bottomIdx = ((y + 1) * width + x) * 4;
        data[bottomIdx] += errorR * 5/16;
        data[bottomIdx + 1] += errorG * 5/16;
        data[bottomIdx + 2] += errorB * 5/16;
        
        if (x + 1 < width) {
          const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4;
          data[bottomRightIdx] += errorR * 1/16;
          data[bottomRightIdx + 1] += errorG * 1/16;
          data[bottomRightIdx + 2] += errorB * 1/16;
        }
      }
    }
  }
  
  return output;
}

// ================= ENCONTRAR COR MAIS PRÓXIMA =================
function findClosestColor(targetColor, palette) {
  let minDistance = Infinity;
  let closest = palette[0];
  
  for (const color of palette) {
    const distance = colorDistance(targetColor, color);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }
  
  return closest;
}

// ================= DISTÂNCIA ENTRE CORES =================
function colorDistance(color1, color2) {
  const dr = color1[0] - color2[0];
  const dg = color1[1] - color2[1];
  const db = color1[2] - color2[2];
  
  // Distância euclidiana ponderada (olho humano é mais sensível ao verde)
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

// ================= REALCE DE DETALHES =================
function enhanceDetails(imageData, width, height) {
  const output = new Uint8ClampedArray(imageData.length);
  const data = imageData;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Detectar se é um pixel de destaque (olhos, etc)
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const brightness = (r + g + b) / 3;
      
      // Realçar pixels muito claros em áreas escuras
      if (brightness > 200) {
        let darkNeighbors = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              const nBrightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
              
              if (nBrightness < 100) darkNeighbors++;
            }
          }
        }
        
        // Se tem vizinhos escuros, realçar como branco puro
        if (darkNeighbors >= 3) {
          output[idx] = 255;
          output[idx + 1] = 255;
          output[idx + 2] = 255;
        } else {
          output[idx] = r;
          output[idx + 1] = g;
          output[idx + 2] = b;
        }
      } else {
        output[idx] = r;
        output[idx + 1] = g;
        output[idx + 2] = b;
      }
      
      output[idx + 3] = 255;
    }
  }
  
  return output;
}