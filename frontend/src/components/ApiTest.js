import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService.js';
import Login from './Login.js';

function ApiTest() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mappingActive, setMappingActive] = useState(false);
  const [mappingStats, setMappingStats] = useState(null);
  const [mappingMode, setMappingMode] = useState('2D Map');
  const [resolution, setResolution] = useState('Medium');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Add debugging
  console.log('ApiTest component rendered');
  
  useEffect(() => {
    if (isAuthenticated) {
      // Check system status when component mounts
      console.log('Calling checkStatus...');
      checkStatus();
    }
  }, [isAuthenticated]);
  
  const checkStatus = async () => {
    try {
      console.log('Checking system status...');
      setLoading(true);
      const response = await ApiService.getSystemStatus();
      console.log('Status response:', response);
      setStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error checking status:', err);
      setError('Failed to connect to API: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMockMode = async () => {
    try {
      setLoading(true);
      const newMode = status?.mockMode ? 'PRODUCTION' : 'MOCK';
      const response = await ApiService.setMode(newMode);
      setStatus({...status, mockMode: response.data.mockMode});
      setError(null);
    } catch (err) {
      setError('Failed to toggle mock mode: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const startMapping = async () => {
    try {
      setLoading(true);
      await ApiService.startMapping({
        mode: mappingMode,
        resolution: resolution
      });
      setMappingActive(true);
      setError(null);
      getMappingStats();
    } catch (err) {
      setError('Failed to start mapping: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const stopMapping = async () => {
    try {
      setLoading(true);
      await ApiService.stopMapping();
      setMappingActive(false);
      setError(null);
    } catch (err) {
      setError('Failed to stop mapping: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const getMappingStats = async () => {
    try {
      const response = await ApiService.getMappingStatus();
      setMappingStats(response.data);
      setMappingActive(response.data.active);
    } catch (err) {
      console.error('Error getting mapping stats:', err);
    }
  };

  // Handle successful login
  const handleLogin = (token) => {
    setIsAuthenticated(true);
    checkStatus(); // Check status after login
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setStatus(null);
    setMappingActive(false);
    setMappingStats(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="api-test">
      <h1>API Test Panel</h1>
      
      <div className="auth-section">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="status-section">
        <h2>System Status</h2>
        {loading ? (
          <p>Loading...</p>
        ) : status ? (
          <div>
            <p>Mode: {status.mockMode ? 'MOCK' : 'PRODUCTION'}</p>
            <p>Connected: {status.connected ? 'Yes' : 'No'}</p>
            <p>Timestamp: {status.timestamp}</p>
            <button onClick={toggleMockMode}>
              Switch to {status.mockMode ? 'PRODUCTION' : 'MOCK'} Mode
            </button>
            <button onClick={checkStatus}>
              Refresh Status
            </button>
          </div>
        ) : (
          <div>
            <p>No status data (API may be unreachable)</p>
            <button onClick={checkStatus}>
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="mapping-section">
        <h2>Mapping Controls</h2>
        <div className="mapping-controls">
          <label>
            Mode:
            <select 
              value={mappingMode}
              onChange={(e) => setMappingMode(e.target.value)}
              disabled={mappingActive}
            >
              <option value="2D Map">2D Map</option>
              <option value="3D Model">3D Model</option>
              <option value="Terrain">Terrain</option>
            </select>
          </label>
          
          <label>
            Resolution:
            <select 
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              disabled={mappingActive}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          
          {!mappingActive ? (
            <button 
              onClick={startMapping}
              disabled={loading}
            >
              Start Mapping
            </button>
          ) : (
            <button 
              onClick={stopMapping}
              disabled={loading}
            >
              Stop Mapping
            </button>
          )}
        </div>
        
        {mappingStats && (
          <div className="mapping-stats">
            <h3>Mapping Statistics</h3>
            <p>Active: {mappingStats.active ? 'Yes' : 'No'}</p>
            <p>Area Covered: {(mappingStats.areaCovered * 100).toFixed(1)}%</p>
            <p>Images Captured: {mappingStats.imagesCaptured}</p>
            <p>Estimated Completion: {mappingStats.estimatedCompletion}</p>
            <p>Resolution: {mappingStats.resolution}</p>
            <p>Mode: {mappingStats.mode}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiTest;
