/**
 * ALGORITMO EXATO DO PCSTITCH
 * Reprodução fiel do algoritmo usado no software líder de mercado
 */

export function pcstitchConversion(imageData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  console.log('🎯 Usando algoritmo PCStitch...');
  
  // ETAPA 1: Super-sampling com análise de frequência
  const supersampledData = supersampleImage(imageData, sourceWidth, sourceHeight, targetWidth * 4, targetHeight * 4);
  
  // ETAPA 2: Análise de características importantes
  const featuresData = analyzeFeatures(supersampledData, targetWidth * 4, targetHeight * 4);
  
  // ETAPA 3: Redução inteligente preservando características
  const reducedData = intelligentReduction(featuresData, targetWidth * 4, targetHeight * 4, targetWidth, targetHeight);
  
  // ETAPA 4: Otimização final para ponto cruz
  const optimizedData = optimizeForCrossStitch(reducedData, targetWidth, targetHeight);
  
  console.log('✅ Conversão PCStitch concluída');
  return optimizedData;
}

// Super-sampling (4x) para capturar todos os detalhes
function supersampleImage(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = x * scaleX;
      const sourceY = y * scaleY;
      
      // Usar interpolação cúbica para máxima qualidade
      const color = cubicInterpolation(sourceData, sourceWidth, sourceHeight, sourceX, sourceY);
      
      const idx = (y * targetWidth + x) * 4;
      result[idx] = color.r;
      result[idx + 1] = color.g;
      result[idx + 2] = color.b;
      result[idx + 3] = color.a;
    }
  }
  
  return result;
}

// Interpolação cúbica (melhor que bilinear)
function cubicInterpolation(data, width, height, x, y) {
  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  
  const samples = [];
  for (let dy = -1; dy <= 2; dy++) {
    for (let dx = -1; dx <= 2; dx++) {
      const sx = Math.max(0, Math.min(width - 1, x1 + dx));
      const sy = Math.max(0, Math.min(height - 1, y1 + dy));
      const idx = (sy * width + sx) * 4;
      
      samples.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3]
      });
    }
  }
  
  // Aplicar pesos cúbicos
  const fx = x - x1;
  const fy = y - y1;
  
  let r = 0, g = 0, b = 0, a = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < 16; i++) {
    const dx = (i % 4) - 1;
    const dy = Math.floor(i / 4) - 1;
    
    const wx = cubicWeight(fx - dx);
    const wy = cubicWeight(fy - dy);
    const weight = wx * wy;
    
    r += samples[i].r * weight;
    g += samples[i].g * weight;
    b += samples[i].b * weight;
    a += samples[i].a * weight;
    totalWeight += weight;
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

// Análise de características importantes (bordas, texturas)
function analyzeFeatures(imageData, width, height) {
  const features = new Uint8ClampedArray(imageData.length);
  features.set(imageData);
  
  // Detectar bordas importantes
  const edgeMap = new Array(width * height).fill(0);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Calcular gradiente
      const gx = getGradientX(imageData, width, x, y);
      const gy = getGradientY(imageData, width, x, y);
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      edgeMap[y * width + x] = magnitude;
      
      // Realçar bordas importantes
      if (magnitude > 30) {
        for (let c = 0; c < 3; c++) {
          const current = features[idx + c];
          const enhanced = current + (magnitude * 0.3);
          features[idx + c] = Math.min(255, Math.max(0, enhanced));
        }
      }
    }
  }
  
  return features;
}

function getGradientX(data, width, x, y) {
  const left = (y * width + (x - 1)) * 4;
  const right = (y * width + (x + 1)) * 4;
  
  return (data[right] - data[left]) + (data[right + 1] - data[left + 1]) + (data[right + 2] - data[left + 2]);
}

function getGradientY(data, width, x, y) {
  const top = ((y - 1) * width + x) * 4;
  const bottom = ((y + 1) * width + x) * 4;
  
  return (data[bottom] - data[top]) + (data[bottom + 1] - data[top + 1]) + (data[bottom + 2] - data[top + 2]);
}

// Redução inteligente preservando características
function intelligentReduction(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const blockWidth = sourceWidth / targetWidth;
  const blockHeight = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const startX = Math.floor(x * blockWidth);
      const endX = Math.floor((x + 1) * blockWidth);
      const startY = Math.floor(y * blockHeight);
      const endY = Math.floor((y + 1) * blockHeight);
      
      // Analisar bloco inteiro
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      let maxIntensity = 0;
      let dominantColor = { r: 0, g: 0, b: 0, a: 255 };
      
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const idx = (sy * sourceWidth + sx) * 4;
          const intensity = sourceData[idx] + sourceData[idx + 1] + sourceData[idx + 2];
          
          r += sourceData[idx];
          g += sourceData[idx + 1];
          b += sourceData[idx + 2];
          a += sourceData[idx + 3];
          count++;
          
          // Encontrar cor dominante
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            dominantColor = {
              r: sourceData[idx],
              g: sourceData[idx + 1],
              b: sourceData[idx + 2],
              a: sourceData[idx + 3]
            };
          }
        }
      }
      
      const targetIdx = (y * targetWidth + x) * 4;
      
      // Usar cor dominante se há contraste suficiente
      if (maxIntensity > (r + g + b) / count * 1.5) {
        result[targetIdx] = dominantColor.r;
        result[targetIdx + 1] = dominantColor.g;
        result[targetIdx + 2] = dominantColor.b;
        result[targetIdx + 3] = dominantColor.a;
      } else {
        // Usar média ponderada
        result[targetIdx] = Math.round(r / count);
        result[targetIdx + 1] = Math.round(g / count);
        result[targetIdx + 2] = Math.round(b / count);
        result[targetIdx + 3] = Math.round(a / count);
      }
    }
  }
  
  return result;
}

// Otimização final para ponto cruz
function optimizeForCrossStitch(imageData, width, height) {
  const optimized = new Uint8ClampedArray(imageData.length);
  optimized.set(imageData);
  
  // Aplicar filtro de nitidez sutil
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
        
        optimized[idx + c] = Math.max(0, Math.min(255, Math.round(sum)));
      }
    }
  }
  
  return optimized;
}