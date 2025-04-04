import React, { useState, useEffect } from 'react';
import './AlertsPanel.css';

function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // Mock alerts
  useEffect(() => {
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Battery level below 30%',
        timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      },
      {
        id: 2,
        type: 'info',
        message: 'GPS signal strength improved',
        timestamp: new Date(Date.now() - 12 * 60000) // 12 minutes ago
      },
      {
        id: 3,
        type: 'error',
        message: 'Connection temporarily lost',
        timestamp: new Date(Date.now() - 18 * 60000) // 18 minutes ago
      },
      {
        id: 4,
        type: 'info',
        message: 'Altitude limit set to 120m',
        timestamp: new Date(Date.now() - 45 * 60000) // 45 minutes ago
      },
      {
        id: 5,
        type: 'warning',
        message: 'Approaching maximum range',
        timestamp: new Date(Date.now() - 53 * 60000) // 53 minutes ago
      }
    ];
    
    setAlerts(mockAlerts);
    
    // Simulate new alert coming in
    const timeout = setTimeout(() => {
      setAlerts(prev => [
        {
          id: 6,
          type: 'info',
          message: 'Calibration completed successfully',
          timestamp: new Date()
        },
        ...prev
      ]);
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Format relative time
  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  // Filter alerts
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  return (
    <div className="alerts-panel">
      <h2>Alerts & Notifications</h2>
      
      <div className="alerts-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'error' ? 'active' : ''}
            onClick={() => setFilter('error')}
          >
            Errors
          </button>
          <button 
            className={filter === 'warning' ? 'active' : ''}
            onClick={() => setFilter('warning')}
          >
            Warnings
          </button>
          <button 
            className={filter === 'info' ? 'active' : ''}
            onClick={() => setFilter('info')}
          >
            Info
          </button>
        </div>
        
        <button className="clear-button">Clear All</button>
      </div>
      
      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">No alerts to display.</div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'error' && '❌'}
                {alert.type === 'warning' && '⚠️'}
                {alert.type === 'info' && 'ℹ️'}
              </div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-timestamp">{formatTime(alert.timestamp)}</div>
              </div>
              <button className="dismiss-button">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
