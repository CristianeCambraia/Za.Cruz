import React, { useState } from 'react';

const fontPatterns = {
  'A': ['■■■', '■□■', '■■■', '■□■', '■□■'],
  'B': ['■■□', '■□■', '■■□', '■□■', '■■□'],
  'C': ['■■■', '■□□', '■□□', '■□□', '■■■'],
  'D': ['■■□', '■□■', '■□■', '■□■', '■■□'],
  'E': ['■■■', '■□□', '■■□', '■□□', '■■■'],
  'F': ['■■■', '■□□', '■■□', '■□□', '■□□'],
  'G': ['■■■', '■□□', '■□■', '■□■', '■■■'],
  'H': ['■□■', '■□■', '■■■', '■□■', '■□■'],
  'I': ['■■■', '□■□', '□■□', '□■□', '■■■'],
  'J': ['■■■', '□□■', '□□■', '■□■', '■■■'],
  'K': ['■□■', '■■□', '■□□', '■■□', '■□■'],
  'L': ['■□□', '■□□', '■□□', '■□□', '■■■'],
  'M': ['■□■', '■■■', '■■■', '■□■', '■□■'],
  'N': ['■□■', '■■■', '■■■', '■□■', '■□■'],
  'O': ['■■■', '■□■', '■□■', '■□■', '■■■'],
  'P': ['■■■', '■□■', '■■■', '■□□', '■□□'],
  'Q': ['■■■', '■□■', '■□■', '■■■', '□□■'],
  'R': ['■■■', '■□■', '■■□', '■■□', '■□■'],
  'S': ['■■■', '■□□', '■■■', '□□■', '■■■'],
  'T': ['■■■', '□■□', '□■□', '□■□', '□■□'],
  'U': ['■□■', '■□■', '■□■', '■□■', '■■■'],
  'V': ['■□■', '■□■', '■□■', '■□■', '□■□'],
  'W': ['■□■', '■□■', '■■■', '■■■', '■□■'],
  'X': ['■□■', '□■□', '□■□', '□■□', '■□■'],
  'Y': ['■□■', '■□■', '□■□', '□■□', '□■□'],
  'Z': ['■■■', '□□■', '□■□', '■□□', '■■■'],
  ' ': ['□□□', '□□□', '□□□', '□□□', '□□□']
};

export default function TextTool({ onAddText }) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState('normal');
  const [textColor, setTextColor] = useState('#000000');

  const generateTextPattern = () => {
    if (!text.trim()) return;

    const lines = ['', '', '', '', ''];
    const chars = text.toUpperCase().split('');

    chars.forEach((char, charIndex) => {
      const pattern = fontPatterns[char] || fontPatterns[' '];
      
      pattern.forEach((line, lineIndex) => {
        if (charIndex > 0) {
          lines[lineIndex] += '□'; // Espaço entre letras
        }
        lines[lineIndex] += line;
      });
    });

    const textPattern = {
      type: 'text',
      content: text,
      pattern: lines,
      color: textColor,
      fontSize
    };

    onAddText(textPattern);
    setText('');
  };

  const previewText = () => {
    if (!text.trim()) return null;

    const lines = ['', '', '', '', ''];
    const chars = text.toUpperCase().split('');

    chars.forEach((char, charIndex) => {
      const pattern = fontPatterns[char] || fontPatterns[' '];
      
      pattern.forEach((line, lineIndex) => {
        if (charIndex > 0) {
          lines[lineIndex] += '□';
        }
        lines[lineIndex] += line;
      });
    });

    return lines;
  };

  const preview = previewText();

  return (
    <div className="text-tool">
      <h3>Adicionar Texto</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Digite o texto..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Tamanho:</label>
        <select 
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="small">Pequeno</option>
          <option value="normal">Normal</option>
          <option value="large">Grande</option>
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Cor:</label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          style={{ width: '100%', height: '30px' }}
        />
      </div>

      {preview && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '10px', 
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '10px', marginBottom: '5px' }}>Preview:</div>
          {preview.map((line, index) => (
            <div 
              key={index}
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '8px',
                lineHeight: '1',
                color: textColor
              }}
            >
              {line.replace(/■/g, '●').replace(/□/g, '·')}
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={generateTextPattern}
        disabled={!text.trim()}
        style={{
          width: '100%',
          padding: '10px',
          background: text.trim() ? '#007acc' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: text.trim() ? 'pointer' : 'not-allowed'
        }}
      >
        Adicionar Texto
      </button>
    </div>
  );
}