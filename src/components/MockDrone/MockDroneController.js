export class MockDroneController {
  constructor(droneModel) {
    this.droneModel = droneModel;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { pitch: 0, yaw: 0, roll: 0 };
    this.speed = 0.05;
    this.rotationSpeed = 0.02;
    this.isFlying = false;
    this.batteryLevel = 100;
    this.altitude = 0;
    this.telemetry = {
      speed: 0,
      altitude: 0,
      batteryLevel: 100,
      gpsSignal: 'Strong',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    };
    
    // Start battery drain simulation
    setInterval(() => {
      if (this.isFlying) {
        this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);
        this.telemetry.batteryLevel = this.batteryLevel;
      }
    }, 1000);
  }

  takeoff() {
    if (!this.isFlying) {
      this.isFlying = true;
      this.altitude = 10;
      this.position.y = 10;
      this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
      this.droneModel.animateRotors();
      this.updateTelemetry();
      return { success: true, message: "Drone takeoff successful" };
    }
    return { success: false, message: "Drone is already flying" };
  }

  land() {
    if (this.isFlying) {
      this.isFlying = false;
      this.altitude = 0;
      this.position.y = 0;
      this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
      this.updateTelemetry();
      return { success: true, message: "Drone landing successful" };
    }
    return { success: false, message: "Drone is not flying" };
  }

  moveForward(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    this.position.z += distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Moved forward ${distance} units` };
  }

  moveBackward(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    this.position.z -= distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Moved backward ${distance} units` };
  }

  moveLeft(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    this.position.x -= distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Moved left ${distance} units` };
  }

  moveRight(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    this.position.x += distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Moved right ${distance} units` };
  }

  moveUp(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    this.position.y += distance * this.speed;
    this.altitude += distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Increased altitude by ${distance} units` };
  }

  moveDown(distance = 1) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    if (this.position.y <= distance * this.speed) {
      return { success: false, message: "Cannot decrease altitude further" };
    }
    
    this.position.y -= distance * this.speed;
    this.altitude -= distance * this.speed;
    this.droneModel.setPosition(this.position.x, this.position.y, this.position.z);
    this.updateTelemetry();
    return { success: true, message: `Decreased altitude by ${distance} units` };
  }

  rotateCW(degrees = 10) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    const radians = degrees * (Math.PI / 180);
    this.rotation.yaw += radians;
    this.droneModel.rotateBy(0, radians, 0);
    this.updateTelemetry();
    return { success: true, message: `Rotated CW by ${degrees} degrees` };
  }

  rotateCCW(degrees = 10) {
    if (!this.isFlying) return { success: false, message: "Drone is not flying" };
    
    const radians = degrees * (Math.PI / 180);
    this.rotation.yaw -= radians;
    this.droneModel.rotateBy(0, -radians, 0);
    this.updateTelemetry();
    return { success: true, message: `Rotated CCW by ${degrees} degrees` };
  }

  getTelemetry() {
    return this.telemetry;
  }

  updateTelemetry() {
    // Update mock telemetry based on current drone state
    this.telemetry = {
      speed: this.isFlying ? 5 + Math.random() * 2 : 0,
      altitude: this.altitude,
      batteryLevel: this.batteryLevel,
      gpsSignal: 'Strong',
      coordinates: {
        lat: 37.7749 + (this.position.x * 0.0001),
        lng: -122.4194 + (this.position.z * 0.0001)
      }
    };
    return this.telemetry;
  }
}
