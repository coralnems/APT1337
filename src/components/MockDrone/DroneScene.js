import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import './DroneScene.css';

const DroneScene = () => {
  const canvasRef = useRef(null);
  // Use the variable or explicitly disable the warning
  // eslint-disable-next-line no-unused-vars
  const [engine, setEngine] = useState(null);
  const [scene, setScene] = useState(null);
  const [droneMesh, setDroneMesh] = useState(null);

  // Create BabylonJS scene
  const createScene = () => {
    if (!canvasRef.current) return null;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    
    // Camera and lights setup
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 25, new BABYLON.Vector3(0, 5, 0), scene);
    camera.attachControl(canvasRef.current, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    ground.material = groundMaterial;
    
    // Create drone
    const drone = BABYLON.MeshBuilder.CreateBox("drone", {width: 2, height: 0.5, depth: 2}, scene);
    drone.position.y = 5;
    const droneMaterial = new BABYLON.StandardMaterial("droneMaterial", scene);
    droneMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.1, 0.1);
    drone.material = droneMaterial;
    
    setDroneMesh(drone);
    
    // Start rendering
    engine.runRenderLoop(() => {
      scene.render();
    });
    
    return { engine, scene };
  };

  // Initialize scene on component mount
  useEffect(() => {
    const { engine, scene } = createScene() || {};
    setEngine(engine);
    setScene(scene);
    
    // Clean up on unmount
    return () => {
      scene?.dispose();
      engine?.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Drone control functions
  const moveDrone = (x, z) => {
    if (droneMesh) {
      droneMesh.position.x += x;
      droneMesh.position.z += z;
    }
  };
  
  const rotateDrone = (angle) => {
    if (droneMesh) {
      droneMesh.rotation.y += angle;
    }
  };
  
  const handleTakeoff = () => {
    if (droneMesh) {
      droneMesh.position.y = 5;
    }
  };
  
  const handleLanding = () => {
    if (droneMesh) {
      droneMesh.position.y = 0.25;
    }
  };
  
  const getGroundHeight = (x, z) => {
    return 0; // Simplified for this example
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp': moveDrone(0, 1); break;
        case 'ArrowDown': moveDrone(0, -1); break;
        case 'ArrowLeft': moveDrone(-1, 0); break;
        case 'ArrowRight': moveDrone(1, 0); break;
        case 'q': rotateDrone(0.1); break;
        case 'e': rotateDrone(-0.1); break;
        case ' ': handleTakeoff(); break;
        case 'l': handleLanding(); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [droneMesh]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="drone-scene">
      <canvas ref={canvasRef} />
      <div className="controls-overlay">
        <div>Use arrow keys to move, Q/E to rotate</div>
        <div>Space to take off, L to land</div>
      </div>
    </div>
  );
};

export default DroneScene;
