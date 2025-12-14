import React from 'react';

export default function Toolbar({ tool, setTool, onClear, onSave, onLoad }) {
  const tools = [
    { id: 'pencil', name: 'Lápis', icon: '✏️' },
    { id: 'eraser', name: 'Borracha', icon: '🧽' },
    { id: 'eyedropper', name: 'Conta-gotas', icon: '💧' },
    { id: 'bucket', name: 'Balde', icon: '🪣' }
  ];

  return (
    <div className="toolbar">
      <div style={{ display: 'flex', gap: '10px' }}>
        {tools.map(t => (
          <button
            key={t.id}
            className={tool === t.id ? 'active' : ''}
            onClick={() => setTool(t.id)}
            title={t.name}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
        <button onClick={onClear}>🗑️ Limpar</button>
        <button onClick={onSave}>💾 Salvar</button>
        <button onClick={onLoad}>📁 Carregar</button>
      </div>
    </div>
  );
}