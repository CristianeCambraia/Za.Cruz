import React, { useState } from 'react';

const predefinedPatterns = {
  borders: [
    { name: 'Borda Simples', pattern: '■□■□■□■□' },
    { name: 'Borda Floral', pattern: '❀◦❀◦❀◦❀◦' },
    { name: 'Borda Geométrica', pattern: '◆◇◆◇◆◇◆◇' }
  ],
  flowers: [
    { name: 'Rosa Pequena', pattern: '◦❀◦\n❀■❀\n◦❀◦' },
    { name: 'Margarida', pattern: '◦■◦\n■❀■\n◦■◦' },
    { name: 'Tulipa', pattern: '■❀■\n◦■◦\n◦■◦' }
  ],
  animals: [
    { name: 'Borboleta', pattern: '■◦■\n❀■❀\n◦■◦' },
    { name: 'Pássaro', pattern: '◦■◦\n■❀■\n■◦■' },
    { name: 'Gato', pattern: '■◦■\n◦❀◦\n■■■' }
  ],
  letters: [
    { name: 'Alfabeto Simples', pattern: 'ABC' },
    { name: 'Números', pattern: '123' },
    { name: 'Monograma', pattern: 'M' }
  ]
};

export default function PatternLibrary({ onAddPattern }) {
  const [selectedCategory, setSelectedCategory] = useState('borders');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(predefinedPatterns);
  const filteredPatterns = predefinedPatterns[selectedCategory].filter(pattern =>
    pattern.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pattern-library">
      <h3>Biblioteca de Padrões</h3>
      
      <input
        type="text"
        placeholder="Buscar padrões..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <div style={{ marginBottom: '15px' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '5px 10px',
              margin: '2px',
              background: selectedCategory === category ? '#007acc' : '#f0f0f0',
              color: selectedCategory === category ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredPatterns.map((pattern, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => onAddPattern(pattern)}
          >
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              {pattern.name}
            </div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '10px', 
              marginTop: '5px',
              whiteSpace: 'pre-line'
            }}>
              {pattern.pattern}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>Adicionar Novo Padrão</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // Aqui você pode processar a imagem para criar um novo padrão
              console.log('Novo padrão:', file.name);
            }
          }}
          style={{ width: '100%', fontSize: '12px' }}
        />
      </div>
    </div>
  );
}