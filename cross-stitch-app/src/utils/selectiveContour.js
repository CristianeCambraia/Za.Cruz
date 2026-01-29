/**
 * CONTORNO SELETIVO PROFISSIONAL
 * Delineia apenas características importantes (boca, olhos, nariz)
 * Não pinta toda a imagem de preto
 */

export function createSelectiveContour(imageData, width, height) {
  console.log('🎯 Criando contorno seletivo profissional...');
  
  const contourPixels = {};
  const data = imageData.data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      if (a < 50) continue; // Pular pixels transparentes
      
      // Verificar vizinhos em 4 direções
      const neighbors = [
        { x: x-1, y: y },     // esquerda
        { x: x+1, y: y },     // direita  
        { x: x, y: y-1 },     // cima
        { x: x, y: y+1 }      // baixo
      ];
      
      let shouldContour = false;
      
      for (const neighbor of neighbors) {
        const nIdx = (neighbor.y * width + neighbor.x) * 4;
        const nR = data[nIdx];
        const nG = data[nIdx + 1];
        const nB = data[nIdx + 2];
        const nA = data[nIdx + 3];
        
        // Se vizinho é transparente (borda externa)
        if (nA < 50) {
          shouldContour = true;
          break;
        }
        
        // Se há diferença significativa de cor (características internas)
        const colorDiff = Math.abs(r - nR) + Math.abs(g - nG) + Math.abs(b - nB);
        
        // Apenas diferenças muito significativas (boca, olhos, nariz)
        if (colorDiff > 150) {
          // Verificar se é uma característica importante
          if (isImportantFeature(r, g, b, nR, nG, nB)) {
            shouldContour = true;
            break;
          }
        }
      }
      
      if (shouldContour) {
        contourPixels[`${x},${y}`] = true;
      }
    }
  }
  
  console.log(`✅ Contorno seletivo: ${Object.keys(contourPixels).length} pixels`);
  return contourPixels;
}

// Detectar se é uma característica importante (não ruído)
function isImportantFeature(r1, g1, b1, r2, g2, b2) {
  // Converter para HSV para melhor análise
  const hsv1 = rgbToHsv(r1, g1, b1);
  const hsv2 = rgbToHsv(r2, g2, b2);
  
  // Diferença de brilho significativa (sombras, contornos naturais)
  const brightnessDiff = Math.abs(hsv1.v - hsv2.v);
  if (brightnessDiff > 0.3) return true;
  
  // Diferença de saturação (cores vs tons neutros)
  const saturationDiff = Math.abs(hsv1.s - hsv2.s);
  if (saturationDiff > 0.4) return true;
  
  // Transição de cor para preto/branco (características faciais)
  const isBlackWhiteTransition = 
    (hsv1.v < 0.2 && hsv2.v > 0.8) || 
    (hsv1.v > 0.8 && hsv2.v < 0.2);
  
  if (isBlackWhiteTransition) return true;
  
  return false;
}

// Converter RGB para HSV
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return { h: h / 360, s, v };
}