import { useEffect, useRef } from "react";

// ================= COMPONENT =================
export default function CanvasGrid({
  width,
  height,
  zoom,
  pixels,
  contourEnabled,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!width || !height || !pixels?.colors) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const baseCell = 20;
    const cellSize = Math.max(6, Math.round(baseCell / zoom));
    const dpr = window.devicePixelRatio || 1;

    const rulerSpace = cellSize * 3;
    canvas.width = (width * cellSize + rulerSpace) * dpr;
    canvas.height = (height * cellSize + rulerSpace) * dpr;
    canvas.style.width = `${width * cellSize + rulerSpace}px`;
    canvas.style.height = `${height * cellSize + rulerSpace}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // 1️⃣ Fundo das réguas
    drawRulerBackground(ctx, width, height, cellSize, rulerSpace);
    
    // 2️⃣ Transformar para área do grid
    ctx.save();
    ctx.translate(rulerSpace, rulerSpace);

    // 3️⃣ pixels coloridos
    drawPixels(ctx, pixels.colors, cellSize);

    // 4️⃣ CONTORNO PROFISSIONAL
    if (contourEnabled && pixels.contourMap) {
      drawContourSquares(ctx, pixels.contourMap, cellSize);
    }

    // 5️⃣ grade profissional
    drawProfessionalGrid(ctx, width, height, cellSize);
    
    ctx.restore();
    
    // 6️⃣ réguas profissionais
    drawProfessionalRulers(ctx, width, height, cellSize, rulerSpace);
    
    // 7️⃣ bordas e cantos
    drawBorders(ctx, width, height, cellSize, rulerSpace);
  }, [width, height, zoom, pixels, contourEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "2px solid #333",
        background: "#fff",
        imageRendering: "pixelated",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "4px"
      }}
    />
  );
}

// ================= PIXELS =================
function drawPixels(ctx, colors, cellSize) {
  for (const key in colors) {
    const [x, y] = key.split(",").map(Number);
    ctx.fillStyle = colors[key];
    ctx.fillRect(
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }
}

// ================= CONTORNO PROFISSIONAL REAL =================
// quadradinhos pretos SOMENTE onde a imagem original tinha linha
function drawContourSquares(ctx, contourMap, cellSize) {
  ctx.fillStyle = "#000";

  for (const key in contourMap) {
    const [x, y] = key.split(",").map(Number);

    ctx.fillRect(
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }
}

// ================= FUNDO DAS RÉGUAS =================
function drawRulerBackground(ctx, width, height, cellSize, rulerSpace) {
  ctx.fillStyle = "#f8f9fa";
  
  // Fundo régua horizontal
  ctx.fillRect(0, 0, width * cellSize + rulerSpace, rulerSpace);
  
  // Fundo régua vertical
  ctx.fillRect(0, 0, rulerSpace, height * cellSize + rulerSpace);
  
  // Canto superior esquerdo
  ctx.fillStyle = "#e9ecef";
  ctx.fillRect(0, 0, rulerSpace, rulerSpace);
}

// ================= GRADE PROFISSIONAL =================
function drawProfessionalGrid(ctx, width, height, cellSize) {
  // Linhas finas cinza claro
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(width * cellSize, y * cellSize + 0.5);
    ctx.stroke();
  }
  
  // Linhas médias a cada 5
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 0.8;

  for (let x = 0; x <= width; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(width * cellSize, y * cellSize + 0.5);
    ctx.stroke();
  }
  
  // Linhas grossas a cada 10 - estilo profissional
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  for (let x = 0; x <= width; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(width * cellSize, y * cellSize + 0.5);
    ctx.stroke();
  }
}

// ================= RÉGUAS PROFISSIONAIS =================
function drawProfessionalRulers(ctx, width, height, cellSize, rulerSpace) {
  const fontSize = Math.max(10, cellSize * 0.5);
  ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillStyle = "#333";
  
  // Marcações pequenas a cada 5
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  
  // Régua horizontal
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let x = 5; x <= width; x += 5) {
    const xPos = rulerSpace + x * cellSize;
    
    if (x % 10 === 0) {
      // Marcação grande e número
      ctx.beginPath();
      ctx.moveTo(xPos, rulerSpace - 15);
      ctx.lineTo(xPos, rulerSpace - 5);
      ctx.stroke();
      
      ctx.fillText(x.toString(), xPos, rulerSpace - 20);
    } else {
      // Marcação pequena
      ctx.beginPath();
      ctx.moveTo(xPos, rulerSpace - 10);
      ctx.lineTo(xPos, rulerSpace - 5);
      ctx.stroke();
    }
  }
  
  // Régua vertical
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let y = 5; y <= height; y += 5) {
    const yPos = rulerSpace + y * cellSize;
    
    if (y % 10 === 0) {
      // Marcação grande e número
      ctx.beginPath();
      ctx.moveTo(rulerSpace - 15, yPos);
      ctx.lineTo(rulerSpace - 5, yPos);
      ctx.stroke();
      
      ctx.save();
      ctx.translate(rulerSpace - 25, yPos);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(y.toString(), 0, 0);
      ctx.restore();
    } else {
      // Marcação pequena
      ctx.beginPath();
      ctx.moveTo(rulerSpace - 10, yPos);
      ctx.lineTo(rulerSpace - 5, yPos);
      ctx.stroke();
    }
  }
}

// ================= BORDAS E CANTOS =================
function drawBorders(ctx, width, height, cellSize, rulerSpace) {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  
  // Borda do grid principal
  ctx.strokeRect(rulerSpace, rulerSpace, width * cellSize, height * cellSize);
  
  // Linhas separadoras das réguas
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#666";
  
  // Linha horizontal separadora
  ctx.beginPath();
  ctx.moveTo(rulerSpace, rulerSpace);
  ctx.lineTo(rulerSpace + width * cellSize, rulerSpace);
  ctx.stroke();
  
  // Linha vertical separadora
  ctx.beginPath();
  ctx.moveTo(rulerSpace, rulerSpace);
  ctx.lineTo(rulerSpace, rulerSpace + height * cellSize);
  ctx.stroke();
}
