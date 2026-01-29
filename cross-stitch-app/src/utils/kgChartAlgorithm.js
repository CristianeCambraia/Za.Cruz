/**
 * ALGORITMO INSPIRADO NO KG-CHART
 * Reproduz a qualidade profissional do KG-Chart for Cross Stitch
 */

export function kgChartConversion(imageData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  console.log('🎯 Usando algoritmo KG-Chart...');
  
  // ETAPA 1: Redimensionamento com preservação de detalhes
  const resizedData = kgResize(imageData, sourceWidth, sourceHeight, targetWidth, targetHeight);
  
  // ETAPA 2: Otimização de cores para ponto cruz
  const optimizedData = optimizeForStitching(resizedData, targetWidth, targetHeight);
  
  // ETAPA 3: Realce de definição
  const finalData = enhanceDefinition(optimizedData, targetWidth, targetHeight);
  
  console.log('✅ Conversão KG-Chart concluída');
  return finalData;
}

// Redimensionamento KG-Chart (área sampling inteligente)
function kgResize(sourceData, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  
  const scaleX = sourceWidth / targetWidth;
  const scaleY = sourceHeight / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // Calcular área de amostragem
      const startX = Math.floor(x * scaleX);
      const endX = Math.min(Math.ceil((x + 1) * scaleX), sourceWidth);
      const startY = Math.floor(y * scaleY);
      const endY = Math.min(Math.ceil((y + 1) * scaleY), sourceHeight);
      
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      let maxIntensity = 0;
      let dominantPixel = { r: 0, g: 0, b: 0, a: 255 };
      
      // Analisar toda a área
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          const idx = (sy * sourceWidth + sx) * 4;
          const pr = sourceData[idx];
          const pg = sourceData[idx + 1];
          const pb = sourceData[idx + 2];
          const pa = sourceData[idx + 3];
          
          const intensity = pr + pg + pb;
          
          r += pr;
          g += pg;
          b += pb;
          a += pa;
          count++;
          
          // Encontrar pixel dominante (mais importante)
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            dominantPixel = { r: pr, g: pg, b: pb, a: pa };
          }
        }
      }
      
      const targetIdx = (y * targetWidth + x) * 4;
      
      // KG-Chart usa pixel dominante se há contraste significativo
      const avgIntensity = (r + g + b) / count;
      if (maxIntensity > avgIntensity * 1.3) {
        result[targetIdx] = dominantPixel.r;
        result[targetIdx + 1] = dominantPixel.g;
        result[targetIdx + 2] = dominantPixel.b;
        result[targetIdx + 3] = dominantPixel.a;
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

// Otimização específica para ponto cruz
function optimizeForStitching(imageData, width, height) {
  const optimized = new Uint8ClampedArray(imageData.length);
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    
    // Aumentar saturação para cores mais vivas
    const hsv = rgbToHsv(r, g, b);
    hsv.s = Math.min(1, hsv.s * 1.15);
    hsv.v = Math.min(1, hsv.v * 1.05);
    
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    
    optimized[i] = rgb.r;
    optimized[i + 1] = rgb.g;
    optimized[i + 2] = rgb.b;
    optimized[i + 3] = a;
  }
  
  return optimized;
}

// Realce de definição (KG-Chart style)
function enhanceDefinition(imageData, width, height) {
  const enhanced = new Uint8ClampedArray(imageData.length);
  enhanced.set(imageData);
  
  // Kernel de realce suave
  const kernel = [
    [0, -0.1, 0],
    [-0.1, 1.4, -0.1],
    [0, -0.1, 0]
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
        
        enhanced[idx + c] = Math.max(0, Math.min(255, Math.round(sum)));
      }
    }
  }
  
  return enhanced;
}

// Conversões de cor
function rgbToHsv(r, g, b) {
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
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return { h: h / 360, s, v };
}

function hsvToRgb(h, s, v) {
  h *= 360;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  
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