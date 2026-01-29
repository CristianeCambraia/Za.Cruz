import React, { useState, useRef } from 'react';
import CanvasGrid from './components/CanvasGrid.jsx';
import ColorPalette from './components/ColorPalette.jsx';
import ExportMenu from './components/ExportMenu.jsx';
import './styles.css';

function App() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [gridData, setGridData] = useState({});
  const [imageWidth, setImageWidth] = useState(80);
  const [imageHeight, setImageHeight] = useState(80);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Usar tamanhos definidos pelo usuário
      const scaleX = imageWidth / img.width;
      const scaleY = imageHeight / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newGrid = {};
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];
          
          if (a > 50) {
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            newGrid[`${x},${y + 25}`] = hex;
          }
        }
      }
      
      setGridData(newGrid);
    };
    
    img.src = URL.createObjectURL(file);
  };

  const handleClear = () => {
    setGridData({});
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

  return (
    <div className="app-container">
      <div className="toolbar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
        
        <button onClick={handleExport}>
          💾 Exportar PNG
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