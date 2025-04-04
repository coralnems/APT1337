import React from 'react';
import { Button, ButtonGroup, Card } from 'react-bootstrap';

export const DroneControls = ({ isConnected, onStart, onPause, onStop, onRTH }) => {
  return (
    <Card>
      <Card.Header>Flight Controls</Card.Header>
      <Card.Body>
        <ButtonGroup className="d-flex mb-3">
          <Button 
            variant="success" 
            disabled={!isConnected} 
            onClick={onStart}
          >
            Start Mission
          </Button>
          <Button 
            variant="warning" 
            disabled={!isConnected} 
            onClick={onPause}
          >
            Pause Mission
          </Button>
          <Button 
            variant="secondary" 
            disabled={!isConnected} 
            onClick={onStop}
          >
            End Mission
          </Button>
        </ButtonGroup>
        
        <Button 
          variant="primary" 
          className="w-100" 
          disabled={!isConnected} 
          onClick={onRTH}
        >
          Return to Home
        </Button>
      </Card.Body>
    </Card>
  );
};
