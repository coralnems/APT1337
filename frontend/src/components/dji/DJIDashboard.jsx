import React, { useState, useEffect } from 'react';
import DroneMap from './DroneMap';
import DroneStatus from './DroneStatus';
import DroneControls from './DroneControls';
import CameraFeed from './CameraFeed';
import TelemetryPanel from './TelemetryPanel';
import JoystickControl from './JoystickControl';
import WifiScanner from './WifiScanner';
import DroneDetection from './DroneDetection';
import FlightPlanner from './FlightPlanner';
import AnalyticsPanel from './AnalyticsPanel';
import './DJIDashboard.css';

function DJIDashboard() {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [connected, setConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [webSocket, setWebSocket] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000`);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setWebSocket(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error', error);
      setError('Failed to connect to drone control server');
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
      setWebSocket(null);
    };
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);
  
  // Fetch available drones on component mount
  useEffect(() => {
    fetch('/api/dji/drones')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch available drones');
        }
        return response.json();
      })
      .then((data) => {
        setAvailableDrones(data.drones);
        if (data.drones.length > 0) {
          setSelectedDrone(data.drones[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching drones:', error);
        setError('Failed to fetch available drones');
      });
  }, []);
  
  const handleWebSocketMessage = (message) => {
    const { type, data } = message;
    
    switch (type) {
      case 'welcome':
        console.log('WebSocket welcome message:', data.message);
        break;
        
      case 'drone-connected':
        setConnected(true);
        console.log('Drone connected:', data.message);
        break;
        
      case 'drone-disconnected':
        setConnected(false);
        console.log('Drone disconnected:', data.message);
        break;
        
      case 'telemetry':
        setTelemetry(data);
        break;
        
      case 'error':
        console.error('WebSocket error message:', data.message);
        setError(data.message);
        break;
        
      default:
        console.log('Unhandled WebSocket message type:', type, data);
    }
  };
  
  const connectDrone = () => {
    if (webSocket && selectedDrone) {
      webSocket.send(JSON.stringify({
        type: 'connect-drone',
        data: { droneId: selectedDrone.id }
      }));
    }
  };
  
  const disconnectDrone = () => {
    if (webSocket && selectedDrone) {
      webSocket.send(JSON.stringify({
        type: 'disconnect-drone',
        data: { droneId: selectedDrone.id }
      }));
    }
  };
  
  const startTelemetry = () => {
    if (webSocket && selectedDrone) {
      webSocket.send(JSON.stringify({
        type: 'start-telemetry',
        data: { droneId: selectedDrone.id, interval: 100 }
      }));
    }
  };
  
  const stopTelemetry = () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({
        type: 'stop-telemetry'
      }));
    }
  };
  
  const handleJoystickMove = (stickData) => {
    if (webSocket && selectedDrone && connected) {
      webSocket.send(JSON.stringify({
        type: 'joystick-control',
        data: {
          droneId: selectedDrone.id,
          ...stickData
        }
      }));
    }
  };
  
  const handleDroneChange = (drone) => {
    setSelectedDrone(drone);
    if (connected) {
      disconnectDrone();
    }
  };

  return (
    <div className="dji-dashboard">
      <header className="dashboard-header">
        <h1>DJI Drone Control Dashboard</h1>
        
        <div className="drone-selector">
          <label>Select Drone:</label>
          <select 
            value={selectedDrone?.id || ''}
            onChange={(e) => {
              const drone = availableDrones.find(d => d.id === e.target.value);
              handleDroneChange(drone);
            }}
          >
            <option value="">-- Select Drone --</option>
            {availableDrones.map((drone) => (
              <option key={drone.id} value={drone.id}>
                {drone.name} ({drone.status})
              </option>
            ))}
          </select>
        </div>
        
        <div className="connection-controls">
          {!connected ? (
            <button 
              onClick={connectDrone} 
              disabled={!selectedDrone || !webSocket}
              className="connect-button"
            >
              Connect
            </button>
          ) : (
            <button 
              onClick={disconnectDrone} 
              className="disconnect-button"
            >
              Disconnect
            </button>
          )}
          
          {connected && (
            <>
              <button onClick={startTelemetry}>Start Telemetry</button>
              <button onClick={stopTelemetry}>Stop Telemetry</button>
            </>
          )}
        </div>
      </header>
      
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'map' ? 'active' : ''} 
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button 
          className={activeTab === 'controls' ? 'active' : ''} 
          onClick={() => setActiveTab('controls')}
        >
          Controls
        </button>
        <button 
          className={activeTab === 'camera' ? 'active' : ''} 
          onClick={() => setActiveTab('camera')}
        >
          Camera
        </button>
        <button 
          className={activeTab === 'planner' ? 'active' : ''} 
          onClick={() => setActiveTab('planner')}
        >
          Flight Planner
        </button>
        <button 
          className={activeTab === 'scanner' ? 'active' : ''} 
          onClick={() => setActiveTab('scanner')}
        >
          RF Scanner
        </button>
        <button 
          className={activeTab === 'detection' ? 'active' : ''} 
          onClick={() => setActiveTab('detection')}
        >
          Drone Detection
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="status-panel">
          <DroneStatus 
            drone={selectedDrone} 
            connected={connected} 
            telemetry={telemetry} 
          />
        </div>
        
        <div className="main-content">
          {activeTab === 'map' && (
            <DroneMap 
              drone={selectedDrone}
              telemetry={telemetry}
              connected={connected}
            />
          )}
          
          {activeTab === 'controls' && (
            <div className="controls-container">
              <DroneControls 
                drone={selectedDrone}
                connected={connected}
                webSocket={webSocket}
              />
              <JoystickControl
                onMove={handleJoystickMove}
                disabled={!connected}
              />
            </div>
          )}
          
          {activeTab === 'camera' && (
            <CameraFeed 
              drone={selectedDrone}
              connected={connected}
              webSocket={webSocket}
            />
          )}
          
          {activeTab === 'planner' && (
            <FlightPlanner 
              drone={selectedDrone}
              connected={connected}
            />
          )}
          
          {activeTab === 'scanner' && (
            <WifiScanner />
          )}
          
          {activeTab === 'detection' && (
            <DroneDetection />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsPanel 
              drone={selectedDrone}
            />
          )}
        </div>
        
        <div className="telemetry-panel">
          <TelemetryPanel 
            telemetry={telemetry} 
            connected={connected} 
          />
        </div>
      </div>
    </div>
  );
}

export default DJIDashboard;
