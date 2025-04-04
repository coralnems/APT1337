import React, { useState, useRef, useEffect } from 'react';
import './FlightControls.css';

function FlightControls({ onConnectionChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionStatusRef = useRef(null);
  
  const handleConnect = () => {
    try {
      if (connectionStatusRef.current) {
        // Only try to access style if element exists
        connectionStatusRef.current.style.backgroundColor = isConnected ? 'red' : 'green';
        const newConnectionStatus = !isConnected;
        setIsConnected(newConnectionStatus);
        
        // Notify parent component about connection change
        if (onConnectionChange) {
          onConnectionChange(newConnectionStatus);
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  // Ensure ref is attached before trying to access it
  useEffect(() => {
    if (connectionStatusRef.current && isConnected) {
      connectionStatusRef.current.style.backgroundColor = 'green';
    }
  }, [isConnected]);

  return (
    <div className="flight-controls">
      <h2>Flight Controls</h2>
      <div className="control-panel">
        <div className="connection-status">
          <div className="status-indicator" ref={connectionStatusRef}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button onClick={handleConnect}>{isConnected ? 'Disconnect' : 'Connect'}</button>
        
        <div className="control-group">
          <h3>Throttle</h3>
          <input type="range" min="0" max="100" disabled={!isConnected} />
        </div>
        
        <div className="control-group">
          <h3>Yaw</h3>
          <input type="range" min="-100" max="100" disabled={!isConnected} />
        </div>
        
        <div className="control-group">
          <h3>Pitch</h3>
          <input type="range" min="-100" max="100" disabled={!isConnected} />
        </div>
        
        <div className="control-group">
          <h3>Roll</h3>
          <input type="range" min="-100" max="100" disabled={!isConnected} />
        </div>
        
        <div className="drone-model-info">
          <h3>Drone Model</h3>
          <div className="model-details">
            <p className="model-name">DJI Neo</p>
            <p className="model-features">Voice Control Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightControls;
