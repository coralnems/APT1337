import React from 'react';
import { Form } from 'react-bootstrap';

export const OmniDirectionalCapture = ({ enabled, toggleEnabled, captureInterval, updateInterval }) => {
  return (
    <div className="capture-settings">
      <Form.Group className="mb-3">
        <Form.Check 
          type="checkbox"
          id="directionalCaptureToggle"
          label={enabled ? "3-Directional Capture" : "Omni-Directional Capture"}
          checked={enabled}
          onChange={() => toggleEnabled()}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Capture Interval: {captureInterval}s</Form.Label>
        <Form.Range 
          min={0.1} 
          max={5} 
          step={0.1}
          value={captureInterval}
          onChange={(e) => updateInterval(parseFloat(e.target.value))}
        />
      </Form.Group>
      
      <p className="text-muted small">
        {enabled ? 
          "3-Directional mode captures images from front, left, and right angles." :
          "Omni-Directional mode captures 360-degree images at specified intervals."}
      </p>
    </div>
  );
};
