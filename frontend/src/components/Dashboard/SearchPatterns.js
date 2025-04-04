import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridOnIcon from '@mui/icons-material/GridOn';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TuneIcon from '@mui/icons-material/Tune';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

function SearchPatterns({ onStartMission, disabled, loading }) {
  const [patternType, setPatternType] = useState('grid');
  const [size, setSize] = useState(200);
  const [altitude, setAltitude] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [spacing, setSpacing] = useState(30);
  const [useSpotlight, setUseSpotlight] = useState(false);
  const [useInfrared, setUseInfrared] = useState(true);
  const [captureInterval, setCaptureInterval] = useState(0.5);

  const handleStartMission = () => {
    onStartMission({
      type: patternType,
      size,
      altitude,
      speed,
      spacing,
      useSpotlight,
      useInfrared,
      captureInterval
    });
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="pattern-type-label">Search Pattern</InputLabel>
        <Select
          labelId="pattern-type-label"
          id="pattern-type"
          value={patternType}
          label="Search Pattern"
          onChange={(e) => setPatternType(e.target.value)}
          disabled={disabled}
        >
          <MenuItem value="grid">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GridOnIcon sx={{ mr: 1 }} />
              Grid Pattern
            </Box>
          </MenuItem>
          <MenuItem value="spiral">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrackChangesIcon sx={{ mr: 1 }} />
              Spiral Pattern
            </Box>
          </MenuItem>
          <MenuItem value="expanding">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ mr: 1 }} />
              Expanding Square
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" gutterBottom>
        <TuneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        Mission Parameters
      </Typography>
      
      <Box sx={{ mb: 2, mt: 1 }}>
        <Typography gutterBottom>Area Size (m)</Typography>
        <Slider
          value={size}
          onChange={(e, newValue) => setSize(newValue)}
          min={50}
          max={500}
          step={50}
          marks={[
            { value: 50, label: '50m' },
            { value: 500, label: '500m' }
          ]}
          disabled={disabled}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Flight Altitude (m)</Typography>
        <Slider
          value={altitude}
          onChange={(e, newValue) => setAltitude(newValue)}
          min={10}
          max={120}
          step={5}
          marks={[
            { value: 10, label: '10m' },
            { value: 120, label: '120m' }
          ]}
          disabled={disabled}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Flight Speed (m/s)</Typography>
        <Slider
          value={speed}
          onChange={(e, newValue) => setSpeed(newValue)}
          min={1}
          max={10}
          step={0.5}
          marks={[
            { value: 1, label: '1m/s' },
            { value: 10, label: '10m/s' }
          ]}
          disabled={disabled}
          valueLabelDisplay="auto"
        />
      </Box>

      {patternType === 'grid' && (
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Grid Spacing (m)</Typography>
          <Slider
            value={spacing}
            onChange={(e, newValue) => setSpacing(newValue)}
            min={10}
            max={100}
            step={5}
            marks={[
              { value: 10, label: '10m' },
              { value: 100, label: '100m' }
            ]}
            disabled={disabled}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" gutterBottom>
        Detection Options
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useInfrared}
              onChange={(e) => setUseInfrared(e.target.checked)}
              disabled={disabled}
            />
          }
          label="Thermal Imaging"
        />
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useSpotlight}
              onChange={(e) => setUseSpotlight(e.target.checked)}
              disabled={disabled}
            />
          }
          label="Use Spotlight"
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Capture Interval (s)</Typography>
        <Slider
          value={captureInterval}
          onChange={(e, newValue) => setCaptureInterval(newValue)}
          min={0.1}
          max={2}
          step={0.1}
          marks={[
            { value: 0.1, label: '0.1s' },
            { value: 2, label: '2s' }
          ]}
          disabled={disabled}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleStartMission}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={20} /> : <FlightTakeoffIcon />}
        sx={{ mt: 2 }}
      >
        {loading ? 'Starting Mission...' : 'Start Mission'}
      </Button>
      
      {disabled && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Connect the drone to start a mission
        </Alert>
      )}
    </Box>
  );
}

export default SearchPatterns;
