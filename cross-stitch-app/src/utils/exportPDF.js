import jsPDF from 'jspdf';
import { dmcSymbols } from './dmcColors.js';

export function exportToPDF(gridData, gridSize = 80) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Configurações
  const cellSize = 2;
  const startX = 20;
  const startY = 30;
  const maxGridWidth = pageWidth - 40;
  const maxGridHeight = pageHeight - 80;
  
  // Título
  pdf.setFontSize(16);
  pdf.text('Gráfico de Ponto Cruz', pageWidth / 2, 20, { align: 'center' });
  
  // Desenhar grade
  pdf.setFontSize(8);
  
  // Coletar cores únicas
  const usedColors = new Set(Object.values(gridData));
  const colorMap = {};
  Array.from(usedColors).forEach((color, index) => {
    const colorName = Object.entries(dmcSymbols).find(([name, symbol]) => {
      // Encontrar cor DMC correspondente (simplificado)
      return true; // Por simplicidade, usar primeiro símbolo disponível
    });
    colorMap[color] = Object.values(dmcSymbols)[index % Object.values(dmcSymbols).length];
  });
  
  // Desenhar pixels como símbolos
  Object.entries(gridData).forEach(([key, color]) => {
    const [x, y] = key.split(',').map(Number);
    const symbol = colorMap[color] || '●';
    
    const pdfX = startX + (x * cellSize);
    const pdfY = startY + (y * cellSize);
    
    if (pdfX < maxGridWidth && pdfY < maxGridHeight) {
      pdf.text(symbol, pdfX, pdfY);
    }
  });
  
  // Desenhar linhas da grade (a cada 10 células)
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.1);
  
  for (let x = 0; x <= gridSize; x += 10) {
    const lineX = startX + (x * cellSize);
    if (lineX <= maxGridWidth) {
      pdf.line(lineX, startY, lineX, startY + Math.min(gridSize * cellSize, maxGridHeight));
    }
  }
  
  for (let y = 0; y <= gridSize; y += 10) {
    const lineY = startY + (y * cellSize);
    if (lineY <= maxGridHeight) {
      pdf.line(startX, lineY, startX + Math.min(gridSize * cellSize, maxGridWidth), lineY);
    }
  }
  
  // Legenda de cores
  let legendY = Math.max(startY + (gridSize * cellSize) + 20, pageHeight - 60);
  
  pdf.setFontSize(12);
  pdf.text('Legenda de Cores:', startX, legendY);
  legendY += 10;
  
  pdf.setFontSize(10);
  Array.from(usedColors).forEach((color, index) => {
    const symbol = colorMap[color];
    const colorName = `Cor ${index + 1}`;
    
    pdf.text(`${symbol} - ${colorName} (${color})`, startX, legendY);
    legendY += 8;
    
    if (legendY > pageHeight - 20) {
      pdf.addPage();
      legendY = 30;
    }
  });
  
  return pdf;
}

export function exportToPNG(canvasRef) {
  if (!canvasRef.current) return null;
  
  const originalCanvas = canvasRef.current;
  
  // Criar canvas de alta resolução (equivalente a DPI 600)
  const scale = 2; // Dobrar resolução
  const highResCanvas = document.createElement('canvas');
  const ctx = highResCanvas.getContext('2d');
  
  highResCanvas.width = originalCanvas.width * scale;
  highResCanvas.height = originalCanvas.height * scale;
  
  // Configurar para máxima nitidez
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  
  // Escalar contexto
  ctx.scale(scale, scale);
  
  // Desenhar canvas original no de alta resolução
  ctx.drawImage(originalCanvas, 0, 0);
  
  // Gerar PNG de alta qualidade
  const dataURL = highResCanvas.toDataURL('image/png', 1.0);
  
  const link = document.createElement('a');
  link.download = 'cross-stitch-pattern-hq.png';
  link.href = dataURL;
  
  return { dataURL, link };
}