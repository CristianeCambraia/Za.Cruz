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

    const baseCell = 18;
    const cellSize = Math.max(4, Math.round(baseCell / zoom));
    const dpr = window.devicePixelRatio || 1;

    const rulerSpace = cellSize * 2;
    canvas.width = (width * cellSize + rulerSpace) * dpr;
    canvas.height = (height * cellSize + rulerSpace) * dpr;
    canvas.style.width = `${width * cellSize + rulerSpace}px`;
    canvas.style.height = `${height * cellSize + rulerSpace}px`;

    ctx.setTransform(dpr, 0, 0, dpr, rulerSpace, rulerSpace);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1️⃣ pixels coloridos
    drawPixels(ctx, pixels.colors, cellSize);

    // 2️⃣ CONTORNO PROFISSIONAL (backstitch em quadradinho)
    if (contourEnabled && pixels.contourMap) {
      drawContourSquares(ctx, pixels.contourMap, cellSize);
    }

    // 3️⃣ grade
    drawGrid(ctx, width, height, cellSize);
    
    // 4️⃣ réguas
    drawRulers(ctx, width, height, cellSize);
  }, [width, height, zoom, pixels, contourEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid #999",
        background: "#fff",
        imageRendering: "pixelated",
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

// ================= GRADE =================
function drawGrid(ctx, width, height, cellSize) {
  // Linhas finas normais
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width * cellSize, y * cellSize);
    ctx.stroke();
  }
  
  // Linhas grossas a cada 10 quadradinhos
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  for (let x = 0; x <= width; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width * cellSize, y * cellSize);
    ctx.stroke();
  }
}

// ================= RÉGUAS =================
function drawRulers(ctx, width, height, cellSize) {
  ctx.fillStyle = "#000";
  ctx.font = `${Math.max(8, cellSize * 0.6)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Régua horizontal (topo) - a cada 10
  for (let x = 10; x <= width; x += 10) {
    ctx.fillText(
      x.toString(),
      x * cellSize - (5 * cellSize),
      -cellSize * 0.5
    );
  }

  // Régua vertical (esquerda) - a cada 10
  ctx.textAlign = "right";
  for (let y = 10; y <= height; y += 10) {
    ctx.fillText(
      y.toString(),
      -cellSize * 0.3,
      y * cellSize - (5 * cellSize)
    );
  }
}
