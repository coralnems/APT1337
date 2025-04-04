import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export const EmergencyProtocols = ({ isConnected, returnToHome, emergencyStop }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState(null);
  
  const handleEmergencyAction = (actionType) => {
    setAction(actionType);
    setShowConfirmation(true);
  };
  
  const confirmAction = () => {
    if (action === 'rth') {
      returnToHome();
    } else if (action === 'stop') {
      emergencyStop();
    }
    setShowConfirmation(false);
  };
  
  return (
    <>
      <Button 
        variant="warning" 
        className="mx-1" 
        onClick={() => handleEmergencyAction('rth')}
        disabled={!isConnected}
      >
        Return to Home
      </Button>
      
      <Button 
        variant="danger" 
        className="mx-1" 
        onClick={() => handleEmergencyAction('stop')}
        disabled={!isConnected}
      >
        EMERGENCY STOP
      </Button>
      
      <Modal 
        show={showConfirmation} 
        onHide={() => setShowConfirmation(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 'rth' ? 'Return to Home' : 'Emergency Stop'} Confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {action === 'rth' ? 
            'Are you sure you want to abort the mission and return to home?' : 
            'Are you sure you want to execute an emergency stop? This will immediately halt drone operations.'
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button 
            variant={action === 'rth' ? "warning" : "danger"} 
            onClick={confirmAction}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
