import { useState, useCallback } from 'react';

export function useCanvasTools() {
  const [tool, setTool] = useState('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [gridData, setGridData] = useState({});

  const drawPixel = useCallback((x, y, color, grid = gridData) => {
    const key = `${x},${y}`;
    const newGrid = { ...grid };
    
    if (tool === 'eraser') {
      delete newGrid[key];
    } else if (tool === 'pencil') {
      newGrid[key] = color;
    }
    
    return newGrid;
  }, [tool, gridData]);

  const getPixelColor = useCallback((x, y) => {
    const key = `${x},${y}`;
    return gridData[key] || null;
  }, [gridData]);

  const floodFill = useCallback((startX, startY, newColor) => {
    const targetColor = getPixelColor(startX, startY);
    if (targetColor === newColor) return gridData;

    const newGrid = { ...gridData };
    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);

      const currentColor = getPixelColor(x, y);
      if (currentColor !== targetColor) continue;

      newGrid[key] = newColor;

      // Adicionar pixels adjacentes
      [[x+1, y], [x-1, y], [x, y+1], [x, y-1]].forEach(([nx, ny]) => {
        if (nx >= 0 && ny >= 0 && nx < 100 && ny < 100) {
          stack.push([nx, ny]);
        }
      });
    }

    return newGrid;
  }, [gridData, getPixelColor]);

  const clearGrid = useCallback(() => {
    setGridData({});
  }, []);

  return {
    tool,
    setTool,
    isDrawing,
    setIsDrawing,
    zoom,
    setZoom,
    gridData,
    setGridData,
    drawPixel,
    getPixelColor,
    floodFill,
    clearGrid
  };
}