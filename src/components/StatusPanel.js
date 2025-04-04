import React from 'react';
import './StatusPanel.css';

function StatusPanel() {
  const systemStatus = {
    motorStatus: 'OK',
    gpsStatus: 'OK',
    batteryStatus: 'OK',
    cameraStatus: 'OK',
    transmitterStatus: 'OK',
    compassStatus: 'Calibration Required',
    voiceRecognition: 'Ready',
    firmwareVersion: '2.3.5',
    flightTime: '00:32:14',
    distanceTraveled: '1.43 km',
    maxAltitude: '87m',
    homeDistance: '320m'
  };

  return (
    <div className="status-panel">
      <h2>System Status Overview</h2>
      
      <div className="status-grid">
        <div className="status-section">
          <h3>Component Status</h3>
          <div className="status-items">
            <div className="status-item">
              <span className="item-name">Motors:</span>
              <span className={`item-value ${systemStatus.motorStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.motorStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">GPS:</span>
              <span className={`item-value ${systemStatus.gpsStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.gpsStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Battery:</span>
              <span className={`item-value ${systemStatus.batteryStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.batteryStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Camera:</span>
              <span className={`item-value ${systemStatus.cameraStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.cameraStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Transmitter:</span>
              <span className={`item-value ${systemStatus.transmitterStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.transmitterStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Compass:</span>
              <span className={`item-value ${systemStatus.compassStatus === 'OK' ? 'ok' : 'warning'}`}>
                {systemStatus.compassStatus}
              </span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Voice Recognition:</span>
              <span className={`item-value ok`}>
                {systemStatus.voiceRecognition}
              </span>
            </div>
          </div>
        </div>
        
        <div className="status-section">
          <h3>Flight Information</h3>
          <div className="status-items">
            <div className="status-item">
              <span className="item-name">Firmware Version:</span>
              <span className="item-value">{systemStatus.firmwareVersion}</span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Flight Time:</span>
              <span className="item-value">{systemStatus.flightTime}</span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Distance Traveled:</span>
              <span className="item-value">{systemStatus.distanceTraveled}</span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Max Altitude:</span>
              <span className="item-value">{systemStatus.maxAltitude}</span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Distance to Home:</span>
              <span className="item-value">{systemStatus.homeDistance}</span>
            </div>
            
            <div className="status-item">
              <span className="item-name">Drone Model:</span>
              <span className="item-value">DJI Neo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-value">78%</div>
          <div className="stat-label">Battery</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">12.6 m/s</div>
          <div className="stat-label">Speed</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">65 m</div>
          <div className="stat-label">Altitude</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">96%</div>
          <div className="stat-label">Signal</div>
        </div>
      </div>
      
      <div className="status-section model-highlights">
        <h3>DJI Neo Capabilities</h3>
        <div className="capability-list">
          <div className="capability-item">
            <div className="capability-icon">🎤</div>
            <div className="capability-info">
              <div className="capability-name">Voice Control</div>
              <div className="capability-desc">Control the drone using natural language voice commands</div>
            </div>
          </div>
          <div className="capability-item">
            <div className="capability-icon">🤖</div>
            <div className="capability-info">
              <div className="capability-name">Advanced AI</div>
              <div className="capability-desc">Obstacle avoidance and smart flight path planning</div>
            </div>
          </div>
          <div className="capability-item">
            <div className="capability-icon">📱</div>
            <div className="capability-info">
              <div className="capability-name">Extended Range</div>
              <div className="capability-desc">Up to 12km transmission range with OcuSync 3.0</div>
            </div>
          </div>
        </div>
      </div>
      <div className="status-footer">0</div>
      <div className="status-message">Voice recognition active. Say "Help" for command assistance.</div>
    </div>
  );
}

export default StatusPanel;
