import React, { useRef } from 'react';

export default function SimpleImageConverter({ onGridGenerated }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Usar exatamente o tamanho da imagem
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Desenhar imagem original sem alterações
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const grid = {};
      
      // Cada pixel vira um quadradinho
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];
          
          if (a > 0) {
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            grid[`${x},${y}`] = hex;
          }
        }
      }
      
      onGridGenerated(grid);
    };
    
    img.src = URL.createObjectURL(file);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Quadricular Imagem</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ 
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #007acc',
          borderRadius: '4px'
        }}
      />
      <p>Selecione uma imagem para quadricular</p>
    </div>
  );
}