import React, { useState } from 'react';
import './ControlModeSelector.css';

function ControlModeSelector() {
  const [controlMode, setControlMode] = useState('manual');
  
  const modes = [
    { id: 'manual', name: 'Manual Control', icon: '🎮', description: 'Full manual control of the drone' },
    { id: 'assisted', name: 'Assisted Flight', icon: '🧠', description: 'Computer-assisted stabilization' },
    { id: 'followme', name: 'Follow Me', icon: '👤', description: 'Automatically follow the controller' },
    { id: 'waypoint', name: 'Waypoint', icon: '📍', description: 'Follow pre-defined waypoints' },
    { id: 'orbit', name: 'Orbit', icon: '⭕', description: 'Orbit around a point of interest' },
  ];

  return (
    <div className="control-mode-selector">
      <h3>Flight Mode</h3>
      <div className="mode-list">
        {modes.map(mode => (
          <div 
            key={mode.id}
            className={`mode-item ${controlMode === mode.id ? 'active' : ''}`}
            onClick={() => setControlMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <div className="mode-info">
              <div className="mode-name">{mode.name}</div>
              {controlMode === mode.id && (
                <div className="mode-description">{mode.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ControlModeSelector;
