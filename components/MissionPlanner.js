import React, { useState } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

export const MissionPlanner = ({ isConnected, onGenerateMission }) => {
  const [missionType, setMissionType] = useState('Search Grid');
  const [gridSize, setGridSize] = useState(100);
  const [altitude, setAltitude] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [captureInterval, setCaptureInterval] = useState(0.5);
  const [useDirectionalCapture, setUseDirectionalCapture] = useState(true);
  const [useSpotlight, setUseSpotlight] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const missionParams = {
      missionType,
      gridSize,
      altitude,
      speed,
      captureInterval,
      useDirectionalCapture,
      useSpotlight
    };
    
    onGenerateMission(missionParams);
  };
  
  return (
    <div className="mission-planner">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Mission Type</Form.Label>
          <Form.Select 
            value={missionType} 
            onChange={(e) => setMissionType(e.target.value)}
            disabled={!isConnected}
          >
            <option>Search Grid</option>
            <option>Object Tracking</option>
            <option>Area Mapping</option>
            <option>Perimeter Patrol</option>
          </Form.Select>
        </Form.Group>
        
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Grid Size (m)</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  min="10" 
                  max="1000"
                  disabled={!isConnected}
                />
                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col>
            <Form.Group>
              <Form.Label>Altitude (m)</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  value={altitude}
                  onChange={(e) => setAltitude(Number(e.target.value))}
                  min="10" 
                  max="500"
                  disabled={!isConnected}
                />
                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Speed (m/s)</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  min="1" 
                  max="15"
                  step="0.5"
                  disabled={!isConnected}
                />
                <InputGroup.Text>m/s</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col>
            <Form.Group>
              <Form.Label>Capture Interval (s)</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  value={captureInterval}
                  onChange={(e) => setCaptureInterval(Number(e.target.value))}
                  min="0.1" 
                  max="10"
                  step="0.1"
                  disabled={!isConnected}
                />
                <InputGroup.Text>s</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            id="directionalCapture"
            label="Enable 3-Directional Capture"
            checked={useDirectionalCapture}
            onChange={(e) => setUseDirectionalCapture(e.target.checked)}
            disabled={!isConnected}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            id="spotlightUse"
            label="Enable AL1 Spotlight"
            checked={useSpotlight}
            onChange={(e) => setUseSpotlight(e.target.checked)}
            disabled={!isConnected}
          />
        </Form.Group>
        
        <Button 
          variant="primary" 
          type="submit"
          disabled={!isConnected}
          className="w-100"
        >
          Generate Mission Plan
        </Button>
      </Form>
    </div>
  );
};
