import React, { useState, useRef } from 'react';
import CanvasGrid from './components/CanvasGrid.jsx';
import ColorPalette from './components/ColorPalette.jsx';
import ExportMenu from './components/ExportMenu.jsx';
import './styles.css';

function App() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [gridData, setGridData] = useState({});
  const [history, setHistory] = useState([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(60);
  const [imageHeight, setImageHeight] = useState(60);
  const [contourEnabled, setContourEnabled] = useState(true);
  const [contourThickness, setContourThickness] = useState(1);
  const [contourIntensity, setContourIntensity] = useState(0.7);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Formato do arquivo:', file.type);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const scale = Math.min(imageWidth / img.width, imageHeight / img.height);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newGrid = {};
      

      
      // Converter cada pixel da imagem diretamente para a grade
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];
          
          if (a > 50) {
            const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            newGrid[`${x},${y + 25}`] = color;
          }
        }
      }
      
      console.log('Contorno habilitado:', contourEnabled);
      
      // Adicionar contorno profissional se habilitado
      if (contourEnabled) {
        console.log('Aplicando contorno...');
        const gridWithContour = addProfessionalContour(newGrid);
        setGridData(gridWithContour);
      } else {
        console.log('Contorno desabilitado, usando grid original');
        setGridData(newGrid);
      }
      
      console.log('Pixels:', Object.keys(newGrid).length);
    };
    
    img.src = URL.createObjectURL(file);
  };

  const handleClear = () => {
    const newGrid = {};
    saveToHistory(newGrid);
    setGridData(newGrid);
  };

  const saveToHistory = (newGrid) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newGrid });
    if (newHistory.length > 20) newHistory.shift(); // Limitar a 20 ações
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGridData({ ...history[newIndex] });
    }
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'cross-stitch.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleSave = () => {
    const projectData = {
      gridData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    try {
      localStorage.setItem('crossStitchProject', JSON.stringify(projectData));
      alert('Projeto salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar projeto');
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('crossStitchProject');
      if (saved) {
        const projectData = JSON.parse(saved);
        if (projectData.gridData) {
          setGridData(projectData.gridData);
          alert('Projeto carregado com sucesso!');
        }
      } else {
        alert('Nenhum projeto salvo encontrado');
      }
    } catch (error) {
      alert('Erro ao carregar projeto');
    }
  };

  const addBorder = () => {
    if (Object.keys(gridData).length === 0) {
      alert('Importe uma imagem primeiro!');
      return;
    }

    const finalGrid = { ...gridData };
    
    // Criar sombreado com degradê em 3 camadas
    const shadowLayers = [
      { distance: 1, opacity: 0.6 },  // Sombra mais escura
      { distance: 2, opacity: 0.4 },  // Sombra média
      { distance: 3, opacity: 0.2 }   // Sombra mais clara
    ];
    
    shadowLayers.forEach(({ distance, opacity }) => {
      Object.keys(gridData).forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const originalColor = gridData[key];
        
        // Converter hex para RGB
        const r = parseInt(originalColor.slice(1, 3), 16);
        const g = parseInt(originalColor.slice(3, 5), 16);
        const b = parseInt(originalColor.slice(5, 7), 16);
        
        // Criar cor mais escura
        const shadowR = Math.floor(r * (1 - opacity));
        const shadowG = Math.floor(g * (1 - opacity));
        const shadowB = Math.floor(b * (1 - opacity));
        const shadowColor = `#${shadowR.toString(16).padStart(2, '0')}${shadowG.toString(16).padStart(2, '0')}${shadowB.toString(16).padStart(2, '0')}`;
        
        // Adicionar sombra ao redor na distância especificada
        const directions = [
          [-distance, -distance], [-distance, 0], [-distance, distance],
          [0, -distance],                         [0, distance],
          [distance, -distance],  [distance, 0],  [distance, distance]
        ];
        
        directions.forEach(([dx, dy]) => {
          const shadowX = x + dx;
          const shadowY = y + dy;
          const shadowKey = `${shadowX},${shadowY}`;
          
          // Só adicionar se a posição estiver vazia
          if (!gridData[shadowKey] && !finalGrid[shadowKey]) {
            finalGrid[shadowKey] = shadowColor;
          }
        });
      });
    });
    
    saveToHistory(finalGrid);
    setGridData(finalGrid);
    alert('Sombreado com degradê adicionado!');
  };

  const applyContour = (originalGrid) => {
    const gridWithContour = { ...originalGrid };
    
    // Detectar bordas usando algoritmo de detecção de bordas
    Object.keys(originalGrid).forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const currentColor = originalGrid[key];
      
      // Verificar vizinhos para detectar bordas
      const neighbors = [
        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
      ];
      
      let isBorder = false;
      
      neighbors.forEach(([nx, ny]) => {
        const neighborKey = `${nx},${ny}`;
        const neighborColor = originalGrid[neighborKey];
        
        // Se não tem vizinho ou cor diferente, é borda
        if (!neighborColor || neighborColor !== currentColor) {
          isBorder = true;
        }
      });
      
      // Se é borda, aplicar contorno
      if (isBorder) {
        const contourColor = createContourColor(currentColor);
        
        // Aplicar contorno baseado na espessura
        for (let thickness = 1; thickness <= contourThickness; thickness++) {
          const contourPositions = [
            [x-thickness, y], [x+thickness, y],
            [x, y-thickness], [x, y+thickness]
          ];
          
          if (thickness > 1) {
            // Adicionar diagonais para espessuras maiores
            contourPositions.push(
              [x-thickness, y-thickness], [x+thickness, y-thickness],
              [x-thickness, y+thickness], [x+thickness, y+thickness]
            );
          }
          
          contourPositions.forEach(([cx, cy]) => {
            const contourKey = `${cx},${cy}`;
            if (!originalGrid[contourKey]) {
              gridWithContour[contourKey] = contourColor;
            }
          });
        }
      }
    });
    
    return gridWithContour;
  };

  const addProfessionalContour = (originalGrid) => {
    console.log('Aplicando contorno profissional...');
    
    // Debug: verificar formato das cores
    const keys = Object.keys(originalGrid);
    if (keys.length > 0) {
      console.log('Primeira cor:', originalGrid[keys[0]]);
      console.log('Tipo da cor:', typeof originalGrid[keys[0]]);
      if (keys.length > 5) {
        console.log('Quinta cor:', originalGrid[keys[5]]);
      }
    }
    
    const gridWithContour = { ...originalGrid };
    let borderCount = 0;
    
    Object.keys(originalGrid).forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const currentColor = originalGrid[key];
      
      const neighbors = [
        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
      ];
      
      // Apenas bordas externas (fronteira com vazio)
      const hasEmptyNeighbor = neighbors.some(([nx, ny]) => {
        const neighborKey = `${nx},${ny}`;
        return !originalGrid[neighborKey];
      });
      
      if (hasEmptyNeighbor) {
        gridWithContour[key] = '#000000';
        borderCount++;
      }
    });
    
    console.log(`Pixels de borda encontrados: ${borderCount}`);
    return gridWithContour;
  };

  const toggleContour = () => {
    if (Object.keys(gridData).length === 0) {
      alert('Importe uma imagem primeiro!');
      return;
    }

    const finalGrid = { ...gridData };
    const contourPixels = new Set();
    
    // Para cada pixel da imagem, verificar se é borda
    Object.keys(gridData).forEach(key => {
      const [x, y] = key.split(',').map(Number);
      
      // Verificar se este pixel tem vizinho vazio (= é borda)
      const neighbors = [
        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
      ];
      
      let isBorder = false;
      
      neighbors.forEach(([nx, ny]) => {
        const neighborKey = `${nx},${ny}`;
        if (!gridData[neighborKey]) {
          isBorder = true;
          // Adicionar contorno na posição vazia
          contourPixels.add(neighborKey);
        }
      });
    });
    
    // Adicionar todos os pixels de contorno
    contourPixels.forEach(key => {
      finalGrid[key] = '#000000';
    });
    
    saveToHistory(finalGrid);
    setGridData(finalGrid);
    alert(`Contorno aplicado! ${contourPixels.size} pixels de borda.`);
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.avif"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        
        <button onClick={() => fileInputRef.current?.click()}>
          📥 Importar Imagem
        </button>
        
        <label style={{ color: 'white', fontSize: '12px' }}>
          Largura:
          <input
            type="number"
            value={imageWidth}
            onChange={(e) => setImageWidth(Number(e.target.value))}
            min="10"
            max="200"
            style={{ width: '60px', marginLeft: '5px', padding: '2px' }}
          />
        </label>
        
        <label style={{ color: 'white', fontSize: '12px' }}>
          Altura:
          <input
            type="number"
            value={imageHeight}
            onChange={(e) => setImageHeight(Number(e.target.value))}
            min="10"
            max="200"
            style={{ width: '60px', marginLeft: '5px', padding: '2px' }}
          />
        </label>
        
        <label style={{ color: 'white', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={contourEnabled}
            onChange={(e) => setContourEnabled(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Contorno Profissional
        </label>
        
        {contourEnabled && (
          <label style={{ color: 'white', fontSize: '12px' }}>
            Espessura:
            <select
              value={contourThickness}
              onChange={(e) => setContourThickness(Number(e.target.value))}
              style={{ marginLeft: '5px', padding: '2px' }}
            >
              <option value={1}>1 quadradinho</option>
              <option value={2}>2 quadradinhos</option>
            </select>
          </label>
        )}
        
        <button 
          className={tool === 'pencil' ? 'active' : ''}
          onClick={() => setTool('pencil')}
        >
          ✏️ Lápis
        </button>
        
        <button 
          className={tool === 'eraser' ? 'active' : ''}
          onClick={() => setTool('eraser')}
        >
          🧽 Borracha
        </button>
        
        <button 
          className={tool === 'eyedropper' ? 'active' : ''}
          onClick={() => setTool('eyedropper')}
        >
          💧 Conta-gotas
        </button>
        
        <button onClick={handleClear}>
          🗑️ Limpar
        </button>
        
        <button 
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          style={{ opacity: historyIndex <= 0 ? 0.5 : 1 }}
        >
          ↶ Desfazer
        </button>
        
        <button onClick={handleExport}>
          💾 Exportar PNG
        </button>
        
        <button onClick={() => {
          if (Object.keys(gridData).length > 0) {
            const gridWithContour = addProfessionalContour(gridData);
            setGridData(gridWithContour);
          }
        }}>
          🖤 Aplicar Contorno
        </button>
        

        
        <div style={{ marginLeft: 'auto' }}>
          Pixels: {Object.keys(gridData).length}
        </div>
      </div>
      
      <div className="workspace">
        <div className="sidebar">
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          
          <ExportMenu
            gridData={gridData}
            canvasRef={canvasRef}
          />
        </div>
        
        <div className="canvas-area">
          <CanvasGrid
            ref={canvasRef}
            selectedColor={selectedColor}
            tool={tool}
            gridData={gridData}
            onGridChange={setGridData}
            onColorPick={setSelectedColor}
          />
        </div>
      </div>
    </div>
  );
}

export default App;