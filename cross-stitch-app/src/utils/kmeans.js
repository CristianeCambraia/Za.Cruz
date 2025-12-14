// Algoritmo K-means para redução de cores
export function kMeans(pixels, k = 8, maxIterations = 20) {
  if (pixels.length === 0) return [];
  
  // Inicializar centroides aleatoriamente
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push([...randomPixel]);
  }
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Atribuir pixels aos centroides mais próximos
    const clusters = Array(k).fill().map(() => []);
    
    pixels.forEach(pixel => {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(pixel, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      
      clusters[closestCentroid].push(pixel);
    });
    
    // Atualizar centroides
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]; // Evitar divisão por zero
      
      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0]);
      
      return [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length)
      ];
    });
    
    // Verificar convergência
    const converged = centroids.every((centroid, index) => 
      euclideanDistance(centroid, newCentroids[index]) < 1
    );
    
    centroids = newCentroids;
    
    if (converged) break;
  }
  
  return centroids.filter(centroid => centroid.every(c => !isNaN(c)));
}

function euclideanDistance(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

export function quantizeImage(imageData, colors) {
  const quantized = new Uint8ClampedArray(imageData.data.length);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const pixel = [
      imageData.data[i],     // R
      imageData.data[i + 1], // G
      imageData.data[i + 2]  // B
    ];
    
    // Encontrar cor mais próxima
    let minDistance = Infinity;
    let closestColor = colors[0];
    
    colors.forEach(color => {
      const distance = euclideanDistance(pixel, color);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    });
    
    quantized[i] = closestColor[0];     // R
    quantized[i + 1] = closestColor[1]; // G
    quantized[i + 2] = closestColor[2]; // B
    quantized[i + 3] = imageData.data[i + 3]; // A
  }
  
  return new ImageData(quantized, imageData.width, imageData.height);
}