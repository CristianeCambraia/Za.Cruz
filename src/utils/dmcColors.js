// Paleta de cores DMC mais comuns
export const dmcColors = {
  'White': '#FFFFFF',
  'Ecru': '#F0E68C',
  'Light Yellow': '#FFFF99',
  'Yellow': '#FFFF00',
  'Light Orange': '#FFB347',
  'Orange': '#FFA500',
  'Light Coral': '#F08080',
  'Coral': '#FF7F50',
  'Pink': '#FFC0CB',
  'Light Pink': '#FFB6C1',
  'Red': '#FF0000',
  'Dark Red': '#8B0000',
  'Light Blue': '#ADD8E6',
  'Blue': '#0000FF',
  'Dark Blue': '#00008B',
  'Navy': '#000080',
  'Light Green': '#90EE90',
  'Green': '#008000',
  'Dark Green': '#006400',
  'Purple': '#800080',
  'Light Purple': '#DDA0DD',
  'Brown': '#A52A2A',
  'Light Brown': '#D2B48C',
  'Gray': '#808080',
  'Light Gray': '#D3D3D3',
  'Dark Gray': '#A9A9A9',
  'Black': '#000000'
};

export const dmcSymbols = {
  'White': '□',
  'Ecru': '○',
  'Light Yellow': '△',
  'Yellow': '▲',
  'Light Orange': '◇',
  'Orange': '◆',
  'Light Coral': '☆',
  'Coral': '★',
  'Pink': '♡',
  'Light Pink': '♥',
  'Red': '●',
  'Dark Red': '■',
  'Light Blue': '◯',
  'Blue': '▼',
  'Dark Blue': '▽',
  'Navy': '◀',
  'Light Green': '▶',
  'Green': '◈',
  'Dark Green': '◉',
  'Purple': '♦',
  'Light Purple': '♢',
  'Brown': '▣',
  'Light Brown': '▤',
  'Gray': '▥',
  'Light Gray': '▦',
  'Dark Gray': '▧',
  'Black': '█'
};

export function getColorArray() {
  return Object.entries(dmcColors).map(([name, hex]) => ({
    name,
    hex,
    symbol: dmcSymbols[name]
  }));
}