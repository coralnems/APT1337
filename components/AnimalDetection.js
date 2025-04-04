import React from 'react';
import { Alert } from 'react-bootstrap';

export const AnimalDetection = ({ enabled, detections }) => {
  if (!enabled) {
    return (
      <div className="detection-placeholder d-flex align-items-center justify-content-center h-100">
        <Alert variant="info" className="text-center">
          <h5>Detection Feed Unavailable</h5>
          <p>Connect to drone to enable detection feed.</p>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="detection-feed h-100">
      <div className="feed-display" style={{ 
        height: '100%', 
        backgroundColor: '#111', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Simulated camera feed - would be a real video feed in production */}
        <div className="camera-feed" style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://via.placeholder.com/800x600/333333/666666?text=Camera+Feed)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Overlay detection boxes */}
          {detections.slice(0, 3).map((detection, index) => (
            <div 
              key={detection.id}
              className="detection-box"
              style={{
                position: 'absolute',
                border: `3px solid ${
                  detection.type === 'Person' ? 'red' :
                  detection.type === 'Animal' ? 'orange' : 'blue'
                }`,
                width: `${30 + Math.random() * 20}%`,
                height: `${20 + Math.random() * 30}%`,
                top: `${10 + (index * 25) + Math.random() * 20}%`,
                left: `${10 + (index * 20) + Math.random() * 40}%`,
                borderRadius: '4px',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                pointerEvents: 'none'
              }}
            >
              <div style={{
                backgroundColor: `${
                  detection.type === 'Person' ? 'rgba(255,0,0,0.7)' :
                  detection.type === 'Animal' ? 'rgba(255,165,0,0.7)' : 'rgba(0,0,255,0.7)'
                }`,
                color: 'white',
                padding: '2px 5px',
                fontSize: '12px',
                position: 'absolute',
                top: '-20px',
                left: '0'
              }}>
                {detection.type} ({detection.confidence}%)
              </div>
            </div>
          ))}
        </div>
        
        <div className="detection-overlay" style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.5)', 
          padding: '10px',
          color: 'white',
          borderRadius: '5px'
        }}>
          <div>Detection Active</div>
          <div>Objects detected: {detections.length}</div>
          <div>Processing: 25 FPS</div>
        </div>
      </div>
    </div>
  );
};
