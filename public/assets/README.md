# Heightmap Assets Directory

This directory contains heightmap images used for terrain generation in the 3D visualization platform.

## Available Heightmaps

- `heightmap1.png`: Basic terrain heightmap
- `heightmap2.png`: Alternative terrain pattern
- `mountainous.png`: Mountainous terrain with peaks and valleys
- `island.png`: Island surrounded by water
- `crater.png`: Terrain with a central crater formation

## Adding New Heightmaps

To add new heightmaps:

1. Add your PNG grayscale heightmap file to this directory
2. Update the `availableHeightmaps` array in `/src/components/3DModels/ThreeDModels.js` to include your new file

## Heightmap Format

- File format: PNG (preferred) or JPG
- Color mode: Grayscale
- Resolution: 256x256 pixels recommended (higher resolutions will work but may affect performance)
- Bit depth: 8-bit
- Height mapping: Black (0,0,0) represents the lowest elevation, White (255,255,255) represents the highest elevation

## Using Procedural Generation

If you select "Procedural (Generated)" from the heightmap dropdown, the application will use the built-in TerrainGenerator to create a procedurally generated terrain instead of loading an image file.
