import React from 'react';
import { Row, Col, Table } from 'react-bootstrap';

export const MatriceTelemetry = ({ telemetryData }) => {
  return (
    <div className="matrice-telemetry">
      <Row>
        <Col md={6}>
          <h5>Flight Parameters</h5>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Altitude</td>
                <td>{telemetryData.altitude.toFixed(1)} m</td>
              </tr>
              <tr>
                <td>Speed</td>
                <td>{telemetryData.speed.toFixed(1)} m/s</td>
              </tr>
              <tr>
                <td>Heading</td>
                <td>{Math.round(telemetryData.heading)}° N</td>
              </tr>
              <tr>
                <td>Flight Time</td>
                <td>{telemetryData.flightTime}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
        
        <Col md={6}>
          <h5>Orientation</h5>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Roll</td>
                <td>{telemetryData.roll.toFixed(1)}°</td>
              </tr>
              <tr>
                <td>Pitch</td>
                <td>{telemetryData.pitch.toFixed(1)}°</td>
              </tr>
              <tr>
                <td>Yaw</td>
                <td>{telemetryData.yaw.toFixed(1)}°</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      
      <Row className="mt-3">
        <Col>
          <h5>Battery Status</h5>
          <div className="battery-indicator">
            <div className="battery-level">
              <div 
                className="battery-fill" 
                style={{ 
                  width: `${telemetryData.battery}%`,
                  backgroundColor: 
                    telemetryData.battery > 50 ? 'green' :
                    telemetryData.battery > 20 ? 'orange' : 'red'
                }}
              ></div>
            </div>
            <span className="battery-text">
              {Math.round(telemetryData.battery)}%
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};
