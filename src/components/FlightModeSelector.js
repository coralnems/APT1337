import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FlightModeSelector = ({ value, onChange, disabled }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="flight-mode-label">Flight Mode</InputLabel>
      <Select
        labelId="flight-mode-label"
        id="flight-mode-select"
        value={value}
        label="Flight Mode"
        onChange={handleChange}
      >
        <MenuItem value="normal">Normal</MenuItem>
        <MenuItem value="sport">Sport</MenuItem>
        <MenuItem value="cinematic">Cinematic</MenuItem>
        <MenuItem value="tripod">Tripod</MenuItem>
      </Select>
    </FormControl>
  );
};

export default FlightModeSelector;
