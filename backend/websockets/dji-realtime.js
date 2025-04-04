const WebSocket = require('ws');

class DJIWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Maps clientId to client connection
    this.drones = new Map(); // Maps droneId to drone state
    this.telemetryIntervals = new Map(); // Maps clientId to telemetry interval
    
    // Initialize with demo drone
    this.drones.set('demo-drone', {
      id: 'demo-drone',
      status: 'ready',
      battery: 85,
      position: { latitude: 37.7749, longitude: -122.4194, altitude: 0 },
      attitude: { pitch: 0, roll: 0, yaw: 0 },
      speed: { horizontal: 0, vertical: 0 },
      lastUpdated: Date.now()
    });
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.wss.on('connection', (ws) => {
      const clientId = `client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.clients.set(clientId, ws);
      
      console.log(`Client connected: ${clientId}`);
      
      // Send initial welcome message
      this.send(ws, 'welcome', { 
        message: 'Connected to DJI WebSocket Server', 
        clientId,
        availableDrones: Array.from(this.drones.keys())
      });
      
      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          this.handleMessage(clientId, ws, parsedMessage);
        } catch (e) {
          this.send(ws, 'error', { message: 'Invalid message format' });
        }
      });
      
      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        // Clear any intervals for this client
        if (this.telemetryIntervals.has(clientId)) {
          clearInterval(this.telemetryIntervals.get(clientId));
          this.telemetryIntervals.delete(clientId);
        }
        this.clients.delete(clientId);
      });
      
      ws.on('error', (error) => {
        console.error(`Client ${clientId} error:`, error);
      });
    });
  }
  
  handleMessage(clientId, ws, message) {
    const { type, data } = message;
    
    switch (type) {
      case 'connect-drone':
        this.handleDroneConnect(clientId, ws, data);
        break;
      
      case 'disconnect-drone':
        this.handleDroneDisconnect(clientId, ws, data);
        break;
      
      case 'start-telemetry':
        this.startTelemetryStream(clientId, ws, data);
        break;
      
      case 'stop-telemetry':
        this.stopTelemetryStream(clientId, ws);
        break;
        
      case 'joystick-control':
        this.handleJoystickControl(clientId, ws, data);
        break;
      
      case 'camera-control':
        this.handleCameraControl(clientId, ws, data);
        break;
        
      case 'gimbal-control':
        this.handleGimbalControl(clientId, ws, data);
        break;
        
      default:
        this.send(ws, 'error', { message: `Unknown message type: ${type}` });
    }
  }
  
  handleDroneConnect(clientId, ws, data) {
    const { droneId } = data;
    
    if (!this.drones.has(droneId)) {
      return this.send(ws, 'error', { message: `Drone ${droneId} not available` });
    }
    
    // In a real implementation, this would connect to the actual drone
    setTimeout(() => {
      this.send(ws, 'drone-connected', { 
        droneId,
        status: 'connected',
        message: `Successfully connected to drone ${droneId}`
      });
    }, 1500); // Simulate connection delay
  }
  
  handleDroneDisconnect(clientId, ws, data) {
    const { droneId } = data;
    
    // In a real implementation, this would disconnect from the actual drone
    setTimeout(() => {
      this.send(ws, 'drone-disconnected', { 
        droneId,
        status: 'disconnected',
        message: `Successfully disconnected from drone ${droneId}`
      });
    }, 1000); // Simulate disconnect delay
  }
  
  startTelemetryStream(clientId, ws, data) {
    const { droneId, interval = 100 } = data;
    
    // Stop existing telemetry if any
    this.stopTelemetryStream(clientId, ws);
    
    // Setup new telemetry stream
    const telemetryInterval = setInterval(() => {
      // Get actual drone state or generate simulated data
      const drone = this.drones.get(droneId) || this.drones.get('demo-drone');
      
      if (drone) {
        // Update simulated drone state with some variations
        drone.battery = Math.max(0, drone.battery - 0.01);
        drone.position.altitude += (Math.random() - 0.5) * 0.1;
        drone.attitude.pitch = (Math.sin(Date.now() / 5000) * 5);
        drone.attitude.roll = (Math.sin(Date.now() / 7000) * 3);
        drone.attitude.yaw = (drone.attitude.yaw + 0.1) % 360;
        drone.speed.horizontal = Math.abs(Math.sin(Date.now() / 10000) * 10);
        drone.lastUpdated = Date.now();
        
        this.send(ws, 'telemetry', {
          droneId,
          timestamp: new Date().toISOString(),
          ...drone
        });
      }
    }, interval);
    
    this.telemetryIntervals.set(clientId, telemetryInterval);
    this.send(ws, 'telemetry-started', { 
      droneId, 
      interval,
      message: `Telemetry stream started for drone ${droneId}`
    });
  }
  
  stopTelemetryStream(clientId, ws) {
    if (this.telemetryIntervals.has(clientId)) {
      clearInterval(this.telemetryIntervals.get(clientId));
      this.telemetryIntervals.delete(clientId);
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        this.send(ws, 'telemetry-stopped', { message: 'Telemetry stream stopped' });
      }
    }
  }
  
  handleJoystickControl(clientId, ws, data) {
    const { droneId, pitch, roll, yaw, throttle } = data;
    
    // In a real implementation, this would send control signals to the drone
    console.log(`Joystick control for ${droneId}: pitch=${pitch}, roll=${roll}, yaw=${yaw}, throttle=${throttle}`);
    
    // Acknowledge the command
    this.send(ws, 'joystick-ack', {
      droneId,
      timestamp: new Date().toISOString(),
      controls: { pitch, roll, yaw, throttle },
      status: 'received'
    });
    
    // Update simulated drone state based on controls
    if (this.drones.has(droneId)) {
      const drone = this.drones.get(droneId);
      // In a real implementation, this would use proper physics to update drone state
      drone.speed.horizontal = Math.abs(pitch || 0) / 10;
      drone.speed.vertical = (throttle || 0) / 10;
    }
  }
  
  handleCameraControl(clientId, ws, data) {
    const { droneId, action, settings } = data;
    
    // In a real implementation, this would control the drone's camera
    console.log(`Camera control for ${droneId}: action=${action}`);
    
    // Acknowledge the command
    this.send(ws, 'camera-ack', {
      droneId,
      timestamp: new Date().toISOString(),
      action,
      settings,
      status: 'executed'
    });
  }
  
  handleGimbalControl(clientId, ws, data) {
    const { droneId, pitch, roll, yaw, mode } = data;
    
    // In a real implementation, this would control the drone's gimbal
    console.log(`Gimbal control for ${droneId}: pitch=${pitch}, roll=${roll}, yaw=${yaw}, mode=${mode}`);
    
    // Acknowledge the command
    this.send(ws, 'gimbal-ack', {
      droneId,
      timestamp: new Date().toISOString(),
      position: { pitch: pitch || 0, roll: roll || 0, yaw: yaw || 0 },
      mode: mode || 'follow',
      status: 'executed'
    });
  }
  
  // Utility to send a typed message to a client
  send(ws, type, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data }));
    }
  }
  
  // Broadcast a message to all connected clients
  broadcast(type, data) {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data }));
      }
    });
  }
}

module.exports = DJIWebSocketServer;
