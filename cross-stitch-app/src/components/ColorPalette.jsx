import React from 'react';
import { getColorArray } from '../utils/dmcColors.js';

export default function ColorPalette({ selectedColor, onColorSelect }) {
  const colors = getColorArray();

  return (
    <div className="color-palette">
      <h3>Paleta DMC</h3>
      <div className="color-grid">
        {colors.map(color => (
          <div
            key={color.name}
            className={`color-swatch ${selectedColor === color.hex ? 'selected' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onColorSelect(color.hex)}
            title={`${color.name} - ${color.symbol}`}
          />
        ))}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <strong>Cor selecionada:</strong><br/>
        {colors.find(c => c.hex === selectedColor)?.name || 'Nenhuma'}
      </div>
    </div>
  );
}