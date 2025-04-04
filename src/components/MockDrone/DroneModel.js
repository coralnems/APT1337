import * as BABYLON from 'babylonjs';
import 'babylonjs-materials';

export class DroneModel {
  constructor(scene) {
    this.scene = scene;
    this.drone = null;
    this.rotors = [];
    this.createDrone();
  }

  createDrone() {
    // Main drone body
    const droneBody = BABYLON.MeshBuilder.CreateBox("droneBody", { width: 0.4, height: 0.1, depth: 0.4 }, this.scene);
    const droneMaterial = new BABYLON.StandardMaterial("droneMaterial", this.scene);
    droneMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    droneBody.material = droneMaterial;

    // Arms
    const arms = [];
    const armPositions = [
      new BABYLON.Vector3(0.25, 0, 0.25),
      new BABYLON.Vector3(0.25, 0, -0.25),
      new BABYLON.Vector3(-0.25, 0, 0.25),
      new BABYLON.Vector3(-0.25, 0, -0.25)
    ];

    for (let i = 0; i < 4; i++) {
      const arm = BABYLON.MeshBuilder.CreateCylinder(`arm${i}`, { height: 0.05, diameter: 0.05 }, this.scene);
      arm.position = armPositions[i];
      arm.material = droneMaterial;
      arms.push(arm);
    }

    // Rotors
    for (let i = 0; i < 4; i++) {
      const rotor = BABYLON.MeshBuilder.CreateCylinder(`rotor${i}`, { height: 0.02, diameter: 0.15 }, this.scene);
      rotor.position = new BABYLON.Vector3(
        armPositions[i].x,
        armPositions[i].y + 0.035,
        armPositions[i].z
      );
      
      const rotorMaterial = new BABYLON.StandardMaterial(`rotorMaterial${i}`, this.scene);
      rotorMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      rotor.material = rotorMaterial;
      
      this.rotors.push(rotor);
    }

    // Camera mount
    const cameraMount = BABYLON.MeshBuilder.CreateBox("cameraMount", { width: 0.1, height: 0.05, depth: 0.1 }, this.scene);
    cameraMount.position.y = -0.075;
    cameraMount.material = droneMaterial;

    // Group all parts
    this.drone = BABYLON.Mesh.MergeMeshes(
      [droneBody, ...arms, cameraMount],
      true,
      false,
      null,
      false,
      true
    );
    this.drone.position = new BABYLON.Vector3(0, 0, 0);

    return this.drone;
  }

  animateRotors() {
    this.scene.registerBeforeRender(() => {
      this.rotors.forEach(rotor => {
        rotor.rotation.y += 0.3;
      });
    });
  }

  setPosition(x, y, z) {
    this.drone.position = new BABYLON.Vector3(x, y, z);
    this.rotors.forEach(rotor => {
      rotor.position.x = this.drone.position.x + (rotor.position.x - this.drone.position.x);
      rotor.position.y = this.drone.position.y + rotor.position.y - this.drone.position.y + 0.035;
      rotor.position.z = this.drone.position.z + (rotor.position.z - this.drone.position.z);
    });
  }

  rotateBy(pitch, yaw, roll) {
    const rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, roll);
    this.drone.rotationQuaternion = this.drone.rotationQuaternion 
      ? this.drone.rotationQuaternion.multiply(rotationQuaternion)
      : rotationQuaternion;
  }
}
