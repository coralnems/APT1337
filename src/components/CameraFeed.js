import React, { useState } from 'react';
import './CameraFeed.css';

function CameraFeed() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedView, setSelectedView] = useState('main');
  
  // Placeholder image URLs
  const cameraFeeds = {
    main: "https://via.placeholder.com/800x450/333/fff?text=Main+Camera+Feed",
    thermal: "https://via.placeholder.com/800x450/333/fff?text=Thermal+Camera+Feed",
    downward: "https://via.placeholder.com/800x450/333/fff?text=Downward+Camera",
    rear: "https://via.placeholder.com/800x450/333/fff?text=Rear+Camera"
  };

  return (
    <div className="camera-feed">
      <h2>Camera Feed</h2>
      
      <div className="camera-container">
        <div className="main-feed">
          <img 
            src={cameraFeeds[selectedView]} 
            alt={`${selectedView} camera feed`} 
          />
          
          <div className="camera-overlay">
            <div className="camera-info">
              <span>{selectedView.toUpperCase()} CAMERA</span>
              <span className={isRecording ? "recording" : ""}>
                {isRecording ? "REC 00:12:36" : "STANDBY"}
              </span>
            </div>
            
            <div className="camera-grid">
              <div className="grid-line horizontal"></div>
              <div className="grid-line vertical"></div>
              <div className="grid-circle"></div>
            </div>
            
            <div className="camera-telemetry">
              <div>ALT: 65m</div>
              <div>SPD: 12.6m/s</div>
              <div>HEAD: 243°</div>
            </div>
          </div>
        </div>
        
        <div className="camera-controls">
          <div className="view-selector">
            <button 
              className={selectedView === 'main' ? 'active' : ''}
              onClick={() => setSelectedView('main')}
            >
              Main
            </button>
            <button 
              className={selectedView === 'thermal' ? 'active' : ''}
              onClick={() => setSelectedView('thermal')}
            >
              Thermal
            </button>
            <button 
              className={selectedView === 'downward' ? 'active' : ''}
              onClick={() => setSelectedView('downward')}
            >
              Downward
            </button>
            <button 
              className={selectedView === 'rear' ? 'active' : ''}
              onClick={() => setSelectedView('rear')}
            >
              Rear
            </button>
          </div>
          
          <div className="action-controls">
            <button 
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button>Take Photo</button>
            <button>Toggle Night Mode</button>
          </div>
          
          <div className="camera-settings">
            <div className="setting">
              <label>Zoom:</label>
              <input type="range" min="1" max="10" defaultValue="1" />
            </div>
            
            <div className="setting">
              <label>Exposure:</label>
              <input type="range" min="-3" max="3" defaultValue="0" />
            </div>
            
            <div className="setting">
              <label>Contrast:</label>
              <input type="range" min="0" max="10" defaultValue="5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraFeed;
