const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock DJI drone state
let droneState = {
  connected: false,
  batteryLevel: 87,
  altitude: 0,
  speed: 0,
  flightMode: 'normal',
  gps: { latitude: 37.7749, longitude: -122.4194 }
};

// Routes
app.get('/api/drone/status', (req, res) => {
  res.json(droneState);
});

app.post('/api/drone/connect', (req, res) => {
  droneState.connected = !droneState.connected;
  res.json({ connected: droneState.connected });
});

app.post('/api/drone/takeoff', (req, res) => {
  if (droneState.connected) {
    droneState.altitude = 10;  // Auto takeoff to 10m
    res.json({ success: true, message: 'Taking off' });
  } else {
    res.status(400).json({ success: false, message: 'Drone not connected' });
  }
});

app.post('/api/drone/land', (req, res) => {
  if (droneState.connected) {
    droneState.altitude = 0;
    res.json({ success: true, message: 'Landing' });
  } else {
    res.status(400).json({ success: false, message: 'Drone not connected' });
  }
});

app.post('/api/drone/mode', (req, res) => {
  const { mode } = req.body;
  if (!mode) {
    return res.status(400).json({ success: false, message: 'Mode not provided' });
  }
  
  droneState.flightMode = mode;
  res.json({ success: true, flightMode: mode });
});

app.post('/api/drone/altitude', (req, res) => {
  const { altitude } = req.body;
  if (altitude === undefined) {
    return res.status(400).json({ success: false, message: 'Altitude not provided' });
  }
  
  droneState.altitude = altitude;
  res.json({ success: true, altitude });
});

// Simulation route to change drone state over time
app.get('/api/drone/simulate', (req, res) => {
  if (droneState.connected) {
    // Simulate battery drain
    droneState.batteryLevel = Math.max(0, droneState.batteryLevel - 0.1);
    
    // Simulate GPS drift
    droneState.gps.latitude += (Math.random() - 0.5) * 0.0001;
    droneState.gps.longitude += (Math.random() - 0.5) * 0.0001;
    
    // Simulate speed changes if in the air
    if (droneState.altitude > 0) {
      droneState.speed = Math.max(0, Math.min(10, droneState.speed + (Math.random() - 0.5)));
    } else {
      droneState.speed = 0;
    }
  }
  
  res.json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start simulation
setInterval(() => {
  if (droneState.connected) {
    // Simulate battery drain
    droneState.batteryLevel = Math.max(0, droneState.batteryLevel - 0.01);
    
    // Simulate GPS drift
    droneState.gps.latitude += (Math.random() - 0.5) * 0.00005;
    droneState.gps.longitude += (Math.random() - 0.5) * 0.00005;
    
    // Simulate speed changes if in the air
    if (droneState.altitude > 0) {
      droneState.speed = Math.max(0, Math.min(10, droneState.speed + (Math.random() - 0.5)));
    } else {
      droneState.speed = 0;
    }
  }
}, 1000);
