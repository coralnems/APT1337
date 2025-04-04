import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import DJIController from '../services/DJIController';
import './DJIDroneViewer.css';

const DJIDroneViewer = ({ controlMode = 'sdk' }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState(null);
  const [scene, setScene] = useState(null);
  const [djiController, setDjiController] = useState(null);
  const [droneMesh, setDroneMesh] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [sdkConnected, setSdkConnected] = useState(false);

  // Initialize BabylonJS
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const babylonEngine = new BABYLON.Engine(canvasRef.current, true);
    setEngine(babylonEngine);
    
    const babylonScene = createScene(babylonEngine, canvasRef.current);
    setScene(babylonScene);
    
    babylonEngine.runRenderLoop(() => {
      babylonScene.render();
    });
    
    window.addEventListener('resize', () => babylonEngine.resize());
    
    setLoading(false);
    
    return () => {
      babylonEngine.dispose();
      window.removeEventListener('resize', () => babylonEngine.resize());
    };
  }, []);

  // Initialize DJI Controller
  useEffect(() => {
    const initController = async () => {
      try {
        const controller = new DJIController();
        await controller.initialize();
        setDjiController(controller);
        setSdkConnected(true);
      } catch (error) {
        console.error('Failed to initialize DJI controller:', error);
        setSdkConnected(false);
      }
    };
    
    if (controlMode === 'sdk') {
      initController();
    }
    
    return () => {
      if (djiController) {
        djiController.disconnect();
      }
    };
  }, [controlMode]);

  // Update drone position based on telemetry
  useEffect(() => {
    if (!djiController || !droneMesh) return;
    
    const telemetryInterval = setInterval(() => {
      const data = djiController.getTelemetry();
      if (data) {
        setTelemetry(data);
        
        // Update drone position and rotation
        updateDroneFromTelemetry(droneMesh, data);
      }
    }, 100);
    
    return () => clearInterval(telemetryInterval);
  }, [djiController, droneMesh]);

  // Create the 3D scene
  const createScene = (engine, canvas) => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.5, 0.6, 0.8, 1);
    
    // Add camera
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      30,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 100;
    
    // Add lights
    const hemisphericLight = new BABYLON.HemisphericLight(
      "hemisphericLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemisphericLight.intensity = 0.7;
    
    const directionalLight = new BABYLON.DirectionalLight(
      "directionalLight",
      new BABYLON.Vector3(0.5, -0.5, -1),
      scene
    );
    directionalLight.intensity = 0.8;
    
    // Create ground for reference
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 500, height: 500 },
      scene
    );
    
    const groundMaterial = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMaterial.majorUnitFrequency = 10;
    groundMaterial.minorUnitVisibility = 0.3;
    groundMaterial.gridRatio = 0.5;
    groundMaterial.mainColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    groundMaterial.lineColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    ground.material = groundMaterial;
    
    // Create drone model
    const drone = createDroneModel(scene);
    setDroneMesh(drone);
    
    return scene;
  };

  // Create a more detailed DJI drone model
  const createDroneModel = (scene) => {
    // Main drone body
    const body = BABYLON.MeshBuilder.CreateBox(
      "droneBody",
      { width: 3, height: 0.5, depth: 2 },
      scene
    );
    
    const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", scene);
    bodyMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    bodyMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    body.material = bodyMaterial;
    
    // Create arms and propellers
    const armPositions = [
      new BABYLON.Vector3(1.5, 0, 1),
      new BABYLON.Vector3(-1.5, 0, 1),
      new BABYLON.Vector3(1.5, 0, -1),
      new BABYLON.Vector3(-1.5, 0, -1)
    ];
    
    const propellers = [];
    
    armPositions.forEach((pos, index) => {
      const arm = BABYLON.MeshBuilder.CreateCylinder(
        `arm${index}`,
        { diameter: 0.3, height: 0.2 },
        scene
      );
      arm.position = pos;
      arm.parent = body;
      
      const armMaterial = new BABYLON.StandardMaterial(`armMaterial${index}`, scene);
      armMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      arm.material = armMaterial;
      
      // Add motor
      const motor = BABYLON.MeshBuilder.CreateCylinder(
        `motor${index}`,
        { diameter: 0.5, height: 0.3 },
        scene
      );
      motor.position = new BABYLON.Vector3(pos.x, pos.y + 0.15, pos.z);
      motor.parent = body;
      motor.material = armMaterial;
      
      // Add propeller
      const propeller = BABYLON.MeshBuilder.CreateBox(
        `propeller${index}`,
        { width: 2, height: 0.1, depth: 0.2 },
        scene
      );
      propeller.position = new BABYLON.Vector3(pos.x, pos.y + 0.3, pos.z);
      propeller.parent = body;
      
      const propMaterial = new BABYLON.StandardMaterial(`propMaterial${index}`, scene);
      propMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      propeller.material = propMaterial;
      
      propellers.push(propeller);
    });
    
    // Create gimbal and camera
    const gimbal = BABYLON.MeshBuilder.CreateBox(
      "gimbal",
      { width: 0.8, height: 0.8, depth: 0.8 },
      scene
    );
    gimbal.position = new BABYLON.Vector3(0, -0.5, 1);
    gimbal.parent = body;
    
    const camera = BABYLON.MeshBuilder.CreateCylinder(
      "camera",
      { diameter: 0.4, height: 0.6 },
      scene
    );
    camera.position = new BABYLON.Vector3(0, -0.8, 1);
    camera.rotation.x = Math.PI / 2;
    camera.parent = body;
    
    const cameraMaterial = new BABYLON.StandardMaterial("cameraMaterial", scene);
    cameraMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    camera.material = cameraMaterial;
    
    // Animate propellers
    scene.registerBeforeRender(() => {
      propellers.forEach((propeller) => {
        propeller.rotation.y += 0.3;
      });
    });
    
    return body;
  };

  // Update drone mesh position from telemetry
  const updateDroneFromTelemetry = (droneMesh, data) => {
    if (!droneMesh || !data) return;
    
    // In a real implementation, you'd convert GPS coordinates to local scene coordinates
    // For demo purposes, we'll use simplified positioning
    
    // Scale the small GPS changes into larger scene movements
    const scaleFactor = 10000;
    
    if (data.position) {
      // Start with an initial position and modify from there
      const baseLatitude = 37.7749;
      const baseLongitude = -122.4194;
      
      droneMesh.position.x = (data.position.longitude - baseLongitude) * scaleFactor;
      droneMesh.position.z = (data.position.latitude - baseLatitude) * scaleFactor;
      droneMesh.position.y = data.position.altitude / 10; // Scale altitude
    }
    
    if (data.attitude) {
      // Convert Euler angles to radians
      const pitchRad = (data.attitude.pitch * Math.PI) / 180;
      const rollRad = (data.attitude.roll * Math.PI) / 180;
      const yawRad = (data.attitude.yaw * Math.PI) / 180;
      
      // Create rotation quaternion
      const rotation = BABYLON.Quaternion.RotationYawPitchRoll(yawRad, pitchRad, rollRad);
      droneMesh.rotationQuaternion = rotation;
    }
  };

  return (
    <div className="dji-drone-viewer">
      <div className="drone-canvas-container">
        <canvas ref={canvasRef} className="drone-canvas" />
        {loading && <div className="loading-overlay">Loading...</div>}
      </div>
      
      {telemetry && (
        <div className="telemetry-overlay">
          <div className="telemetry-data">
            <div className="telemetry-item">
              <span className="telemetry-label">Altitude:</span>
              <span className="telemetry-value">{telemetry.position?.altitude?.toFixed(1) || 0}m</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Speed:</span>
              <span className="telemetry-value">{telemetry.speed?.horizontal?.toFixed(1) || 0}m/s</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Battery:</span>
              <span className="telemetry-value">{telemetry.battery?.percentage?.toFixed(0) || 0}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="sdk-status">
        <div className={`status-indicator ${sdkConnected ? 'connected' : 'disconnected'}`}></div>
        <span>DJI SDK: {sdkConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};

export default DJIDroneViewer;
