import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Line, Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Matrice Drone specific imports
import { MatriceTelemetry } from './components/MatriceTelemetry';
import { DroneControls } from './components/DroneControls';
import { SpotlightControl } from './components/SpotlightControl';
import { GNSSStatus } from './components/GNSSStatus';
import { TerraMappingSDK } from './components/TerraMappingSDK';
import { AnimalDetection } from './components/AnimalDetection';
import { MissionPlanner } from './components/MissionPlanner';
import { OmniDirectionalCapture } from './components/OmniDirectionalCapture';
import { EmergencyProtocols } from './components/EmergencyProtocols';
import ThreeDModels from './components/3DModels/ThreeDModels';

function App() {
  // State variables for drone data
  const [droneStatus, setDroneStatus] = useState('DISCONNECTED');
  const [telemetryData, setTelemetryData] = useState({
    altitude: 0,
    speed: 0,
    battery: 100,
    latitude: 0,
    longitude: 0,
    heading: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    gnssSignal: 'No Signal',
    satellites: 0,
    temperature: 0,
    flightTime: '00:00:00',
  });
  const [missionMode, setMissionMode] = useState('MOCK'); // 'MOCK' or 'PRODUCTION'
  const [isConnected, setIsConnected] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [detections, setDetections] = useState([]);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(0.5); // in seconds
  const [directionalCapture, setDirectionalCapture] = useState(true);
  const [mappingEnabled, setMappingEnabled] = useState(false);
  const [flightPath, setFlightPath] = useState('Grid Pattern');

  // Mock data generation for demonstration
  useEffect(() => {
    if (missionMode === 'MOCK' && isConnected) {
      const mockDataInterval = setInterval(() => {
        // Generate realistic mock telemetry data
        setTelemetryData(prev => ({
          ...prev,
          altitude: Math.max(0, prev.altitude + (Math.random() * 2 - 1)),
          speed: Math.max(0, prev.speed + (Math.random() * 1 - 0.5)),
          battery: Math.max(0, Math.min(100, prev.battery - 0.05)),
          latitude: prev.latitude + (Math.random() * 0.0001 - 0.00005),
          longitude: prev.longitude + (Math.random() * 0.0001 - 0.00005),
          heading: (prev.heading + Math.random() * 5) % 360,
          roll: Math.max(-30, Math.min(30, prev.roll + (Math.random() * 4 - 2))),
          pitch: Math.max(-30, Math.min(30, prev.pitch + (Math.random() * 4 - 2))),
          yaw: Math.max(-180, Math.min(180, prev.yaw + (Math.random() * 4 - 2))),
          gnssSignal: Math.random() > 0.05 ? 'Good' : 'Poor',
          satellites: Math.floor(Math.random() * 5 + 15),
          temperature: Math.min(50, Math.max(0, prev.temperature + (Math.random() * 0.5 - 0.25))),
        }));

        // Occasionally add random detections in mock mode
        if (Math.random() > 0.95) {
          const detectionTypes = ['Person', 'Animal', 'Vehicle'];
          const newDetection = {
            id: Date.now(),
            type: detectionTypes[Math.floor(Math.random() * detectionTypes.length)],
            confidence: Math.floor(Math.random() * 30 + 70),
            timestamp: new Date().toISOString(),
            location: {
              lat: telemetryData.latitude + (Math.random() * 0.005 - 0.0025),
              lng: telemetryData.longitude + (Math.random() * 0.005 - 0.0025)
            }
          };
          setDetections(prev => [newDetection, ...prev].slice(0, 10));
        }
      }, 1000);

      return () => clearInterval(mockDataInterval);
    }
  }, [missionMode, isConnected, telemetryData.latitude, telemetryData.longitude]);

  // Connect to drone function
  const connectToDrone = async () => {
    try {
      if (missionMode === 'MOCK') {
        // For mock mode, just simulate connection
        setIsConnected(true);
        setDroneStatus('CONNECTED');
        setTelemetryData(prev => ({
          ...prev,
          latitude: 37.7749,
          longitude: -122.4194, // Start at a default position (San Francisco)
          gnssSignal: 'Good',
          battery: 95,
        }));
      } else {
        // In production mode, would connect to real API
        const response = await axios.post('/api/drone/connect', {
          connectionType: 'Wi-Fi',
          ip: '192.168.0.1',
          port: 8080
        });
        
        if (response.data.success) {
          setIsConnected(true);
          setDroneStatus('CONNECTED');
          // Initialize with real data from response
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect: ${error.message}`);
    }
  };

  // Disconnect from drone function
  const disconnectDrone = () => {
    setIsConnected(false);
    setDroneStatus('DISCONNECTED');
  };

  // Generate mission plan
  const generateMissionPlan = () => {
    // Create simulated waypoints for a grid search pattern
    const centerLat = telemetryData.latitude;
    const centerLng = telemetryData.longitude;
    const gridSize = 0.005; // approx 500m grid
    
    const newWaypoints = [
      { lat: centerLat - gridSize, lng: centerLng - gridSize, alt: 50 },
      { lat: centerLat - gridSize, lng: centerLng + gridSize, alt: 50 },
      { lat: centerLat - gridSize/2, lng: centerLng + gridSize, alt: 50 },
      { lat: centerLat - gridSize/2, lng: centerLng - gridSize, alt: 50 },
      { lat: centerLat, lng: centerLng - gridSize, alt: 50 },
      { lat: centerLat, lng: centerLng + gridSize, alt: 50 },
      { lat: centerLat + gridSize/2, lng: centerLng + gridSize, alt: 50 },
      { lat: centerLat + gridSize/2, lng: centerLng - gridSize, alt: 50 },
      { lat: centerLat + gridSize, lng: centerLng - gridSize, alt: 50 },
      { lat: centerLat + gridSize, lng: centerLng + gridSize, alt: 50 },
    ];
    
    setWaypoints(newWaypoints);
    return newWaypoints;
  };

  // Start mission function
  const startMission = async () => {
    if (missionMode === 'MOCK') {
      alert('Mission started in mock mode');
    } else {
      try {
        const response = await axios.post('/api/drone/mission/start');
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Mission start error:', error);
        alert(`Failed to start mission: ${error.message}`);
      }
    }
  };

  // Toggle AL1 Spotlight
  const toggleSpotlight = () => {
    setSpotlightActive(!spotlightActive);
    // In production mode would call API to toggle spotlight
  };

  // Toggle between mock and production modes
  const toggleMissionMode = () => {
    if (isConnected) {
      disconnectDrone();
    }
    setMissionMode(prev => prev === 'MOCK' ? 'PRODUCTION' : 'MOCK');
  };

  // Set capture interval for cameras
  const updateCaptureInterval = (interval) => {
    setCaptureInterval(interval);
    // In production mode would update drone settings
  };

  // Toggle directional capture (3 directional vs. omni)
  const toggleDirectionalCapture = () => {
    setDirectionalCapture(!directionalCapture);
    // In production mode would update drone settings
  };

  // Start terrain mapping
  const startMapping = () => {
    setMappingEnabled(true);
    alert('Terrain mapping enabled');
    // In production mode would configure and start the mapping process
  };

  // Stop terrain mapping
  const stopMapping = () => {
    setMappingEnabled(false);
    alert('Terrain mapping disabled');
    // In production mode would stop the mapping process
  };

  // Export mapping data to Terra
  const exportToTerra = () => {
    alert('Exporting mapping data to DJI Terra');
    // In production mode would initiate data export to Terra
  };

  // Emergency return to home
  const returnToHome = async () => {
    if (missionMode === 'MOCK') {
      alert('RTH activated in mock mode');
    } else {
      try {
        const response = await axios.post('/api/drone/rth');
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('RTH error:', error);
        alert(`Failed to initiate RTH: ${error.message}`);
      }
    }
  };

  // Emergency stop function
  const emergencyStop = async () => {
    if (missionMode === 'MOCK') {
      alert('EMERGENCY STOP activated in mock mode');
    } else {
      try {
        const response = await axios.post('/api/drone/emergency-stop');
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Emergency stop error:', error);
        alert(`Failed to initiate emergency stop: ${error.message}`);
      }
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Container fluid className="app-container">
            {/* Header with status indicators */}
            <Row className="header">
              <Col>
                <Card className="text-center">
                  <Card.Header as="h4">Search and Rescue Mission Control</Card.Header>
                  <Card.Body className="d-flex justify-content-between">
                    <div className="status-indicator">
                      <span>Drone Status: </span>
                      <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        {droneStatus}
                      </span>
                    </div>
                    
                    <div className="status-indicator">
                      <span>GNSS Signal: </span>
                      <span className={`status-badge ${telemetryData.gnssSignal === 'Good' ? 'good' : 'poor'}`}>
                        {telemetryData.gnssSignal}
                      </span>
                    </div>
                    
                    <div className="status-indicator">
                      <span>Battery: </span>
                      <span className={`status-badge ${
                        telemetryData.battery > 50 ? 'good' : 
                        telemetryData.battery > 20 ? 'warning' : 'critical'
                      }`}>
                        {Math.round(telemetryData.battery)}%
                      </span>
                    </div>
                    
                    <div className="mode-selector">
                      <span>Mode: </span>
                      <Button 
                        variant={missionMode === 'MOCK' ? "warning" : "success"} 
                        onClick={toggleMissionMode}
                      >
                        {missionMode}
                      </Button>
                    </div>
                    
                    <Button 
                      variant={isConnected ? "danger" : "primary"} 
                      onClick={isConnected ? disconnectDrone : connectToDrone}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Main content */}
            <Row className="main-content">
              <Col>
                <Tabs defaultActiveKey="mission" id="dashboard-tabs">
                  <Tab eventKey="mission" title="Mission Control">
                    <Row className="mt-3">
                      <Col md={8}>
                        <Card>
                          <Card.Header>Mission Map</Card.Header>
                          <Card.Body style={{ height: '500px' }}>
                            {isConnected && (
                              <MapContainer 
                                center={[telemetryData.latitude, telemetryData.longitude]} 
                                zoom={15} 
                                style={{ height: '100%', width: '100%' }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[telemetryData.latitude, telemetryData.longitude]}>
                                  <Popup>
                                    Drone Position<br />
                                    Alt: {telemetryData.altitude.toFixed(1)}m
                                  </Popup>
                                </Marker>
                                
                                {waypoints.length > 0 && (
                                  <>
                                    <Polyline 
                                      positions={waypoints.map(wp => [wp.lat, wp.lng])}
                                      color="blue"
                                    />
                                    {waypoints.map((wp, index) => (
                                      <Marker 
                                        key={index} 
                                        position={[wp.lat, wp.lng]}
                                      >
                                        <Popup>
                                          Waypoint {index + 1}<br />
                                          Alt: {wp.alt}m
                                        </Popup>
                                      </Marker>
                                    ))}
                                  </>
                                )}

                                {detections.map((detection) => (
                                  <Marker 
                                    key={detection.id} 
                                    position={[detection.location.lat, detection.location.lng]}
                                  >
                                    <Popup>
                                      {detection.type} detected<br />
                                      Confidence: {detection.confidence}%
                                    </Popup>
                                  </Marker>
                                ))}
                              </MapContainer>
                            )}
                            
                            {!isConnected && (
                              <div className="text-center p-5">
                                <h5>Connect to drone to view map</h5>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={4}>
                        <Card className="mb-3">
                          <Card.Header>Mission Controls</Card.Header>
                          <Card.Body>
                            <Button 
                              variant="primary" 
                              className="m-1" 
                              onClick={generateMissionPlan}
                              disabled={!isConnected}
                            >
                              Generate Mission Plan
                            </Button>
                            
                            <Button 
                              variant="success" 
                              className="m-1" 
                              onClick={startMission}
                              disabled={!isConnected || waypoints.length === 0}
                            >
                              Start Mission
                            </Button>
                            
                            <Button 
                              variant="warning" 
                              className="m-1" 
                              onClick={returnToHome}
                              disabled={!isConnected}
                            >
                              Return to Home
                            </Button>
                            
                            <Button 
                              variant="danger" 
                              className="m-1" 
                              onClick={emergencyStop}
                              disabled={!isConnected}
                            >
                              EMERGENCY STOP
                            </Button>
                          </Card.Body>
                        </Card>
                        
                        <Card className="mb-3">
                          <Card.Header>Equipment Controls</Card.Header>
                          <Card.Body>
                            <Button 
                              variant={spotlightActive ? "warning" : "outline-warning"} 
                              className="m-1" 
                              onClick={toggleSpotlight}
                              disabled={!isConnected}
                            >
                              {spotlightActive ? "Disable AL1 Spotlight" : "Enable AL1 Spotlight"}
                            </Button>
                            
                            <div className="mt-2">
                              <label className="me-2">Capture Interval: {captureInterval}s</label>
                              <input 
                                type="range" 
                                min="0.1" 
                                max="5" 
                                step="0.1" 
                                value={captureInterval}
                                onChange={(e) => updateCaptureInterval(parseFloat(e.target.value))}
                              />
                            </div>
                            
                            <div className="form-check mt-2">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={directionalCapture}
                                onChange={toggleDirectionalCapture}
                                id="directionalCaptureCheck"
                              />
                              <label className="form-check-label" htmlFor="directionalCaptureCheck">
                                3-Directional Capture
                              </label>
                            </div>
                            
                            <div className="mt-2">
                              <Button 
                                variant={mappingEnabled ? "success" : "outline-success"} 
                                className="m-1" 
                                onClick={mappingEnabled ? stopMapping : startMapping}
                                disabled={!isConnected}
                              >
                                {mappingEnabled ? "Stop Terrain Mapping" : "Start Terrain Mapping"}
                              </Button>
                              
                              <Button 
                                variant="outline-primary" 
                                className="m-1" 
                                onClick={exportToTerra}
                                disabled={!isConnected || !mappingEnabled}
                              >
                                Export to Terra
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Header>Detection Results</Card.Header>
                          <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {detections.length > 0 ? (
                              detections.map((detection) => (
                                <Alert 
                                  key={detection.id}
                                  variant={
                                    detection.type === 'Person' ? 'danger' :
                                    detection.type === 'Animal' ? 'warning' :
                                    'info'
                                  }
                                  className="p-2 mb-2"
                                >
                                  <small>
                                    <strong>{detection.type}</strong> detected at {new Date(detection.timestamp).toLocaleTimeString()}<br />
                                    Confidence: {detection.confidence}%
                                  </small>
                                </Alert>
                              ))
                            ) : (
                              <p className="text-muted">No detections yet</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                  
                  <Tab eventKey="telemetry" title="Telemetry">
                    <Row className="mt-3">
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>Flight Data</Card.Header>
                          <Card.Body>
                            <MatriceTelemetry telemetryData={telemetryData} />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>GNSS Status</Card.Header>
                          <Card.Body>
                            <GNSSStatus 
                              signal={telemetryData.gnssSignal}
                              satellites={telemetryData.satellites}
                              latitude={telemetryData.latitude}
                              longitude={telemetryData.longitude}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={12}>
                        <Card>
                          <Card.Header>Telemetry Graphs</Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={4}>
                                {/* Altitude graph placeholder */}
                                <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  Altitude Graph
                                </div>
                              </Col>
                              <Col md={4}>
                                {/* Speed graph placeholder */}
                                <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  Speed Graph
                                </div>
                              </Col>
                              <Col md={4}>
                                {/* Battery graph placeholder */}
                                <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  Battery Graph
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                  
                  <Tab eventKey="mapping" title="Mapping & Navigation">
                    <Row className="mt-3">
                      <Col md={8}>
                        <Card>
                          <Card.Header>Terra Mapping</Card.Header>
                          <Card.Body style={{ height: '500px' }}>
                            <TerraMappingSDK 
                              enabled={mappingEnabled}
                              position={[telemetryData.latitude, telemetryData.longitude]}
                              altitude={telemetryData.altitude}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={4}>
                        <Card className="mb-3">
                          <Card.Header>Mapping Controls</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">Mapping Mode</label>
                              <select className="form-select">
                                <option>2D Map</option>
                                <option>3D Model</option>
                                <option>Oblique Photography</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Resolution</label>
                              <select className="form-select">
                                <option>Low (5 cm/px)</option>
                                <option>Medium (2 cm/px)</option>
                                <option>High (1 cm/px)</option>
                              </select>
                            </div>
                            
                            <Button 
                              variant={mappingEnabled ? "success" : "outline-success"} 
                              className="m-1" 
                              onClick={mappingEnabled ? stopMapping : startMapping}
                              disabled={!isConnected}
                            >
                              {mappingEnabled ? "Stop Terrain Mapping" : "Start Terrain Mapping"}
                            </Button>
                            
                            <Button 
                              variant="outline-primary" 
                              className="m-1" 
                              onClick={exportToTerra}
                              disabled={!isConnected || !mappingEnabled}
                            >
                              Export to Terra
                            </Button>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Header>Mapping Statistics</Card.Header>
                          <Card.Body>
                            <p>Area Covered: {isConnected ? '0.12 km²' : '0.00 km²'}</p>
                            <p>Images Captured: {isConnected ? '32' : '0'}</p>
                            <p>Estimated Completion: {isConnected ? '00:12:45' : '00:00:00'}</p>
                            <p>Resolution: {isConnected ? '2.0 cm/px' : '0.0 cm/px'}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                  
                  <Tab eventKey="detection" title="Detection & Analysis">
                    <Row className="mt-3">
                      <Col md={8}>
                        <Card>
                          <Card.Header>Live Detection Feed</Card.Header>
                          <Card.Body style={{ height: '500px' }}>
                            <AnimalDetection 
                              enabled={isConnected}
                              detections={detections}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={4}>
                        <Card className="mb-3">
                          <Card.Header>Detection Settings</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">Detection Mode</label>
                              <select className="form-select">
                                <option>People</option>
                                <option>Animals</option>
                                <option>Vehicles</option>
                                <option>Combined</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Sensitivity</label>
                              <select className="form-select">
                                <option>Low</option>
                                <option>Medium</option>
                                <option selected>High</option>
                                <option>Very High</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Minimum Confidence</label>
                              <select className="form-select">
                                <option>50%</option>
                                <option>60%</option>
                                <option selected>70%</option>
                                <option>80%</option>
                                <option>90%</option>
                              </select>
                            </div>
                            
                            <div className="form-check mb-2">
                              <input className="form-check-input" type="checkbox" checked id="alertPeopleCheck" />
                              <label className="form-check-label" htmlFor="alertPeopleCheck">
                                Alert on People Detection
                              </label>
                            </div>
                            
                            <div className="form-check mb-2">
                              <input className="form-check-input" type="checkbox" checked id="alertAnimalsCheck" />
                              <label className="form-check-label" htmlFor="alertAnimalsCheck">
                                Alert on Animal Detection
                              </label>
                            </div>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Header>Detection Results</Card.Header>
                          <Card.Body style={{ maxHeight: '245px', overflowY: 'auto' }}>
                            <p>People Detected: {detections.filter(d => d.type === 'Person').length}</p>
                            <p>Animals Detected: {detections.filter(d => d.type === 'Animal').length}</p>
                            <p>Vehicles Detected: {detections.filter(d => d.type === 'Vehicle').length}</p>
                            <p>Other Objects: 0</p>
                            
                            <hr />
                            
                            {detections.length > 0 ? (
                              detections.map((detection) => (
                                <Alert 
                                  key={detection.id}
                                  variant={
                                    detection.type === 'Person' ? 'danger' :
                                    detection.type === 'Animal' ? 'warning' :
                                    'info'
                                  }
                                  className="p-2 mb-2"
                                >
                                  <small>
                                    <strong>{detection.type}</strong> detected at {new Date(detection.timestamp).toLocaleTimeString()}<br />
                                    Confidence: {detection.confidence}%
                                  </small>
                                </Alert>
                              ))
                            ) : (
                              <p className="text-muted">No detections yet</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                  
                  <Tab eventKey="settings" title="Settings">
                    <Row className="mt-3">
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>Connection Settings</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">Connection Type</label>
                              <select className="form-select">
                                <option>USB</option>
                                <option selected>Wi-Fi</option>
                                <option>Remote Controller</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Device IP</label>
                              <input type="text" className="form-control" value="192.168.0.1" />
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Port</label>
                              <input type="text" className="form-control" value="8080" />
                            </div>
                            
                            <Button variant="primary">Apply Connection Settings</Button>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Header>Equipment Settings</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">AL1 Spotlight Brightness</label>
                              <input type="range" className="form-range" min="0" max="100" value="80" />
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Camera Mode</label>
                              <select className="form-select">
                                <option>Standard</option>
                                <option selected>High Resolution</option>
                                <option>Night Mode</option>
                              </select>
                            </div>
                            
                            <OmniDirectionalCapture 
                              enabled={directionalCapture}
                              toggleEnabled={toggleDirectionalCapture}
                              captureInterval={captureInterval}
                              updateInterval={updateCaptureInterval}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={6}>
                        <Card className="mb-3">
                          <Card.Header>Mock Data Settings</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">Simulated Flight Path</label>
                              <select 
                                className="form-select"
                                value={flightPath}
                                onChange={(e) => setFlightPath(e.target.value)}
                              >
                                <option>Grid Pattern</option>
                                <option>Circular Pattern</option>
                                <option>Random Movement</option>
                                <option>Stationary</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Simulated Detections</label>
                              <select className="form-select">
                                <option>None</option>
                                <option>Occasional</option>
                                <option selected>Frequent</option>
                                <option>Predefined Scenario</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Data Update Rate (ms)</label>
                              <input type="number" className="form-control" value="1000" />
                            </div>
                            
                            <Button variant="primary">Apply Mock Settings</Button>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Header>Application Settings</Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <label className="form-label">UI Theme</label>
                              <select className="form-select">
                                <option selected>Dark (Default)</option>
                                <option>Light</option>
                                <option>System</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Map Provider</label>
                              <select className="form-select">
                                <option>Google Maps</option>
                                <option>Bing Maps</option>
                                <option selected>OpenStreetMap</option>
                                <option>DJI Maps</option>
                              </select>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Units</label>
                              <select className="form-select">
                                <option selected>Metric</option>
                                <option>Imperial</option>
                              </select>
                            </div>
                            
                            <Button variant="primary">Save Settings</Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </Col>
            </Row>

            {/* Footer with emergency controls */}
            <Row className="footer mt-3">
              <Col>
                <Card>
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Flight Time:</strong> {telemetryData.flightTime} | 
                      <strong> Altitude:</strong> {telemetryData.altitude.toFixed(1)}m | 
                      <strong> Battery:</strong> {Math.round(telemetryData.battery)}%
                    </div>
                    
                    <div>
                      <EmergencyProtocols 
                        isConnected={isConnected} 
                        returnToHome={returnToHome}
                        emergencyStop={emergencyStop}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        } />
        <Route path="/3d-models" element={<ThreeDModels />} />
      </Routes>
    </Router>
  );
}

export default App;
