import React, { useState, useEffect } from 'react';
import './MatriceStatus.css';

function MatriceStatus({ isConnected, connectionInfo, telemetry }) {
  const [systemStatus, setSystemStatus] = useState({
    power: 'Normal',
    motorStatus: 'Ready',
    compass: 'Calibrated',
    imu: 'Normal',
    esc: 'Normal',
    batteryTemp: 'Normal',
    gps: 'Strong (16 satellites)',
    sdCard: '64.2GB available',
    link: 'Stable',
    flightController: 'Normal'
  });
  
  const [flightStatistics, setFlightStatistics] = useState({
    flightTime: '00:00:00',
    maxAltitude: '0m',
    maxDistance: '0m',
    maxSpeed: '0m/s',
    flightCount: 324,
    totalFlightTime: '205:36:42',
    lastCalibration: '2023-06-12',
    lastMaintenance: '2023-04-28'
  });
  
  // Update flight time when connected
  useEffect(() => {
    let flightTimer;
    
    if (isConnected) {
      const startTime = Date.now();
      
      flightTimer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
        
        setFlightStatistics(prev => ({
          ...prev,
          flightTime: `${hours}:${minutes}:${seconds}`,
          maxAltitude: telemetry ? `${telemetry.altitude}m` : prev.maxAltitude,
          maxSpeed: telemetry ? `${telemetry.speed}m/s` : prev.maxSpeed
        }));
      }, 1000);
    }
    
    return () => {
      if (flightTimer) clearInterval(flightTimer);
    };
  }, [isConnected, telemetry]);

  return (
    <div className="matrice-status">
      <h2>System Status</h2>
      
      <div className="status-overview">
        <div className="drone-visualization">
          <div className="drone-model-display">
            <div className="drone-image">
              <img src="/matrice4.png" alt="DJI Matrice 4" 
                   onError={(e) => e.target.src = 'https://via.placeholder.com/300x200/1a1a2e/ff3366?text=Matrice+4+Series'} />
            </div>
            
            {telemetry && (
              <div className="live-stats">
                <div className="stat-box">
                  <div className="stat-label">Altitude</div>
                  <div className="stat-large-value">{telemetry.altitude}</div>
                  <div className="stat-unit">meters</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-label">Speed</div>
                  <div className="stat-large-value">{telemetry.speed}</div>
                  <div className="stat-unit">m/s</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-label">Battery</div>
                  <div className="stat-large-value">{telemetry.batteryLevel}</div>
                  <div className="stat-unit">percent</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="status-panels">
          <div className="status-panel component-status">
            <h3>Component Status</h3>
            
            <div className="status-grid">
              <div className="status-item">
                <div className="status-name">Power System</div>
                <div className={`status-value ${systemStatus.power === 'Normal' ? 'normal' : 'warning'}`}>
                  {systemStatus.power}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Motors</div>
                <div className={`status-value ${systemStatus.motorStatus === 'Ready' ? 'normal' : 'warning'}`}>
                  {systemStatus.motorStatus}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Compass</div>
                <div className={`status-value ${systemStatus.compass === 'Calibrated' ? 'normal' : 'warning'}`}>
                  {systemStatus.compass}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">IMU</div>
                <div className={`status-value ${systemStatus.imu === 'Normal' ? 'normal' : 'warning'}`}>
                  {systemStatus.imu}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">ESC</div>
                <div className={`status-value ${systemStatus.esc === 'Normal' ? 'normal' : 'warning'}`}>
                  {systemStatus.esc}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Battery Temp</div>
                <div className={`status-value ${systemStatus.batteryTemp === 'Normal' ? 'normal' : 'warning'}`}>
                  {systemStatus.batteryTemp}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">GPS</div>
                <div className={`status-value ${systemStatus.gps.includes('Strong') ? 'normal' : 'warning'}`}>
                  {systemStatus.gps}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Storage</div>
                <div className="status-value normal">{systemStatus.sdCard}</div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Transmission</div>
                <div className={`status-value ${systemStatus.link === 'Stable' ? 'normal' : 'warning'}`}>
                  {systemStatus.link}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-name">Flight Controller</div>
                <div className={`status-value ${systemStatus.flightController === 'Normal' ? 'normal' : 'warning'}`}>
                  {systemStatus.flightController}
                </div>
              </div>
            </div>
          </div>
          
          <div className="status-panel device-info">
            <h3>Device Information</h3>
            
            {connectionInfo ? (
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Model</div>
                  <div className="info-value">Matrice 4 Series</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Serial Number</div>
                  <div className="info-value">{connectionInfo.serialNumber}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Firmware Version</div>
                  <div className="info-value">{connectionInfo.firmware}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Flight Time</div>
                  <div className="info-value">{flightStatistics.flightTime}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Max Altitude</div>
                  <div className="info-value">{flightStatistics.maxAltitude}</div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Max Speed</div>
                  <div className="info-value">{flightStatistics.maxSpeed}</div>
                </div>
              </div>
            ) : (
              <div className="not-connected-message">
                Connect to the drone to view device information
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="maintenance-section">
        <h3>Maintenance Information</h3>
        
        <div className="maintenance-grid">
          <div className="maintenance-item">
            <div className="maintenance-icon">🛫</div>
            <div className="maintenance-details">
              <div className="maintenance-label">Flight Count</div>
              <div className="maintenance-value">{flightStatistics.flightCount}</div>
            </div>
          </div>
          
          <div className="maintenance-item">
            <div className="maintenance-icon">⏱️</div>
            <div className="maintenance-details">
              <div className="maintenance-label">Total Flight Time</div>
              <div className="maintenance-value">{flightStatistics.totalFlightTime}</div>
            </div>
          </div>
          
          <div className="maintenance-item">
            <div className="maintenance-icon">🧭</div>
            <div className="maintenance-details">
              <div className="maintenance-label">Last Calibration</div>
              <div className="maintenance-value">{flightStatistics.lastCalibration}</div>
            </div>
          </div>
          
          <div className="maintenance-item">
            <div className="maintenance-icon">🔧</div>
            <div className="maintenance-details">
              <div className="maintenance-label">Last Maintenance</div>
              <div className="maintenance-value">{flightStatistics.lastMaintenance}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="action-button">
          <span className="action-icon">🧰</span>
          Run Diagnostics
        </button>
        
        <button className="action-button">
          <span className="action-icon">📊</span>
          Flight Logs
        </button>
        
        <button className="action-button">
          <span className="action-icon">🔄</span>
          Update Firmware
        </button>
        
        <button className="action-button">
          <span className="action-icon">🧭</span>
          Calibrate Sensors
        </button>
      </div>
    </div>
  );
}

export default MatriceStatus;
