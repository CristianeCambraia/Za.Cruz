import React from 'react';
import { exportToPDF, exportToPNG } from '../utils/exportPDF.js';

export default function ExportMenu({ gridData, canvasRef }) {
  const handleExportPNG = () => {
    const result = exportToPNG(canvasRef);
    if (result) {
      result.link.click();
    }
  };

  const handleExportPDF = () => {
    const pdf = exportToPDF(gridData);
    pdf.save('cross-stitch-pattern.pdf');
  };

  const handleSaveProject = () => {
    const projectData = {
      gridData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'cross-stitch-project.json';
    link.click();
  };

  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target.result);
            if (projectData.gridData) {
              // Aqui você precisaria de uma função para carregar os dados
              // que seria passada como prop do componente pai
              console.log('Projeto carregado:', projectData);
            }
          } catch (error) {
            alert('Erro ao carregar projeto: arquivo inválido');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('crossStitchProject', JSON.stringify(gridData));
      alert('Projeto salvo no navegador!');
    } catch (error) {
      alert('Erro ao salvar no navegador');
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('crossStitchProject');
      if (saved) {
        const data = JSON.parse(saved);
        // Aqui você precisaria de uma função para carregar os dados
        console.log('Dados carregados do navegador:', data);
        alert('Projeto carregado do navegador!');
      } else {
        alert('Nenhum projeto salvo encontrado');
      }
    } catch (error) {
      alert('Erro ao carregar do navegador');
    }
  };

  const getColorList = () => {
    const colors = new Set(Object.values(gridData));
    return Array.from(colors);
  };

  return (
    <div className="export-section">
      <h3>Exportar</h3>
      
      <button onClick={handleExportPNG}>
        📷 Exportar PNG
      </button>
      
      <button onClick={handleExportPDF}>
        📄 Exportar PDF
      </button>
      
      <h3>Projeto</h3>
      
      <button onClick={handleSaveProject}>
        💾 Salvar Projeto
      </button>
      
      <button onClick={handleLoadProject}>
        📁 Carregar Projeto
      </button>
      
      <h3>Navegador</h3>
      
      <button onClick={saveToLocalStorage}>
        🔄 Salvar Local
      </button>
      
      <button onClick={loadFromLocalStorage}>
        🔄 Carregar Local
      </button>
      
      <div style={{ marginTop: '15px', fontSize: '12px' }}>
        <strong>Estatísticas:</strong><br/>
        Pixels pintados: {Object.keys(gridData).length}<br/>
        Cores usadas: {getColorList().length}
      </div>
    </div>
  );
}