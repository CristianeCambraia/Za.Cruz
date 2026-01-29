import React, { useState, useRef } from 'react';
import { getColorArray } from '../utils/dmcColors.js';

export default function ImageConverter({ onGridGenerated }) {
  const [imageSize, setImageSize] = useState(50);
  const [colorCount, setColorCount] = useState(8);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = async (file) => {
    setIsProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      // Canvas temporário para processar a imagem
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Usar tamanho exato da grade
      tempCanvas.width = imageSize;
      tempCanvas.height = imageSize;
      
      // Desabilitar TODA suavização
      tempCtx.imageSmoothingEnabled = false;
      
      // Preencher fundo branco
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, imageSize, imageSize);
      
      // Calcular escala para caber toda a imagem
      const scale = Math.min(imageSize / img.width, imageSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Centralizar imagem
      const offsetX = (imageSize - scaledWidth) / 2;
      const offsetY = (imageSize - scaledHeight) / 2;
      
      // Desenhar imagem completa
      tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      // Obter dados dos pixels
      const imageData = tempCtx.getImageData(0, 0, imageSize, imageSize);
      const dmcColors = getColorArray();
      
      // Converter cada pixel para DMC
      const grid = {};
      
      for (let y = 0; y < imageSize; y++) {
        for (let x = 0; x < imageSize; x++) {
          const index = (y * imageSize + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          
          // Pular apenas pixels completamente brancos do fundo
          if (!(r === 255 && g === 255 && b === 255)) {
            const closestDMC = findClosestDMC(r, g, b, dmcColors);
            grid[`${x},${y}`] = closestDMC.hex;
          }
        }
      }
      
      onGridGenerated(grid);
      setIsProcessing(false);
    };
    
    img.src = URL.createObjectURL(file);
  };
  
  const findClosestDMC = (r, g, b, dmcColors) => {
    let minDistance = Infinity;
    let closestDMC = dmcColors[0];
    
    for (const dmc of dmcColors) {
      const dmcR = parseInt(dmc.hex.slice(1, 3), 16);
      const dmcG = parseInt(dmc.hex.slice(3, 5), 16);
      const dmcB = parseInt(dmc.hex.slice(5, 7), 16);
      
      const distance = Math.abs(dmcR - r) + Math.abs(dmcG - g) + Math.abs(dmcB - b);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDMC = dmc;
      }
    }
    
    return closestDMC;
  };
  


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  return (
    <div className="image-converter">
      <h3>Converter Imagem</h3>
      
      <div>
        <label>Tamanho da grade: {imageSize}x{imageSize}</label>
        <input
          type="range"
          min="20"
          max="100"
          value={imageSize}
          onChange={(e) => setImageSize(Number(e.target.value))}
        />
      </div>
      
      <div>
        <label>Número de cores: {colorCount}</label>
        <input
          type="range"
          min="4"
          max="16"
          value={colorCount}
          onChange={(e) => setColorCount(Number(e.target.value))}
        />
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isProcessing}
      />
      
      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          Processando imagem...
        </div>
      )}
    </div>
  );
}