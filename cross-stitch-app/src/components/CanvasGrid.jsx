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

    canvas.width = width * cellSize * dpr;
    canvas.height = height * cellSize * dpr;
    canvas.style.width = `${width * cellSize}px`;
    canvas.style.height = `${height * cellSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
}
