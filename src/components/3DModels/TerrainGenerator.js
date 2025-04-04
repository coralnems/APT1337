import * as BABYLON from 'babylonjs';

export class TerrainGenerator {
  /**
   * Creates a procedural terrain
   * @param {Scene} scene - The BABYLON scene
   * @param {string} name - Name of the terrain mesh
   * @param {object} options - Options for terrain generation
   * @returns {Mesh} The generated terrain mesh
   */
  static createTerrain(scene, name, options = {}) {
    const {
      width = 100,
      height = 100,
      subdivisions = 100,
      minHeight = 0,
      maxHeight = 10,
      seed = 1
    } = options;

    // Create the ground mesh as a base
    const terrain = BABYLON.MeshBuilder.CreateGround(
      name,
      { width, height, subdivisions },
      scene
    );

    // Get the vertex data to manipulate the terrain heights
    const vertexData = BABYLON.VertexData.CreateGround({
      width,
      height, 
      subdivisions
    });

    // Apply procedural height manipulation
    const positions = vertexData.positions;
    
    // Create a noise generator with a seed for consistent results
    const noise = (x, z) => {
      // Simple deterministic noise function
      const X = Math.floor(x * 10) + seed * 1000;
      const Z = Math.floor(z * 10) + seed * 100;
      const a = X * 12.9898 + Z * 78.233;
      return Math.sin(a) * 43758.5453 % 1;
    };
    
    // Modify each vertex height
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Create complex terrain with multiple noise frequencies
      const normalizedX = x / width;
      const normalizedZ = z / height;
      
      // Multi-octave noise for natural looking terrain
      let heightValue = 0;
      heightValue += (Math.sin(normalizedX * 3) + Math.sin(normalizedZ * 3)) * 2; // Large hills
      heightValue += noise(normalizedX * 2, normalizedZ * 2) * 3; // Medium details 
      heightValue += noise(normalizedX * 8, normalizedZ * 8) * 1; // Small details
      
      // Add a crater in the center
      const distanceFromCenter = Math.sqrt((normalizedX - 0.5) ** 2 + (normalizedZ - 0.5) ** 2) * 2;
      if (distanceFromCenter < 0.5) {
        heightValue -= (0.5 - distanceFromCenter) * 4 * Math.exp(-distanceFromCenter * 8);
      }
      
      // Map the height to our desired range
      const scaledHeight = minHeight + (heightValue + 4) * ((maxHeight - minHeight) / 8);
      
      positions[i + 1] = Math.max(minHeight, Math.min(maxHeight, scaledHeight));
    }
    
    // Apply the modified vertex data to the mesh
    vertexData.applyToMesh(terrain);
    
    // Compute normals for proper lighting
    BABYLON.VertexData.ComputeNormals(positions, vertexData.indices, vertexData.normals);
    vertexData.applyToMesh(terrain);
    
    return terrain;
  }

  /**
   * Creates a heatmap terrain, generating both mesh and appropriate material
   */
  static createHeatmapTerrain(scene, name, options = {}, heatmapMaterial) {
    const terrain = this.createTerrain(scene, name, options);
    
    // If a heatmap material is provided, use it
    if (heatmapMaterial) {
      terrain.material = heatmapMaterial;
    }
    
    return terrain;
  }
}
