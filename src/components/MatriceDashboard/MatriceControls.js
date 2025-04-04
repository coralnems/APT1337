import React, { useState } from 'react';
import './MatriceControls.css';

function MatriceControls({ isConnected, flightMode, onFlightModeChange }) {
  const [throttle, setThrottle] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [gimbalPitch, setGimbalPitch] = useState(0);
  const [gimbalYaw, setGimbalYaw] = useState(0);
  const [airspeedLimit, setAirspeedLimit] = useState(10);
  const [altitudeLimit, setAltitudeLimit] = useState(120);
  
  const flightModes = [
    { id: 'manual', name: 'Manual Mode', description: 'Full manual control of the aircraft' },
    { id: 'gps', name: 'GPS Mode', description: 'Position hold using GPS' },
    { id: 'atti', name: 'Attitude Mode', description: 'Attitude stabilization without GPS' },
    { id: 'tripod', name: 'Tripod Mode', description: 'Precise, slow movements for filming' },
    { id: 'sport', name: 'Sport Mode', description: 'Higher speeds and responsiveness' }
  ];
  
  // Handle stick inputs (with deadzone)
  const handleStickInput = (setter, value) => {
    const deadzone = 5;
    const adjustedValue = Math.abs(value) < deadzone ? 0 : value;
    setter(adjustedValue);
    
    // Here you would send commands to the drone via the API
    console.log(`Sending control input: ${adjustedValue}`);
  };
  
  // Get joystick position for visual representation
  const getJoystickStyle = (x, y) => {
    const limit = 50; // Max joystick movement in pixels
    const xPos = (x / 100) * limit;
    const yPos = (y / 100) * -limit; // Invert Y for proper stick movement
    
    return {
      transform: `translate(${xPos}px, ${yPos}px)`
    };
  };

  return (
    <div className="matrice-controls">
      <h2>Flight Controls</h2>
      
      <div className={`controls-container ${!isConnected ? 'disabled' : ''}`}>
        <div className="flight-mode-selector">
          <h3>Flight Mode</h3>
          <div className="mode-buttons">
            {flightModes.map(mode => (
              <button
                key={mode.id}
                className={`mode-button ${flightMode === mode.id ? 'active' : ''}`}
                onClick={() => onFlightModeChange(mode.id)}
                disabled={!isConnected}
              >
                {mode.name}
              </button>
            ))}
          </div>
          <div className="mode-description">
            {flightModes.find(mode => mode.id === flightMode)?.description}
          </div>
        </div>
        
        <div className="controls-row">
          <div className="control-column">
            <div className="joystick-container">
              <h3>Throttle / Yaw</h3>
              <div className="joystick">
                <div 
                  className="joystick-knob"
                  style={getJoystickStyle(yaw, throttle)}
                ></div>
              </div>
              
              <div className="control-sliders">
                <div className="slider-group">
                  <label>Throttle: {throttle}%</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={throttle}
                    onChange={(e) => handleStickInput(setThrottle, parseInt(e.target.value))}
                    disabled={!isConnected}
                  />
                </div>
                
                <div className="slider-group">
                  <label>Yaw: {yaw}°</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={yaw}
                    onChange={(e) => handleStickInput(setYaw, parseInt(e.target.value))}
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="control-column">
            <div className="joystick-container">
              <h3>Pitch / Roll</h3>
              <div className="joystick">
                <div 
                  className="joystick-knob"
                  style={getJoystickStyle(roll, pitch)}
                ></div>
              </div>
              
              <div className="control-sliders">
                <div className="slider-group">
                  <label>Pitch: {pitch}°</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={pitch}
                    onChange={(e) => handleStickInput(setPitch, parseInt(e.target.value))}
                    disabled={!isConnected}
                  />
                </div>
                
                <div className="slider-group">
                  <label>Roll: {roll}°</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={roll}
                    onChange={(e) => handleStickInput(setRoll, parseInt(e.target.value))}
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="controls-row">
          <div className="gimbal-controls">
            <h3>Gimbal Controls</h3>
            
            <div className="gimbal-sliders">
              <div className="slider-group">
                <label>Gimbal Pitch: {gimbalPitch}°</label>
                <input
                  type="range"
                  min="-90"
                  max="30"
                  value={gimbalPitch}
                  onChange={(e) => setGimbalPitch(parseInt(e.target.value))}
                  disabled={!isConnected}
                />
              </div>
              
              <div className="slider-group">
                <label>Gimbal Yaw: {gimbalYaw}°</label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={gimbalYaw}
                  onChange={(e) => setGimbalYaw(parseInt(e.target.value))}
                  disabled={!isConnected}
                />
              </div>
            </div>
            
            <div className="gimbal-presets">
              <button disabled={!isConnected}>Look Down</button>
              <button disabled={!isConnected}>Look Forward</button>
              <button disabled={!isConnected}>Reset Gimbal</button>
            </div>
          </div>
        </div>
        
        <div className="controls-row">
          <div className="flight-limits">
            <h3>Flight Limits</h3>
            
            <div className="limit-controls">
              <div className="limit-group">
                <label>Airspeed Limit: {airspeedLimit} m/s</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={airspeedLimit}
                  onChange={(e) => setAirspeedLimit(parseInt(e.target.value))}
                  disabled={!isConnected}
                />
                <div className="limit-indicator">
                  <div className="limit-marker" style={{ left: `${(airspeedLimit / 20) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="limit-group">
                <label>Altitude Limit: {altitudeLimit} m</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={altitudeLimit}
                  onChange={(e) => setAltitudeLimit(parseInt(e.target.value))}
                  disabled={!isConnected}
                />
                <div className="limit-indicator">
                  <div className="limit-marker" style={{ left: `${(altitudeLimit / 500) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="controls-row">
          <div className="flight-commands">
            <h3>Flight Commands</h3>
            
            <div className="command-buttons">
              <button className="command-button takeoff" disabled={!isConnected}>
                <span className="command-icon">🚀</span>
                <span className="command-text">Take Off</span>
              </button>
              
              <button className="command-button land" disabled={!isConnected}>
                <span className="command-icon">🛬</span>
                <span className="command-text">Land</span>
              </button>
              
              <button className="command-button hover" disabled={!isConnected}>
                <span className="command-icon">⊙</span>
                <span className="command-text">Hover</span>
              </button>
              
              <button className="command-button rth" disabled={!isConnected}>
                <span className="command-icon">🏠</span>
                <span className="command-text">Return Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {!isConnected && (
        <div className="connection-overlay">
          <p>Connect to drone to enable flight controls</p>
          <div className="connection-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default MatriceControls;
