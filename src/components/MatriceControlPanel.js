import React, { useState } from 'react';
import './MatriceControlPanel.css';

const MatriceControlPanel = ({ onMatriceChange }) => {
  const [dimensions, setDimensions] = useState({
    rows: 3,
    columns: 3
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDimensions({
      ...dimensions,
      [name]: parseInt(value, 10) || 1
    });
  };

  const applyChanges = () => {
    onMatriceChange(dimensions.rows, dimensions.columns);
  };

  return (
    <div className="matrice-control-panel">
      <div className="panel-header">
        <h3>Matrice Control Panel</h3>
        <img 
          src={`${process.env.PUBLIC_URL}/logos/dji-matrice.png`}
          alt="DJI Matrice Logo"
          className="panel-logo"
        />
      </div>
      <div className="control-group">
        <label>
          Rows:
          <input
            type="number"
            name="rows"
            min="1"
            max="10"
            value={dimensions.rows}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="control-group">
        <label>
          Columns:
          <input
            type="number"
            name="columns"
            min="1"
            max="10"
            value={dimensions.columns}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <button onClick={applyChanges}>Apply</button>
    </div>
  );
};

export default MatriceControlPanel;
