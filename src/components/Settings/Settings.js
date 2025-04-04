import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    renderQuality: 'medium',
    showTelemetry: true,
    darkMode: false,
    autoConnect: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    // Save settings to local storage or API
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="settings-container">
      <h2>Application Settings</h2>
      
      <div className="settings-form">
        <div className="form-group">
          <label>Render Quality</label>
          <select 
            name="renderQuality" 
            value={settings.renderQuality}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="showTelemetry"
              checked={settings.showTelemetry}
              onChange={handleChange}
            />
            Show Telemetry
          </label>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleChange}
            />
            Dark Mode
          </label>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="autoConnect"
              checked={settings.autoConnect}
              onChange={handleChange}
            />
            Auto-connect to Drone
          </label>
        </div>
        
        <button onClick={handleSave} className="save-button">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
