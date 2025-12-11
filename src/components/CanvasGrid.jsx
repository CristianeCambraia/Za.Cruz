import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const CELL_SIZE = 12;
const GRID_SIZE = 100;

const CanvasGrid = forwardRef(({ selectedColor, tool, gridData, onGridChange, onColorPick }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useImperativeHandle(ref, () => canvasRef.current);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;
    
    canvas.width = width;
    canvas.height = height;
    
    // Configurar para máxima nitidez
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar pixels coloridos com máxima nitidez
    Object.entries(gridData).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      // Contorno sutil para definir pixel
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    
    // Grade fina (minor grid)
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + 0.5, 0);
      ctx.lineTo(x * CELL_SIZE + 0.5, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE + 0.5);
      ctx.lineTo(width, y * CELL_SIZE + 0.5);
      ctx.stroke();
    }
    
    // Grade forte (major grid) a cada 10
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    
    for (let x = 0; x <= GRID_SIZE; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + 0.5, 0);
      ctx.lineTo(x * CELL_SIZE + 0.5, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_SIZE; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE + 0.5);
      ctx.lineTo(width, y * CELL_SIZE + 0.5);
      ctx.stroke();
    }
    
    // Réguas profissionais
    drawRulers(ctx, width, height);
  }, [gridData]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    return { x, y };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePos(e);
    isDrawing.current = true;
    
    if (tool === 'eyedropper') {
      const key = `${x},${y}`;
      const color = gridData[key];
      if (color && onColorPick) {
        onColorPick(color);
      }
      return;
    }
    
    drawPixel(x, y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getMousePos(e);
    drawPixel(x, y);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const drawPixel = (x, y) => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return;
    
    const key = `${x},${y}`;
    const newGrid = { ...gridData };
    
    if (tool === 'eraser') {
      delete newGrid[key];
    } else {
      newGrid[key] = selectedColor;
    }
    
    onGridChange(newGrid);
  };

  const drawRulers = (ctx, width, height) => {
    // Régua horizontal (topo)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, -25, width, 25);
    
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let x = 0; x <= GRID_SIZE; x += 10) {
      const posX = x * CELL_SIZE;
      // Linha da régua
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(posX, -25);
      ctx.lineTo(posX, -15);
      ctx.stroke();
      
      // Número
      if (x > 0) {
        ctx.fillText(x.toString(), posX, -5);
      }
    }
    
    // Régua vertical (esquerda)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-25, 0, 25, height);
    
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    
    for (let y = 0; y <= GRID_SIZE; y += 10) {
      const posY = y * CELL_SIZE;
      // Linha da régua
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-25, posY);
      ctx.lineTo(-15, posY);
      ctx.stroke();
      
      // Número
      if (y > 0) {
        ctx.save();
        ctx.translate(-10, posY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(y.toString(), 0, 3);
        ctx.restore();
      }
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="grid-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ marginLeft: '25px', marginTop: '25px' }}
      />
    </div>
  );
});

export default CanvasGrid;