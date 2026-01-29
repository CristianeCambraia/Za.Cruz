# Cross Stitch Designer

Um editor de gráficos de ponto cruz 100% client-side, desenvolvido em React + Vite.

## 🎯 Funcionalidades

### ✅ Editor de Grade
- **Lápis**: Desenhar pixels individuais
- **Borracha**: Apagar pixels
- **Conta-gotas**: Capturar cor de um pixel
- **Balde**: Preenchimento por área
- **Grade visual**: Linhas destacadas a cada 10 células
- **Paleta DMC**: Cores oficiais de linha de bordado

### ✅ Conversor de Imagens
- Upload de imagens (JPG, PNG, etc.)
- Redimensionamento automático
- Redução de cores com algoritmo K-means
- Mapeamento automático para paleta DMC
- Conversão direta para grade editável

### ✅ Exportação
- **PNG**: Imagem da grade atual
- **PDF**: Gráfico com símbolos e legenda
- **Projeto**: Arquivo JSON para backup

### ✅ Armazenamento
- **LocalStorage**: Salvar no navegador
- **Download/Upload**: Arquivos de projeto
- **Sem backend**: Tudo funciona offline

## 🚀 Como usar

### Instalação
```bash
npm install
npm run dev
```

### Build para produção
```bash
npm run build
```

### Deploy na Vercel
1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente que é um projeto Vite
3. Deploy automático a cada push

## 🏗️ Arquitetura

### 100% Client-Side
- **React 18** + **Vite** para interface
- **Canvas API** para manipulação de pixels
- **K-means** para redução de cores
- **jsPDF** para exportação PDF
- **LocalStorage** para persistência

### Estrutura de Pastas
```
src/
├── components/          # Componentes React
│   ├── CanvasGrid.jsx   # Grade principal editável
│   ├── Toolbar.jsx      # Barra de ferramentas
│   ├── ColorPalette.jsx # Paleta de cores DMC
│   ├── ImageConverter.jsx # Conversor de imagens
│   └── ExportMenu.jsx   # Menu de exportação
├── utils/               # Utilitários
│   ├── dmcColors.js     # Paleta DMC + símbolos
│   ├── kmeans.js        # Algoritmo de clustering
│   ├── mapToDMC.js      # Mapeamento de cores
│   └── exportPDF.js     # Exportação PDF/PNG
├── hooks/               # Hooks personalizados
│   └── useCanvasTools.js # Lógica das ferramentas
└── App.jsx              # Componente principal
```

## 🎨 Como funciona

### 1. Desenho Manual
- Selecione uma cor da paleta DMC
- Escolha a ferramenta (lápis, borracha, etc.)
- Clique na grade para desenhar

### 2. Conversão de Imagem
- Faça upload de uma imagem
- Ajuste o tamanho da grade (20-100 pixels)
- Defina o número de cores (4-16)
- O algoritmo K-means reduz as cores
- As cores são mapeadas para a paleta DMC
- A grade é gerada automaticamente

### 3. Exportação
- **PNG**: Salva a imagem atual da grade
- **PDF**: Gera gráfico com símbolos e legenda de cores
- **Projeto**: Salva arquivo JSON com todos os dados

## 🔧 Tecnologias

- **React 18**: Interface de usuário
- **Vite**: Build tool rápido
- **Canvas API**: Manipulação de pixels
- **jsPDF**: Geração de PDF
- **K-means**: Clustering de cores
- **CSS Grid**: Layout responsivo

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Desktop e mobile
- ✅ Funciona offline
- ✅ Sem necessidade de servidor

## 🎯 Vantagens

### Para o usuário:
- **Rápido**: Processamento local
- **Offline**: Funciona sem internet
- **Gratuito**: Sem custos de servidor
- **Privado**: Imagens não saem do seu computador

### Para o desenvolvedor:
- **Simples**: Apenas frontend
- **Barato**: Hospedagem gratuita na Vercel
- **Escalável**: Sem limites de servidor
- **Manutenível**: Código organizado e modular

## 🚀 Deploy

O projeto está configurado para deploy automático na Vercel:

1. **Push para GitHub**: Código atualizado
2. **Build automático**: Vite gera arquivos estáticos
3. **Deploy instantâneo**: Site disponível globalmente
4. **CDN global**: Carregamento rápido mundial

Perfeito para um site de ponto cruz profissional e gratuito! 🧵✨