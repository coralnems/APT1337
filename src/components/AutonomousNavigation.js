import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Slider, 
  FormControl, 
  InputLabel,
  MenuItem,
  Select,
  Divider,
  TextField,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import MapIcon from '@mui/icons-material/Map';
import './AutonomousNavigation.css';

const AutonomousNavigation = () => {
  const [navigationMode, setNavigationMode] = useState('grid');
  const [searchGrid, setSearchGrid] = useState({
    width: 500, // meters
    height: 500, // meters
    spacing: 50, // meters
    altitude: 80, // meters
  });
  const [waypoints, setWaypoints] = useState([
    { id: 1, lat: 37.7749, lng: -122.4194, alt: 80, action: 'hover', duration: 10 },
    { id: 2, lat: 37.7755, lng: -122.4185, alt: 100, action: 'scan', duration: 30 },
    { id: 3, lat: 37.7765, lng: -122.4175, alt: 60, action: 'photograph', duration: 5 }
  ]);
  const [missionActive, setMissionActive] = useState(false);
  const [algorithmSettings, setAlgorithmSettings] = useState({
    detectionThreshold: 75,
    overlapPercentage: 30,
    returnThreshold: 20, // battery percentage
    avoidanceDistance: 5 // meters
  });

  const handleGridChange = (prop) => (event, value) => {
    setSearchGrid({
      ...searchGrid,
      [prop]: value !== undefined ? value : Number(event.target.value)
    });
  };

  const handleAlgorithmChange = (prop) => (event, value) => {
    setAlgorithmSettings({
      ...algorithmSettings,
      [prop]: value !== undefined ? value : Number(event.target.value)
    });
  };

  const addWaypoint = () => {
    // Add a new waypoint based on the last one
    const lastWaypoint = waypoints[waypoints.length - 1] || {
      lat: 37.7749, lng: -122.4194, alt: 80, action: 'hover', duration: 10
    };
    
    const newWaypoint = {
      id: Date.now(),
      lat: lastWaypoint.lat + 0.001 * (Math.random() - 0.5),
      lng: lastWaypoint.lng + 0.001 * (Math.random() - 0.5),
      alt: lastWaypoint.alt,
      action: 'hover',
      duration: 10
    };
    
    setWaypoints([...waypoints, newWaypoint]);
  };

  const deleteWaypoint = (id) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const updateWaypoint = (id, prop, value) => {
    setWaypoints(waypoints.map(wp => {
      if (wp.id === id) {
        return { ...wp, [prop]: value };
      }
      return wp;
    }));
  };

  const toggleMission = () => {
    setMissionActive(!missionActive);
  };

  const renderNavigationControls = () => {
    switch (navigationMode) {
      case 'grid':
        return (
          <Box className="nav-controls">
            <Typography variant="subtitle1">Grid Search Parameters</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography id="width-slider" gutterBottom>
                  Width: {searchGrid.width}m
                </Typography>
                <Slider
                  value={searchGrid.width}
                  onChange={handleGridChange('width')}
                  step={50}
                  min={100}
                  max={2000}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography id="height-slider" gutterBottom>
                  Height: {searchGrid.height}m
                </Typography>
                <Slider
                  value={searchGrid.height}
                  onChange={handleGridChange('height')}
                  step={50}
                  min={100}
                  max={2000}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography id="spacing-slider" gutterBottom>
                  Row Spacing: {searchGrid.spacing}m
                </Typography>
                <Slider
                  value={searchGrid.spacing}
                  onChange={handleGridChange('spacing')}
                  step={5}
                  min={20}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography id="altitude-slider" gutterBottom>
                  Altitude: {searchGrid.altitude}m
                </Typography>
                <Slider
                  value={searchGrid.altitude}
                  onChange={handleGridChange('altitude')}
                  step={5}
                  min={20}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>
            <Box className="grid-preview">
              <div className="grid-pattern" style={{
                backgroundSize: `${100 * (searchGrid.spacing / searchGrid.width)}% ${100 * (searchGrid.spacing / searchGrid.height)}%`
              }}></div>
              <Typography variant="caption">
                Grid pattern: {Math.ceil(searchGrid.width / searchGrid.spacing)} x {Math.ceil(searchGrid.height / searchGrid.spacing)} lines
              </Typography>
            </Box>
          </Box>
        );
      
      case 'waypoint':
        return (
          <Box className="nav-controls">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Waypoint Navigation</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                size="small"
                onClick={addWaypoint}
              >
                Add Waypoint
              </Button>
            </Box>
            
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {waypoints.map((wp, index) => (
                  <ListItem 
                    key={wp.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => deleteWaypoint(wp.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`Waypoint ${index + 1}`}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span">
                            Lat: {wp.lat.toFixed(6)}, Lng: {wp.lng.toFixed(6)}, Alt: {wp.alt}m
                          </Typography>
                          <br />
                          <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={wp.action}
                                onChange={(e) => updateWaypoint(wp.id, 'action', e.target.value)}
                              >
                                <MenuItem value="hover">Hover</MenuItem>
                                <MenuItem value="scan">Scan Area</MenuItem>
                                <MenuItem value="photograph">Photograph</MenuItem>
                                <MenuItem value="return">Return Home</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField
                              size="small"
                              label="Duration"
                              type="number"
                              value={wp.duration}
                              onChange={(e) => updateWaypoint(wp.id, 'duration', Number(e.target.value))}
                              InputProps={{ inputProps: { min: 0, max: 300 }, endAdornment: 's' }}
                              sx={{ width: 100 }}
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        );
      
      case 'thermal':
        return (
          <Box className="nav-controls">
            <Typography variant="subtitle1">Thermal Anomaly Detection</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography id="threshold-slider" gutterBottom>
                  Detection Threshold: {algorithmSettings.detectionThreshold}%
                </Typography>
                <Slider
                  value={algorithmSettings.detectionThreshold}
                  onChange={handleAlgorithmChange('detectionThreshold')}
                  step={5}
                  min={50}
                  max={95}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  This mode uses thermal imaging to automatically detect heat signatures and investigate potential human presence.
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <div className="thermal-preview">
                <div className="thermal-gradient"></div>
                <div className="thermal-threshold" style={{ left: `${algorithmSettings.detectionThreshold}%` }}></div>
              </div>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box className="autonomous-navigation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Autonomous Navigation</Typography>
        
        <Box>
          <Button 
            variant={missionActive ? "contained" : "outlined"}
            color={missionActive ? "error" : "primary"}
            startIcon={missionActive ? <StopIcon /> : <PlayArrowIcon />}
            onClick={toggleMission}
          >
            {missionActive ? "Stop Mission" : "Start Mission"}
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="navigation-mode-label">Navigation Mode</InputLabel>
          <Select
            labelId="navigation-mode-label"
            value={navigationMode}
            label="Navigation Mode"
            onChange={(e) => setNavigationMode(e.target.value)}
          >
            <MenuItem value="grid">Grid Search Pattern</MenuItem>
            <MenuItem value="waypoint">Waypoint Navigation</MenuItem>
            <MenuItem value="thermal">Thermal Anomaly Detection</MenuItem>
            <MenuItem value="lidar">LiDAR Terrain Following</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {renderNavigationControls()}
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1">Advanced Settings</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography id="overlap-slider" gutterBottom>
            Image Overlap: {algorithmSettings.overlapPercentage}%
          </Typography>
          <Slider
            value={algorithmSettings.overlapPercentage}
            onChange={handleAlgorithmChange('overlapPercentage')}
            step={5}
            min={10}
            max={80}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={6}>
          <Typography id="return-slider" gutterBottom>
            Return to Home at: {algorithmSettings.returnThreshold}% battery
          </Typography>
          <Slider
            value={algorithmSettings.returnThreshold}
            onChange={handleAlgorithmChange('returnThreshold')}
            step={5}
            min={10}
            max={50}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography id="avoidance-slider" gutterBottom>
            Obstacle Avoidance Distance: {algorithmSettings.avoidanceDistance}m
          </Typography>
          <Slider
            value={algorithmSettings.avoidanceDistance}
            onChange={handleAlgorithmChange('avoidanceDistance')}
            step={1}
            min={2}
            max={20}
            valueLabelDisplay="auto"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button startIcon={<MapIcon />} variant="outlined">
          Open Map View
        </Button>
        <Button startIcon={<SaveIcon />} variant="contained">
          Save Mission
        </Button>
      </Box>
    </Box>
  );
};

export default AutonomousNavigation;
