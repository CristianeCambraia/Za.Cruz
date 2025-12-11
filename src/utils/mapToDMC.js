import { dmcColors } from './dmcColors.js';

// Converter hex para RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calcular distância entre cores
function colorDistance(color1, color2) {
  const r1 = typeof color1.r !== 'undefined' ? color1.r : color1[0];
  const g1 = typeof color1.g !== 'undefined' ? color1.g : color1[1];
  const b1 = typeof color1.b !== 'undefined' ? color1.b : color1[2];
  
  const r2 = typeof color2.r !== 'undefined' ? color2.r : color2[0];
  const g2 = typeof color2.g !== 'undefined' ? color2.g : color2[1];
  const b2 = typeof color2.b !== 'undefined' ? color2.b : color2[2];
  
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// Mapear cor para DMC mais próxima
export function mapColorToDMC(inputColor) {
  let minDistance = Infinity;
  let closestDMC = null;
  
  Object.entries(dmcColors).forEach(([name, hex]) => {
    const dmcRgb = hexToRgb(hex);
    const distance = colorDistance(inputColor, dmcRgb);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestDMC = { name, hex, rgb: dmcRgb };
    }
  });
  
  return closestDMC;
}

// Mapear array de cores para DMC
export function mapColorsToDMC(colors) {
  return colors.map(color => {
    const rgbColor = Array.isArray(color) ? 
      { r: color[0], g: color[1], b: color[2] } : 
      color;
    
    return mapColorToDMC(rgbColor);
  });
}

// Converter RGB para hex
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}