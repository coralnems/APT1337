import * as BABYLON from 'babylonjs';

export class HeatMapMaterial {
  constructor(name, scene) {
    this.name = name;
    this.scene = scene;
    
    return this.createMaterial();
  }
  
  createMaterial() {
    // Create a custom shader material
    const shaderMaterial = new BABYLON.ShaderMaterial(
      this.name,
      this.scene,
      {
        vertex: "heatmap",
        fragment: "heatmap",
      },
      {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
      }
    );
    
    // Define vertex shader
    BABYLON.Effect.ShadersStore["heatmapVertexShader"] = `
      precision highp float;
      
      // Attributes
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      
      // Uniforms
      uniform mat4 worldViewProjection;
      uniform mat4 world;
      
      // Varying
      varying vec3 vPositionW;
      varying vec3 vNormalW;
      varying vec2 vUV;
      varying float vHeight;
      
      void main() {
        vec4 worldPos = world * vec4(position, 1.0);
        vPositionW = worldPos.xyz;
        vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
        vUV = uv;
        vHeight = position.y; // Pass the height to fragment shader
        
        gl_Position = worldViewProjection * vec4(position, 1.0);
      }
    `;
    
    // Define fragment shader for heatmap coloring
    BABYLON.Effect.ShadersStore["heatmapFragmentShader"] = `
      precision highp float;
      
      // Varying
      varying vec3 vPositionW;
      varying vec3 vNormalW;
      varying vec2 vUV;
      varying float vHeight;
      
      void main() {
        // Normalized height for color mapping (assuming height is between 0 and 10)
        float normalizedHeight = clamp(vHeight / 10.0, 0.0, 1.0);
        
        // Create a heatmap color gradient
        vec3 color;
        
        if (normalizedHeight < 0.2) {
          // Blue to cyan gradient for low height
          float t = normalizedHeight / 0.2;
          color = mix(vec3(0.0, 0.0, 0.8), vec3(0.0, 0.8, 0.8), t);
        } else if (normalizedHeight < 0.5) {
          // Cyan to green gradient
          float t = (normalizedHeight - 0.2) / 0.3;
          color = mix(vec3(0.0, 0.8, 0.8), vec3(0.0, 0.8, 0.0), t);
        } else if (normalizedHeight < 0.8) {
          // Green to yellow gradient
          float t = (normalizedHeight - 0.5) / 0.3;
          color = mix(vec3(0.0, 0.8, 0.0), vec3(1.0, 1.0, 0.0), t);
        } else {
          // Yellow to red gradient for high height
          float t = (normalizedHeight - 0.8) / 0.2;
          color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), t);
        }
        
        // Add some lighting based on normal
        float lightIntensity = max(0.3, dot(vNormalW, vec3(0.0, 1.0, 0.0))) * 0.8;
        color *= lightIntensity;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    // Additional heatmap parameters
    shaderMaterial.setFloat("minHeight", 0);
    shaderMaterial.setFloat("maxHeight", 10);
    
    return shaderMaterial;
  }
}
