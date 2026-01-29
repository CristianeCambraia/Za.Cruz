/**
 * SISTEMA PROFISSIONAL DE CONTORNO PARA PONTO CRUZ
 * Igual aos aplicativos comerciais como PCStitch, Pattern Maker
 */

// Detecção de contorno profissional com múltiplos algoritmos
export function createProfessionalContour(imageData, width, height) {
  console.log('🎯 Iniciando contorno profissional...');
  
  // 1. Detectar bordas externas (silhueta)
  const externalEdges = detectExternalEdges(imageData, width, height);
  
  // 2. Detectar bordas internas importantes (olhos, nariz, detalhes)
  const internalEdges = detectInternalFeatures(imageData, width, height);
  
  // 3. Combinar bordas com prioridade
  const combinedEdges = combineEdges(externalEdges, internalEdges, width, height);
  
  // 4. Refinar contorno (remover ruído, conectar linhas)
  const refinedEdges = refineContour(combinedEdges, width, height);
  
  console.log(`✅ Contorno profissional criado: ${Object.keys(refinedEdges).length} pixels`);
  
  return refinedEdges;
}

// Detectar bordas externas (silhueta principal)
function detectExternalEdges(imageData, width, height) {
  const edges = {};
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = imageData.data[idx + 3];
      
      // Se é pixel visível
      if (a > 50) {
        // Verificar se faz fronteira com fundo
        const neighbors = [
          [x-1, y], [x+1, y], [x, y-1], [x, y+1]
        ];
        
        let isBorder = false;
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            isBorder = true;
            break;
          }
          
          const nIdx = (ny * width + nx) * 4;
          const nA = imageData.data[nIdx + 3];
          
          if (nA <= 50) {
            isBorder = true;
            break;
          }
        }
        
        if (isBorder) {
          edges[`${x},${y}`] = 'external';
        }
      }
    }
  }
  
  return edges;
}

// Detectar características internas importantes
function detectInternalFeatures(imageData, width, height) {
  const edges = {};
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];
      
      if (a <= 50) continue;
      
      // Calcular gradiente de cor em todas as direções
      const gradients = [];
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const nIdx = (ny * width + nx) * 4;
        
        const nR = imageData.data[nIdx];
        const nG = imageData.data[nIdx + 1];
        const nB = imageData.data[nIdx + 2];
        const nA = imageData.data[nIdx + 3];
        
        if (nA > 50) {
          const colorDiff = Math.abs(r - nR) + Math.abs(g - nG) + Math.abs(b - nB);
          gradients.push(colorDiff);
        }
      }
      
      // Se há mudança significativa de cor (características internas)
      const maxGradient = Math.max(...gradients);
      if (maxGradient > 120) { // Threshold para detalhes importantes
        edges[`${x},${y}`] = 'internal';
      }
    }
  }
  
  return edges;
}

// Combinar bordas externas e internas
function combineEdges(external, internal, width, height) {
  const combined = { ...external };
  
  // Adicionar bordas internas que não conflitam
  Object.keys(internal).forEach(key => {
    if (!combined[key]) {
      combined[key] = internal[key];
    }
  });
  
  return combined;
}

// Refinar contorno (conectar linhas, remover ruído)
function refineContour(edges, width, height) {
  const refined = { ...edges };
  const edgeKeys = Object.keys(edges);
  
  // Conectar pixels isolados
  edgeKeys.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    
    // Verificar se tem vizinhos próximos
    const neighbors = [
      [x-1, y], [x+1, y], [x, y-1], [x, y+1]
    ];
    
    let hasNeighbor = false;
    neighbors.forEach(([nx, ny]) => {
      const neighborKey = `${nx},${ny}`;
      if (edges[neighborKey]) {
        hasNeighbor = true;
      }
    });
    
    // Se está isolado, verificar se deve ser removido
    if (!hasNeighbor) {
      // Manter apenas se é borda externa importante
      if (edges[key] !== 'external') {
        delete refined[key];
      }
    }
  });
  
  return refined;
}

// Aplicar nitidez profissional à imagem
export function applyProfessionalSharpening(imageData, width, height) {
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  // Kernel de nitidez profissional (mais agressivo)
  const kernel = [
    [-1, -1, -1],
    [-1,  9, -1],
    [-1, -1, -1]
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[ky + 1][kx + 1];
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        output[idx] = Math.max(0, Math.min(255, sum));
      }
      
      // Manter alpha
      const alphaIdx = (y * width + x) * 4 + 3;
      output[alphaIdx] = data[alphaIdx];
    }
  }
  
  // Copiar bordas
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);
    
    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
      output[i] = data[i];
      output[i + 1] = data[i + 1];
      output[i + 2] = data[i + 2];
      output[i + 3] = data[i + 3];
    }
  }
  
  return new ImageData(output, width, height);
}