# Heightmap Generator

This script generates various heightmap images for use in the 3D terrain visualizer.

## Prerequisites

To use this generator, you need to have Node.js installed, along with the `canvas` library.

## Installation

1. Make sure Node.js is installed on your system
2. Install the required dependencies:

```bash
npm install canvas
```

## Running the Generator

Run the script with the following command from the project root directory:

```bash
npm run generate-heightmaps
```

Or directly:

```bash
node scripts/generateHeightmaps.js
```

## Generated Heightmaps

The script will generate the following heightmap PNG files in the `/public/assets/` directory:

- `heightmap1.png` - Rolling hills terrain
- `heightmap2.png` - Terraced landscape
- `mountainous.png` - Mountainous terrain with peaks
- `island.png` - Island formation with water surroundings
- `crater.png` - Terrain with crater formations
- `spikes.png` - Terrain with sharp spikes
- `canyons.png` - Canyon formations with ridges

## Customization

You can modify the `generateHeightmaps.js` file to create your own custom heightmap patterns:

1. Add a new generation function similar to the existing ones
2. Call your new function from the `generateAll()` function
3. Update the `availableHeightmaps` array in the `ThreeDModels.js` file to include your new heightmap

## Parameters

- `WIDTH` and `HEIGHT` determine the resolution of the heightmaps (default: 256x256)
- Adjust the noise parameters in each generation function to get different terrain characteristics
