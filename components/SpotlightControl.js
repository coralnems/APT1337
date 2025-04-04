import React, { useState } from 'react';
import { Button, Form, Card } from 'react-bootstrap';

export const SpotlightControl = ({ isConnected, initialActive = false }) => {
  const [isActive, setIsActive] = useState(initialActive);
  const [brightness, setBrightness] = useState(80);
  
  const toggleSpotlight = () => {
    if (!isConnected) return;
    setIsActive(!isActive);
    
    // In production would send command to drone
    console.log(`AL1 Spotlight ${!isActive ? 'activated' : 'deactivated'} at ${brightness}% brightness`);
  };
  
  const handleBrightnessChange = (e) => {
    const value = parseInt(e.target.value);
    setBrightness(value);
    
    if (isActive && isConnected) {
      // In production would send command to update brightness
      console.log(`AL1 Spotlight brightness set to ${value}%`);
    }
  };
  
  return (
    <Card>
      <Card.Header>AL1 Spotlight Control</Card.Header>
      <Card.Body>
        <Button 
          variant={isActive ? 'warning' : 'outline-warning'} 
          className="w-100 mb-3"
          onClick={toggleSpotlight}
          disabled={!isConnected}
        >
          {isActive ? 'Deactivate Spotlight' : 'Activate Spotlight'}
        </Button>
        
        <Form.Label>Brightness: {brightness}%</Form.Label>
        <Form.Range 
          min={0} 
          max={100} 
          value={brightness}
          onChange={handleBrightnessChange}
          disabled={!isConnected || !isActive}
        />
      </Card.Body>
    </Card>
  );
};
