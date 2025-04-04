import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-materials';
import 'babylonjs-loaders'; // Keep this import, it will work once installed
import { HeatMapMaterial } from './materials/HeatMapMaterial';
import { TerrainGenerator } from './TerrainGenerator';
import DJIController from '../../services/DJIController';
import './ThreeDModels.css';

const ThreeDModels = () => {
  const [modelType, setModelType] = useState('drone');
  const [terrainType, setTerrainType] = useState('standard');
  const [heightmapFile, setHeightmapFile] = useState('heightmap1.png');
  const [loading, setLoading] = useState(false);
  const [scene, setScene] = useState(null);
  const [djiSDK, setDjiSDK] = useState(null);
  const canvasRef = useRef(null);

  // Available heightmaps - updated with new generated heightmaps
  const availableHeightmaps = [
    { value: 'heightmap1.png', label: 'Rolling Hills' },
    { value: 'heightmap2.png', label: 'Terraced Landscape' },
    { value: 'mountainous.png', label: 'Mountainous Terrain' },
    { value: 'island.png', label: 'Island Formation' },
    { value: 'crater.png', label: 'Crater Landscape' },
    { value: 'spikes.png', label: 'Spiked Terrain' },
    { value: 'canyons.png', label: 'Canyon Formation' },
    { value: 'procedural', label: 'Procedural (Generated)' }
  ];

  // Initialize BabylonJS engine and scene
  useEffect(() => {
    if (!canvasRef.current) return;
    setLoading(true);

    // Create Babylon engine
    const babylonEngine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });

    // Create scene
    const babylonScene = new BABYLON.Scene(babylonEngine);
    babylonScene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);
    setScene(babylonScene);

    // Set up camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 50, new BABYLON.Vector3(0, 0, 0), babylonScene);
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 50;
    camera.minZ = 0.1;

    // Set up lighting
    const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), babylonScene);
    hemisphericLight.intensity = 0.7;

    const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(0.5, -0.5, -1), babylonScene);
    directionalLight.intensity = 0.8;
    directionalLight.position = new BABYLON.Vector3(0, 20, 0);

    // Run the render loop
    babylonEngine.runRenderLoop(() => {
      babylonScene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => babylonEngine.resize());

    setLoading(false);

    return () => {
      babylonEngine.dispose();
      window.removeEventListener('resize', () => babylonEngine.resize());
    };
  }, [canvasRef]);

  // Load models based on selection
  useEffect(() => {
    if (!scene) return;

    // Clear previous models
    scene.meshes.forEach(mesh => {
      if (mesh.name !== "ground" && mesh.name !== "heatmapTerrain" && !mesh.name.includes("camera")) {
        mesh.dispose();
      }
    });

    switch (modelType) {
      case 'drone':
        loadDroneModel(scene);
        break;
      case 'terrain':
        loadTerrainModel(scene, terrainType);
        break;
      case 'building':
        loadBuildingModel(scene);
        break;
      case 'custom':
        // Placeholder for custom model upload
        break;
      default:
        loadDroneModel(scene);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelType, terrainType, heightmapFile, scene]);

  // Try to connect to DJI SDK
  const initializeDJISDK = async () => {
    setLoading(true);
    try {
      const controller = new DJIController();
      await controller.initialize();
      setDjiSDK(controller);
      alert('DJI SDK connected successfully!');
    } catch (error) {
      console.error('Failed to initialize DJI SDK:', error);
      alert('Failed to connect to DJI SDK: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load DJI drone model
  const loadDroneModel = (scene) => {
    const body = BABYLON.MeshBuilder.CreateBox("droneBody", { width: 3, height: 0.5, depth: 2 }, scene);
    const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", scene);
    bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    bodyMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    body.material = bodyMaterial;
    body.position.y = 1;

    const armPositions = [
      new BABYLON.Vector3(1.5, 1, 1),
      new BABYLON.Vector3(-1.5, 1, 1),
      new BABYLON.Vector3(1.5, 1, -1),
      new BABYLON.Vector3(-1.5, 1, -1)
    ];

    armPositions.forEach((pos, index) => {
      const arm = BABYLON.MeshBuilder.CreateCylinder(`arm${index}`, { diameter: 0.3, height: 0.2 }, scene);
      arm.position = pos;
      const armMaterial = new BABYLON.StandardMaterial(`armMaterial${index}`, scene);
      armMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      arm.material = armMaterial;

      const motor = BABYLON.MeshBuilder.CreateCylinder(`motor${index}`, { diameter: 0.5, height: 0.3 }, scene);
      motor.position = new BABYLON.Vector3(pos.x, pos.y + 0.15, pos.z);
      motor.material = armMaterial;

      const propeller = BABYLON.MeshBuilder.CreateBox(`propeller${index}`, { width: 2, height: 0.1, depth: 0.2 }, scene);
      propeller.position = new BABYLON.Vector3(pos.x, pos.y + 0.3, pos.z);
      const propMaterial = new BABYLON.StandardMaterial(`propMaterial${index}`, scene);
      propMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      propeller.material = propMaterial;

      scene.registerBeforeRender(() => {
        propeller.rotation.y += 0.2;
      });
    });

    const gimbal = BABYLON.MeshBuilder.CreateBox("gimbal", { width: 0.8, height: 0.8, depth: 0.8 }, scene);
    gimbal.position = new BABYLON.Vector3(0, 0.5, 1);

    const camera = BABYLON.MeshBuilder.CreateCylinder("camera", { diameter: 0.4, height: 0.6 }, scene);
    camera.position = new BABYLON.Vector3(0, 0.5, 1.2);
    camera.rotation.x = Math.PI / 2;
    const cameraMaterial = new BABYLON.StandardMaterial("cameraMaterial", scene);
    cameraMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    camera.material = cameraMaterial;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.position.y = 0;
  };

  // Load terrain model with option for heatmap
  const loadTerrainModel = (scene, terrainType) => {
    const terrainSize = 100;
    const subdivisions = 100;

    // Remove existing terrain
    const existingTerrain = scene.getMeshByName("terrain");
    if (existingTerrain) existingTerrain.dispose();

    const existingHeatmap = scene.getMeshByName("heatmapTerrain");
    if (existingHeatmap) existingHeatmap.dispose();

    let terrain;

    // Check if we should use a heightmap file or procedural generation
    const useProceduralTerrain = heightmapFile === 'procedural';

    if (terrainType === 'heatmap') {
      // Create heatmap material
      const heatmapMaterial = new HeatMapMaterial("heatmapMaterial", scene);

      if (useProceduralTerrain) {
        // Use procedural generation for the heatmap terrain
        terrain = TerrainGenerator.createHeatmapTerrain(
          scene,
          "heatmapTerrain",
          {
            width: terrainSize,
            height: terrainSize,
            subdivisions: subdivisions,
            minHeight: 0,
            maxHeight: 10,
            seed: Math.floor(Math.random() * 1000)
          },
          heatmapMaterial
        );
        return terrain;
      } else {
        // Use heightmap file for the terrain - don't try to use .then()
        try {
          const terrainMesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            "heatmapTerrain",
            `/assets/${heightmapFile}`, // Path to the heightmap file
            {
              width: terrainSize,
              height: terrainSize,
              subdivisions: subdivisions,
              minHeight: 0,
              maxHeight: 10,
              updatable: true,
              onReady: function(readyMesh) {
                // Apply material once the mesh is ready
                readyMesh.material = heatmapMaterial;
              }
            },
            scene
          );
          return terrainMesh;
        } catch (error) {
          console.error("Error creating terrain from heightmap:", error);
          // Fallback to procedural terrain
          terrain = TerrainGenerator.createHeatmapTerrain(
            scene,
            "heatmapTerrain",
            {
              width: terrainSize,
              height: terrainSize,
              subdivisions: subdivisions,
              minHeight: 0,
              maxHeight: 10,
              seed: Math.floor(Math.random() * 1000)
            },
            heatmapMaterial
          );
          return terrain;
        }
      }
    } else {
      // For non-heatmap terrains
      if (useProceduralTerrain) {
        // Use procedural generation
        terrain = TerrainGenerator.createTerrain(
          scene,
          "terrain",
          {
            width: terrainSize,
            height: terrainSize,
            subdivisions: subdivisions,
            minHeight: 0,
            maxHeight: 10,
            seed: Math.floor(Math.random() * 1000) // Random seed for variety
          }
        );
      } else {
        // Use heightmap file - don't try to use .then()
        try {
          terrain = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            "terrain",
            `/assets/${heightmapFile}`, // Path to the heightmap file
            {
              width: terrainSize,
              height: terrainSize,
              subdivisions: subdivisions,
              minHeight: 0,
              maxHeight: 10,
              updatable: true,
              onReady: function(readyMesh) {
                // Apply appropriate material
                if (terrainType === 'grid') {
                  const gridMaterial = new BABYLON.GridMaterial("gridMaterial", scene);
                  gridMaterial.mainColor = new BABYLON.Color3(0.5, 0.5, 0.5);
                  gridMaterial.lineColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                  gridMaterial.opacity = 0.5;
                  readyMesh.material = gridMaterial;
                } else {
                  // Standard terrain material
                  const terrainMaterial = new BABYLON.StandardMaterial("terrainMaterial", scene);
                  terrainMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.3);
                  terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                  readyMesh.material = terrainMaterial;
                }
              }
            },
            scene
          );
        } catch (error) {
          console.error("Error creating terrain from heightmap:", error);
          // Fallback to procedural terrain
          terrain = TerrainGenerator.createTerrain(
            scene,
            "terrain",
            {
              width: terrainSize,
              height: terrainSize,
              subdivisions: subdivisions,
              minHeight: 0,
              maxHeight: 10,
              seed: Math.floor(Math.random() * 1000)
            }
          );
        }
      }

      // If we're using the procedural terrain, apply material directly
      if (terrain) {
        // Apply appropriate material
        if (terrainType === 'grid') {
          const gridMaterial = new BABYLON.GridMaterial("gridMaterial", scene);
          gridMaterial.mainColor = new BABYLON.Color3(0.5, 0.5, 0.5);
          gridMaterial.lineColor = new BABYLON.Color3(0.2, 0.2, 0.2);
          gridMaterial.opacity = 0.5;
          terrain.material = gridMaterial;
        } else {
          // Standard terrain material
          const terrainMaterial = new BABYLON.StandardMaterial("terrainMaterial", scene);
          terrainMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.3);
          terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
          terrain.material = terrainMaterial;
        }
      }
    }

    return terrain;
  };

  // Load building model
  const loadBuildingModel = (scene) => {
    const building = BABYLON.MeshBuilder.CreateBox("building", { width: 10, height: 20, depth: 10 }, scene);
    building.position.y = 10;

    const buildingMaterial = new BABYLON.StandardMaterial("buildingMaterial", scene);
    buildingMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.6);
    building.material = buildingMaterial;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const window = BABYLON.MeshBuilder.CreateBox("window", { width: 1, height: 1.5, depth: 0.1 }, scene);
        window.position = new BABYLON.Vector3(-3 + j * 3, 3 + i * 4, 5.1);

        const windowMaterial = new BABYLON.StandardMaterial("windowMaterial", scene);
        windowMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.9);
        windowMaterial.alpha = 0.7;
        window.material = windowMaterial;
      }
    }
  };

  return (
    <div className="models-container">
      <h2>3D Models & DJI Integration</h2>
      
      <div className="model-controls">
        <div className="model-selection">
          <label>Model Type:</label>
          <select value={modelType} onChange={(e) => setModelType(e.target.value)}>
            <option value="drone">DJI Drone</option>
            <option value="terrain">Terrain Map</option>
            <option value="building">Building Structure</option>
            <option value="custom">Custom Model</option>
          </select>
          
          {modelType === 'terrain' && (
            <>
              <div className="terrain-options">
                <label>Terrain Type:</label>
                <select value={terrainType} onChange={(e) => setTerrainType(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="grid">Grid Overlay</option>
                </select>
              </div>
              
              <div className="terrain-options">
                <label>Heightmap:</label>
                <select value={heightmapFile} onChange={(e) => setHeightmapFile(e.target.value)}>
                  {availableHeightmaps.map(heightmap => (
                    <option key={heightmap.value} value={heightmap.value}>
                      {heightmap.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="dji-integration">
          <button onClick={initializeDJISDK} disabled={loading || djiSDK}>
            {loading ? 'Connecting...' : djiSDK ? 'DJI SDK Connected' : 'Connect DJI SDK'}
          </button>
          
          {djiSDK && (
            <div className="sdk-status">
              <span className="status-indicator connected"></span>
              <span>DJI SDK Connected</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="model-viewer">
        <canvas ref={canvasRef} className="babylon-canvas" />
        {loading && <div className="loading-overlay">Loading...</div>}
      </div>
    </div>
  );
};

export default ThreeDModels;
