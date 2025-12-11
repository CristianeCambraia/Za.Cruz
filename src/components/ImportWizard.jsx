import React, { useState } from 'react';

export default function ImportWizard({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [settings, setSettings] = useState({
    width: 100,
    height: 100,
    colors: 12,
    preserveDetails: true,
    enhanceContrast: false,
    removeBackground: false
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStep(2);
    }
  };

  const handleImport = () => {
    onImport(selectedFile, settings);
    onClose();
    setStep(1);
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>Assistente de Importação - Passo {step}/3</h2>
        
        {step === 1 && (
          <div>
            <h3>Selecionar Imagem</h3>
            <p>Escolha a imagem que deseja converter em ponto cruz:</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ width: '100%', padding: '10px', margin: '10px 0' }}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Configurações de Conversão</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Largura: {settings.width} pontos</label>
              <input
                type="range"
                min="50"
                max="200"
                value={settings.width}
                onChange={(e) => setSettings({...settings, width: Number(e.target.value)})}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Altura: {settings.height} pontos</label>
              <input
                type="range"
                min="50"
                max="200"
                value={settings.height}
                onChange={(e) => setSettings({...settings, height: Number(e.target.value)})}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Número de cores: {settings.colors}</label>
              <input
                type="range"
                min="6"
                max="20"
                value={settings.colors}
                onChange={(e) => setSettings({...settings, colors: Number(e.target.value)})}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.preserveDetails}
                  onChange={(e) => setSettings({...settings, preserveDetails: e.target.checked})}
                />
                Preservar detalhes finos
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.enhanceContrast}
                  onChange={(e) => setSettings({...settings, enhanceContrast: e.target.checked})}
                />
                Realçar contraste
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.removeBackground}
                  onChange={(e) => setSettings({...settings, removeBackground: e.target.checked})}
                />
                Remover fundo branco
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)}>Voltar</button>
              <button onClick={() => setStep(3)}>Avançar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Confirmar Importação</h3>
            <p><strong>Arquivo:</strong> {selectedFile?.name}</p>
            <p><strong>Tamanho:</strong> {settings.width} x {settings.height} pontos</p>
            <p><strong>Cores:</strong> {settings.colors} cores DMC</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(2)}>Voltar</button>
              <button onClick={handleImport} style={{ background: '#007acc', color: 'white' }}>
                Importar Imagem
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}