import React from 'react';
import { Alert } from 'react-bootstrap';

export const TerraMappingSDK = ({ enabled, position, altitude }) => {
  if (!enabled) {
    return (
      <div className="terra-mapping-placeholder d-flex align-items-center justify-content-center h-100">
        <Alert variant="info" className="text-center">
          <h5>Terrain Mapping Disabled</h5>
          <p>Enable terrain mapping to start collecting data for DJI Terra integration.</p>
        </Alert>
      </div>
    );
  }
  
  // In a real implementation, this would show an actual mapping interface
  // or a 3D terrain model being built in real-time
  return (
    <div className="terra-mapping-active h-100">
      <div className="mapping-status-bar d-flex justify-content-between p-2 bg-dark text-light">
        <div>Mapping Active</div>
        <div>Position: {position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
        <div>Altitude: {altitude.toFixed(1)}m</div>
      </div>
      
      <div className="mapping-display" style={{ height: 'calc(100% - 40px)', backgroundColor: '#333', position: 'relative' }}>
        {/* This would be replaced with actual mapping visualization */}
        <div className="mapping-grid" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          perspective: '500px',
          perspectiveOrigin: 'center'
        }}>
          {/* Mock 3D point cloud representation */}
          {Array.from({length: 50}).map((_, i) => (
            <div 
              key={i} 
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                backgroundColor: 'rgba(0,255,200,0.7)',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateZ(${Math.random() * 20 - 10}px)`
              }}
            />
          ))}
        </div>
        
        <div className="mapping-info" style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px', color: 'white' }}>
          <div>Area mapped: 0.12 km²</div>
          <div>Points collected: 15,432</div>
          <div>Resolution: 2.0 cm/px</div>
          <div>Estimated time remaining: 12:45</div>
        </div>
      </div>
    </div>
  );
};
