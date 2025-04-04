import React, { useState, useEffect } from 'react';
import MatriceControls from './MatriceControls';
import MatriceTelemetry from './MatriceTelemetry';
import PayloadManager from './PayloadManager';
import MissionPlanner from './MissionPlanner';
import MatriceCamera from './MatriceCamera';
import MatriceStatus from './MatriceStatus';
import './MatriceDashboard.css';

// Mock Matrice 4 API integration
const MatriceAPI = {
  initialize: () => {
    console.log('Initializing Matrice 4 Series API connection');
    return Promise.resolve({ status: 'success', deviceId: 'M4-329872' });
  },
  connect: () => {
    console.log('Connecting to Matrice 4 Series drone');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          status: 'connected', 
          serialNumber: 'M4X10045372', 
          firmware: '01.05.0600' 
        });
      }, 1500);
    });
  },
  disconnect: () => {
    console.log('Disconnecting from Matrice 4 Series drone');
    return Promise.resolve({ status: 'disconnected' });
  },
  fetchTelemetry: () => {
    return Promise.resolve({
      altitude: Math.floor(Math.random() * 120) + 30,
      speed: Math.floor(Math.random() * 15) + 2,
      batteryLevel: Math.floor(Math.random() * 20) + 75,
      heading: Math.floor(Math.random() * 360),
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      signalStrength: Math.floor(Math.random() * 15) + 85,
    });
  }
};

function MatriceDashboard() {
  const [activeTab, setActiveTab] = useState('status');
  const [droneConnected, setDroneConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [flightMode, setFlightMode] = useState('manual');
  
  // Initialize API on component mount
  useEffect(() => {
    MatriceAPI.initialize().then(response => {
      console.log('Matrice API initialized:', response);
    });
  }, []);
  
  // Poll for telemetry data when connected
  useEffect(() => {
    let telemetryInterval;
    
    if (droneConnected) {
      telemetryInterval = setInterval(() => {
        MatriceAPI.fetchTelemetry().then(data => {
          setTelemetry(data);
        });
      }, 1000);
    }
    
    return () => {
      if (telemetryInterval) clearInterval(telemetryInterval);
    };
  }, [droneConnected]);

  // Handle drone connection
  const handleConnect = async () => {
    if (!droneConnected) {
      try {
        const connectionResponse = await MatriceAPI.connect();
        setConnectionInfo(connectionResponse);
        setDroneConnected(true);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    } else {
      await MatriceAPI.disconnect();
      setDroneConnected(false);
      setConnectionInfo(null);
    }
  };
  
  // Handle flight mode changes
  const handleFlightModeChange = (mode) => {
    setFlightMode(mode);
  };
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'controls':
        return <MatriceControls 
                  isConnected={droneConnected} 
                  flightMode={flightMode} 
                  onFlightModeChange={handleFlightModeChange} 
               />;
      case 'telemetry':
        return <MatriceTelemetry data={telemetry} />;
      case 'payload':
        return <PayloadManager isConnected={droneConnected} />;
      case 'mission':
        return <MissionPlanner isConnected={droneConnected} />;
      case 'camera':
        return <MatriceCamera isConnected={droneConnected} />;
      case 'status':
      default:
        return <MatriceStatus 
                  isConnected={droneConnected} 
                  connectionInfo={connectionInfo}
                  telemetry={telemetry}
               />;
    }
  };

  return (
    <div className="matrice-dashboard">
      <header className="matrice-header">
        <div className="matrice-logo">
          <span className="logo-icon">⬚</span>
          <h1>Matrice 4 Dashboard</h1>
        </div>
        
        <div className="connection-controls">
          <div className="connection-status">
            <div className={`status-indicator ${droneConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{droneConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <button 
            className={`connect-button ${droneConnected ? 'disconnect' : 'connect'}`}
            onClick={handleConnect}
          >
            {droneConnected ? 'Disconnect' : 'Connect to Matrice 4'}
          </button>
        </div>
      </header>
      
      <div className="matrice-container">
        <nav className="matrice-sidebar">
          <div className="drone-info">
            {connectionInfo && (
              <>
                <div className="drone-model">Matrice 4 Series</div>
                <div className="drone-serial">SN: {connectionInfo.serialNumber}</div>
                <div className="drone-firmware">FW: {connectionInfo.firmware}</div>
              </>
            )}
          </div>
          
          <ul className="nav-menu">
            <li 
              className={activeTab === 'status' ? 'active' : ''} 
              onClick={() => setActiveTab('status')}
            >
              <span className="nav-icon">📊</span>
              Status Overview
            </li>
            <li 
              className={activeTab === 'controls' ? 'active' : ''} 
              onClick={() => setActiveTab('controls')}
            >
              <span className="nav-icon">🎮</span>
              Flight Controls
            </li>
            <li 
              className={activeTab === 'telemetry' ? 'active' : ''} 
              onClick={() => setActiveTab('telemetry')}
            >
              <span className="nav-icon">📡</span>
              Telemetry
            </li>
            <li 
              className={activeTab === 'payload' ? 'active' : ''} 
              onClick={() => setActiveTab('payload')}
            >
              <span className="nav-icon">🔧</span>
              Payload Management
            </li>
            <li 
              className={activeTab === 'mission' ? 'active' : ''} 
              onClick={() => setActiveTab('mission')}
            >
              <span className="nav-icon">🗺️</span>
              Mission Planning
            </li>
            <li 
              className={activeTab === 'camera' ? 'active' : ''} 
              onClick={() => setActiveTab('camera')}
            >
              <span className="nav-icon">📷</span>
              Camera Controls
            </li>
          </ul>
          
          {droneConnected && telemetry && (
            <div className="quick-telemetry">
              <div className="telemetry-item">
                <span className="telemetry-label">Battery</span>
                <span className="telemetry-value">{telemetry.batteryLevel}%</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">Altitude</span>
                <span className="telemetry-value">{telemetry.altitude}m</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">Signal</span>
                <span className="telemetry-value">{telemetry.signalStrength}%</span>
              </div>
            </div>
          )}
          
          <div className="emergency-controls">
            <button className="emergency-stop">EMERGENCY STOP</button>
            <button className="return-home">RETURN TO HOME</button>
          </div>
        </nav>
        
        <main className="matrice-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default MatriceDashboard;
