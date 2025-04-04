import React, { useState } from 'react';
import './DJIControl.css';

const DJIControl = () => {
  const [connected, setConnected] = useState(false);
  // Use the state variables or add comments to indicate intentional declaration
  const [batteryLevel] = useState(100); // eslint-disable-line no-unused-vars
  const [flightMode] = useState('normal'); // eslint-disable-line no-unused-vars

  const handleConnect = () => {
    setConnected(!connected);
    // Add actual connection logic here
  };

  return (
    <div className="dji-control-container">
      <h2>DJI Drone Control</h2>
      
      <div className="connection-status">
        <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
        <button onClick={handleConnect}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      <div className="drone-controls">
        <div className="control-panel">
          <h3>Flight Controls</h3>
          <div className="button-group">
            <button disabled={!connected}>Take Off</button>
            <button disabled={!connected}>Land</button>
            <button disabled={!connected}>Return Home</button>
          </div>
        </div>

        <div className="telemetry">
          <h3>Telemetry</h3>
          <div className="info-group">
            <div className="info-item">
              <span>Battery:</span>
              <span>{batteryLevel}%</span>
            </div>
            <div className="info-item">
              <span>Flight Mode:</span>
              <span>{flightMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DJIControl;
