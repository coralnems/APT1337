import React from 'react';
import { Row, Col } from 'react-bootstrap';

export const GNSSStatus = ({ signal, satellites, latitude, longitude }) => {
  return (
    <div className="gnss-status">
      <Row>
        <Col md={6}>
          <div className="signal-indicator">
            <div className="signal-label">Signal Quality:</div>
            <div className={`signal-status ${signal === 'Good' ? 'good' : 'poor'}`}>
              {signal}
            </div>
          </div>
          
          <div className="satellites-indicator mt-3">
            <div className="satellites-label">Satellites:</div>
            <div className="satellites-count">
              {satellites}
            </div>
          </div>
        </Col>
        
        <Col md={6}>
          <div className="coordinates">
            <div className="coordinate-item">
              <span className="coordinate-label">Latitude:</span>
              <span className="coordinate-value">{latitude.toFixed(6)}°</span>
            </div>
            
            <div className="coordinate-item mt-2">
              <span className="coordinate-label">Longitude:</span>
              <span className="coordinate-value">{longitude.toFixed(6)}°</span>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="mt-3">
        <Col>
          <div className="gnss-modes">
            <h6>Available GNSS Systems:</h6>
            <ul className="gnss-list">
              <li className="active">GPS</li>
              <li className="active">GLONASS</li>
              <li>Galileo</li>
              <li className="active">BeiDou</li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};
