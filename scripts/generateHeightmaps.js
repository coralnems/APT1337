const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configuration
const WIDTH = 256;
const HEIGHT = 256;
const OUTPUT_DIR = path.join(__dirname, '../public/assets');

// Make sure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Utility functions
function normalizeHeight(value) {
  return Math.max(0, Math.min(255, Math.floor(value * 255)));
}

// Gradient initialization
function initializeGradients() {
  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];
  
  const perm = new Array(512);
  const gradP = new Array(512);
  
  const p = [151,160,137,91,90,15,131,158,143,130,158,136,101,41,62,219,154,
    102,181,126,9,77,114,155,28,191,133,50,219,143,188,112,100,130,41,40,34,
    95,144,80,227,123,43,209,151,187,147,49,24,50,96,188,5,101,152,147,40,
    174,189,18,143,54,55,130,63,102,143,171,15,176,108,94,2,226,171,51,24,83,
    55,149,151,114,27,69,128,218,228,92,56,149,196,56,36,178,60,195,199,165,
    42,37,139,71,110,157,52,135,106,160,51,39,115,220,147,184,76,64,124,20,
    163,190,237,130,25,114,9,40,79,85,62,44,101,120,149,160,90,65,56,69,90,
    100,39,94,199,5,223,145,234,212,196,80,151,119,48,188,87,158,88,21,72,77,
    195,37,174,56,117,138,37,46,129,214,75,70,151,42,134,139,109,41,88,9,21,
    57,89,70,72,12,204,188,180,179,36,32,124,61,199,127,172,117,76,138,112,
    27,108,72,62,212,29,107,233,149,122,14,225,95,89,183,72,178,1,124,214,
    223,136,45,61,76,213,211,148,99,192,31,142,125,233,195,158,42,65,146,18,
    171,232,92,169,252,118,154,116,231,95,197,90,237,38,167,137,163,187,132,
    55,10,123,14,91,139,193,133,59,209,14,195,27,127,238,50,243,73,116,149,
    151,125,136,232,2,131,123,112,114,245,196,48];
  
  let seed = Math.floor(Math.random() * 256);
  
  const pArray = [];
  for (let i = 0; i < 256; i++) {
    pArray[i] = p[i % p.length];
  }
  
  for (let i = 0; i < 256; i++) {
    perm[i] = pArray[i];
    gradP[i] = grad3[perm[i] % 12];
  }
  
  for (let i = 0; i < 256; i++) {
    perm[i + 256] = perm[i];
    gradP[i + 256] = gradP[i];
  }
  
  return { perm, gradP };
}

function getGradient(gradP, hash) {
  return gradP[hash & 511];
}

function dot(g, x, y, z) {
  if (!g) {
    console.error("Gradient is undefined");
    return 0;
  }
  return g[0] * x + g[1] * y + g[2] * z;
}

// Perlin-like noise (simplified)
function improvedNoise(x, y, z, gradP, perm) {
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t, a, b) { return a + t * (b - a); }
  
  let X = Math.floor(x) & 255;
  let Y = Math.floor(y) & 255;
  let Z = Math.floor(z) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  const A = (perm[X & 255] + Y) & 255;
  const AA = (perm[A] + Z) & 255;
  const AB = (perm[(A + 1) & 255] + Z) & 255;
  const B = (perm[(X + 1) & 255] + Y) & 255;
  const BA = (perm[B] + Z) & 255;
  const BB = (perm[(B + 1) & 255] + Z) & 255;

  const g1 = gradP[AA];
  const g2 = gradP[BA];
  const g3 = gradP[AB];
  const g4 = gradP[BB];
  const g5 = gradP[(AA + 1) & 255];
  const g6 = gradP[(BA + 1) & 255];
  const g7 = gradP[(AB + 1) & 255];
  const g8 = gradP[(BB + 1) & 255];

  const result = lerp(w, 
    lerp(v, 
      lerp(u, dot(g1, x, y, z), dot(g2, x - 1, y, z)), 
      lerp(u, dot(g3, x, y - 1, z), dot(g4, x - 1, y - 1, z))
    ),
    lerp(v, 
      lerp(u, dot(g5, x, y, z - 1), dot(g6, x - 1, y, z - 1)),
      lerp(u, dot(g7, x, y - 1, z - 1), dot(g8, x - 1, y - 1, z - 1))
    )
  );
  
  return (result + 1) * 0.5;
}

// Multi-octave noise for more natural looking terrain
function fractalNoise(x, y, octaves = 6, persistence = 0.5, lacunarity = 2.0, gradP, perm) {
  let total = 0;
  let frequency = 1.0;
  let amplitude = 1.0;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    total += improvedNoise(x * frequency, y * frequency, i, gradP, perm) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return total / maxValue;
}

// Generate heightmap functions
function generateHeightmap(filename, generateFunc) {
  console.log(`Generating ${filename}...`);
  
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  
  const { gradP, perm } = initializeGradients();
  
  if (!gradP || !perm) {
    console.error("Failed to initialize gradients or permutations");
    return;
  }
  
  if (!gradP[0] || !gradP[100] || !gradP[255]) {
    console.error("Gradient array contains undefined elements");
    return;
  }
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const height = generateFunc(x, y, gradP, perm);
      const index = (y * WIDTH + x) * 4;
      
      const value = normalizeHeight(height);
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  
  console.log(`Saved ${filePath}`);
}

// Different heightmap generation functions
function generateBasicHeightmap() {
  generateHeightmap('heightmap1.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH - 0.5;
    const ny = y / HEIGHT - 0.5;
    
    const elevation = 
      (Math.sin(nx * 10) * Math.cos(ny * 10) * 0.2) + 
      (Math.sin(nx * 5) * Math.cos(ny * 5) * 0.3) + 
      fractalNoise(nx * 3, ny * 3, 4, 0.5, 2.0, gradP, perm) * 0.5;
      
    return elevation * 0.8 + 0.2;
  });
}

function generateAlternativeHeightmap() {
  generateHeightmap('heightmap2.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    
    const base = fractalNoise(nx * 2, ny * 2, 5, 0.5, 2.0, gradP, perm);
    const terraced = Math.floor(base * 10) / 10 * 0.7 + base * 0.3;
    
    return terraced;
  });
}

function generateMountainousHeightmap() {
  generateHeightmap('mountainous.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    const distance = Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5));
    
    const centerFactor = Math.max(0, 1 - distance * 2);
    const ridges = Math.abs(Math.sin(nx * 15 + ny * 10) * Math.sin(ny * 10 - nx * 5) * 2);
    
    const mountains = 
      ridges * 0.4 + 
      fractalNoise(nx * 4, ny * 4, 6, 0.5, 2.2, gradP, perm) * 0.6;
      
    return mountains * centerFactor * 0.85 + 0.15;
  });
}

function generateIslandHeightmap() {
  generateHeightmap('island.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    const distance = Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5));
    
    const islandShape = Math.max(0, 1 - distance * 2.2);
    const terrain = fractalNoise(nx * 5, ny * 5, 6, 0.6, 2.0, gradP, perm);
    const island = Math.pow(islandShape, 1.5) * terrain;
    
    return island * 0.9 + 0.1;
  });
}

function generateCraterHeightmap() {
  generateHeightmap('crater.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    const distance = Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5));
    
    const craterRim = Math.sin(distance * Math.PI * 2);
    const crater = distance < 0.4 
      ? craterRim * (distance * 7)
      : Math.min(1, craterRim * 0.3 + 0.7);
    
    const details = fractalNoise(nx * 6, ny * 6, 5, 0.5, 2.0, gradP, perm) * 0.3;
    const smallCraters = Math.max(0, 1 - 2 * Math.abs(Math.sin(nx * 20) * Math.cos(ny * 20)));
    
    const value = crater * 0.7 + details - smallCraters * 0.1;
    
    return Math.max(0, Math.min(1, value));
  });
}

function generateSpikesHeightmap() {
  generateHeightmap('spikes.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    
    const spikes = 
      Math.abs(Math.sin(nx * 30) * Math.sin(ny * 30) * 
      Math.sin(nx * 12 + ny * 15) * Math.sin(nx * 5 - ny * 8)) * 0.8;
    
    const base = fractalNoise(nx * 3, ny * 3, 4, 0.5, 2.0, gradP, perm) * 0.3;
    
    return spikes + base;
  });
}

function generateCanyonHeightmap() {
  generateHeightmap('canyons.png', (x, y, gradP, perm) => {
    const nx = x / WIDTH;
    const ny = y / HEIGHT;
    
    const ridges = 1 - Math.abs(fractalNoise(nx * 4, ny * 4, 5, 0.5, 2.0, gradP, perm) - 0.5) * 2;
    const canyons = Math.pow(ridges, 0.3);
    const base = fractalNoise(nx * 2, ny * 2, 4, 0.5, 2.0, gradP, perm) * 0.3 + 0.2;
    
    return base + canyons * 0.5;
  });
}

// Generate all heightmaps
function generateAll() {
  generateBasicHeightmap();
  generateAlternativeHeightmap();
  generateMountainousHeightmap();
  generateIslandHeightmap();
  generateCraterHeightmap();
  generateSpikesHeightmap();
  generateCanyonHeightmap();
  
  console.log('All heightmaps generated successfully!');
}

// Run the generator
generateAll();
