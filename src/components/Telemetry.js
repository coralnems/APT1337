import React, { useState, useEffect } from 'react';
import './Telemetry.css';

function Telemetry() {
  const [telemetryData, setTelemetryData] = useState({
    altitude: 0,
    speed: 0,
    heading: 0,
    latitude: 0,
    longitude: 0,
    batteryVoltage: 0,
    batteryPercent: 0,
    temperature: 0,
    signalStrength: 0
  });

  // Simulate telemetry data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData({
        altitude: Math.floor(Math.random() * 100) + 50,
        speed: Math.floor(Math.random() * 15) + 5,
        heading: Math.floor(Math.random() * 360),
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        batteryVoltage: 11.1 + Math.random(),
        batteryPercent: Math.floor(Math.random() * 30) + 50,
        temperature: Math.floor(Math.random() * 15) + 25,
        signalStrength: Math.floor(Math.random() * 20) + 80
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telemetry">
      <h2>Real-time Telemetry</h2>
      
      <div className="telemetry-grid">
        <div className="telemetry-item">
          <h3>Altitude</h3>
          <div className="telemetry-value">{telemetryData.altitude} m</div>
        </div>
        
        <div className="telemetry-item">
          <h3>Speed</h3>
          <div className="telemetry-value">{telemetryData.speed} m/s</div>
        </div>
        
        <div className="telemetry-item">
          <h3>Heading</h3>
          <div className="telemetry-value">{telemetryData.heading}°</div>
        </div>
        
        <div className="telemetry-item">
          <h3>GPS Coordinates</h3>
          <div className="telemetry-value">
            {telemetryData.latitude.toFixed(6)}, {telemetryData.longitude.toFixed(6)}
          </div>
        </div>
        
        <div className="telemetry-item">
          <h3>Battery</h3>
          <div className="telemetry-value">
            {telemetryData.batteryPercent}% ({telemetryData.batteryVoltage.toFixed(1)}V)
          </div>
          <div className="battery-bar">
            <div 
              className="battery-level" 
              style={{width: `${telemetryData.batteryPercent}%`}}
            ></div>
          </div>
        </div>
        
        <div className="telemetry-item">
          <h3>Temperature</h3>
          <div className="telemetry-value">{telemetryData.temperature}°C</div>
        </div>
        
        <div className="telemetry-item">
          <h3>Signal</h3>
          <div className="telemetry-value">{telemetryData.signalStrength}%</div>
          <div className="signal-bars">
            <div className={`bar ${telemetryData.signalStrength > 20 ? 'active' : ''}`}></div>
            <div className={`bar ${telemetryData.signalStrength > 40 ? 'active' : ''}`}></div>
            <div className={`bar ${telemetryData.signalStrength > 60 ? 'active' : ''}`}></div>
            <div className={`bar ${telemetryData.signalStrength > 80 ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Telemetry;
