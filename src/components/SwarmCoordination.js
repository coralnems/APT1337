import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  IconButton,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NearMeIcon from '@mui/icons-material/NearMe';
import GroupIcon from '@mui/icons-material/Group';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import './SwarmCoordination.css';

const DRONE_TYPES = {
  SCOUT: { name: 'Scout', color: '#2196f3', speed: 8, battery: 25, range: 2000 },
  MAPPER: { name: 'Mapper', color: '#4caf50', speed: 6, battery: 30, range: 1500 },
  SEARCHER: { name: 'Searcher', color: '#ff9800', speed: 7, battery: 35, range: 1800 },
  RELAY: { name: 'Relay', color: '#9c27b0', speed: 5, battery: 40, range: 2500 }
};

const FORMATIONS = [
  { id: 'line', name: 'Line Formation', description: 'Drones arranged in a straight line' },
  { id: 'triangle', name: 'Triangle Formation', description: 'Drones arranged in a triangle' },
  { id: 'grid', name: 'Grid Formation', description: 'Drones arranged in a grid pattern' },
  { id: 'circle', name: 'Circle Formation', description: 'Drones arranged in a circle' },
  { id: 'custom', name: 'Custom Formation', description: 'Custom drone arrangement' }
];

const mockDrones = [
  { id: 'drone-1', name: 'Alpha', type: 'SCOUT', battery: 92, status: 'active', position: { lat: 37.7851, lng: -122.4194 } },
  { id: 'drone-2', name: 'Beta', type: 'MAPPER', battery: 87, status: 'active', position: { lat: 37.7855, lng: -122.4189 } },
  { id: 'drone-3', name: 'Gamma', type: 'SEARCHER', battery: 78, status: 'active', position: { lat: 37.7845, lng: -122.4181 } },
  { id: 'drone-4', name: 'Delta', type: 'RELAY', battery: 95, status: 'standby', position: { lat: 37.7859, lng: -122.4176 } }
];

const SwarmCoordination = () => {
  const [drones, setDrones] = useState(mockDrones);
  const [selectedDrones, setSelectedDrones] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState('grid');
  const [formationSpacing, setFormationSpacing] = useState(20);
  const [missionActive, setMissionActive] = useState(false);
  const [communicationStatus, setCommunicationStatus] = useState('stable');
  const [communicationStrength, setCommunicationStrength] = useState(85);
  const [objective, setObjective] = useState('search');

  // Simulate communication fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const newStrength = Math.floor(Math.random() * 30) + 70; // 70-99%
      setCommunicationStrength(newStrength);
      
      if (newStrength < 75) {
        setCommunicationStatus('unstable');
      } else if (newStrength < 85) {
        setCommunicationStatus('moderate');
      } else {
        setCommunicationStatus('stable');
      }
      
      // Simulate battery drain
      setDrones(prevDrones => prevDrones.map(drone => ({
        ...drone,
        battery: Math.max(0, drone.battery - (Math.random() * 0.5))
      })));
      
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleDroneSelection = (droneId) => {
    setSelectedDrones(prev => {
      if (prev.includes(droneId)) {
        return prev.filter(id => id !== droneId);
      } else {
        return [...prev, droneId];
      }
    });
  };

  const selectAllDrones = () => {
    setSelectedDrones(drones.map(drone => drone.id));
  };

  const deselectAllDrones = () => {
    setSelectedDrones([]);
  };

  const launchSwarm = () => {
    setMissionActive(true);
    // In a real application, this would initiate the swarm mission
  };

  const recallSwarm = () => {
    setMissionActive(false);
    // In a real application, this would recall all drones
  };

  const getBatteryColor = (level) => {
    if (level > 70) return 'success';
    if (level > 30) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'standby': return 'info';
      case 'charging': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getCommunicationStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'success';
      case 'moderate': return 'warning';
      case 'unstable': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box className="swarm-coordination">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Swarm Coordination</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Communication:</Typography>
          <Chip 
            size="small" 
            label={`${communicationStatus} (${communicationStrength}%)`}
            color={getCommunicationStatusColor(communicationStatus)}
          />
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Available Drones</Typography>
              <Box>
                <Button size="small" onClick={selectAllDrones}>Select All</Button>
                <Button size="small" onClick={deselectAllDrones}>Clear</Button>
              </Box>
            </Box>
            
            <List className="drone-list">
              {drones.map(drone => (
                <ListItem 
                  key={drone.id}
                  secondaryAction={
                    <IconButton 
                      edge="end"
                      onClick={() => toggleDroneSelection(drone.id)}
                    >
                      {selectedDrones.includes(drone.id) ? 
                        <div className="selected-indicator">✓</div> : <div className="unselected-indicator">+</div>}
                    </IconButton>
                  }
                  sx={{ bgcolor: selectedDrones.includes(drone.id) ? 'rgba(25, 118, 210, 0.08)' : 'transparent' }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: DRONE_TYPES[drone.type].color,
                        width: 36, 
                        height: 36
                      }}
                    >
                      {drone.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {drone.name}
                        <Chip 
                          size="small" 
                          label={drone.status} 
                          color={getStatusColor(drone.status)} 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          {DRONE_TYPES[drone.type].name} | Battery:
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`${Math.round(drone.battery)}%`}
                          color={getBatteryColor(drone.battery)} 
                          sx={{ ml: 1 }}
                        />
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Swarm Configuration</Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="formation-select-label">Formation</InputLabel>
                  <Select
                    labelId="formation-select-label"
                    value={selectedFormation}
                    label="Formation"
                    onChange={(e) => setSelectedFormation(e.target.value)}
                  >
                    {FORMATIONS.map(formation => (
                      <MenuItem key={formation.id} value={formation.id}>
                        {formation.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <Typography id="spacing-slider" gutterBottom>
                    Spacing: {formationSpacing}m
                  </Typography>
                  <Slider
                    value={formationSpacing}
                    onChange={(e, value) => setFormationSpacing(value)}
                    step={5}
                    min={10}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="objective-select-label">Mission Objective</InputLabel>
                  <Select
                    labelId="objective-select-label"
                    value={objective}
                    label="Mission Objective"
                    onChange={(e) => setObjective(e.target.value)}
                  >
                    <MenuItem value="search">Search & Rescue</MenuItem>
                    <MenuItem value="mapping">Area Mapping</MenuItem>
                    <MenuItem value="perimeter">Perimeter Surveillance</MenuItem>
                    <MenuItem value="relay">Communication Relay</MenuItem>
                    <MenuItem value="custom">Custom Mission</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Search Area (GPS Coordinates)"
                  value="37.7849, -122.4194"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
            
            <Box className="formation-preview">
              <div className={`formation-visual ${selectedFormation}`}>
                {selectedDrones.map((droneId, index) => {
                  const drone = drones.find(d => d.id === droneId);
                  return (
                    <div 
                      key={drone.id}
                      className="drone-icon"
                      style={{ backgroundColor: DRONE_TYPES[drone.type].color }}
                      title={`${drone.name} (${DRONE_TYPES[drone.type].name})`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1">
                  Selected: {selectedDrones.length} / {drones.length} drones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated coverage: {selectedDrones.length * 100}m²
                </Typography>
              </Box>
              
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<SyncAltIcon />}
                  sx={{ mr: 1 }}
                  disabled={selectedDrones.length === 0 || missionActive}
                >
                  Synchronize
                </Button>
                
                <Button 
                  variant={missionActive ? "contained" : "outlined"}
                  color={missionActive ? "error" : "primary"}
                  startIcon={missionActive ? <NearMeIcon /> : <FlightTakeoffIcon />}
                  onClick={missionActive ? recallSwarm : launchSwarm}
                  disabled={selectedDrones.length === 0}
                >
                  {missionActive ? "Recall Swarm" : "Launch Swarm"}
                </Button>
              </Box>
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">Swarm Statistics</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Avg. Speed</Typography>
                <Typography variant="body1">
                  {selectedDrones.length > 0 ? 
                    (selectedDrones.reduce((acc, droneId) => {
                      const drone = drones.find(d => d.id === droneId);
                      return acc + DRONE_TYPES[drone.type].speed;
                    }, 0) / selectedDrones.length).toFixed(1) : 0} m/s
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Avg. Battery</Typography>
                <Typography variant="body1">
                  {selectedDrones.length > 0 ? 
                    (selectedDrones.reduce((acc, droneId) => {
                      const drone = drones.find(d => d.id === droneId);
                      return acc + drone.battery;
                    }, 0) / selectedDrones.length).toFixed(0) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Mission Range</Typography>
                <Typography variant="body1">
                  {selectedDrones.length > 0 ?
                    (Math.min(...selectedDrones.map(droneId => {
                      const drone = drones.find(d => d.id === droneId);
                      return DRONE_TYPES[drone.type].range;
                    }))).toFixed(0) : 0}m
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Mission Time</Typography>
                <Typography variant="body1">
                  {selectedDrones.length > 0 ?
                    (Math.min(...selectedDrones.map(droneId => {
                      const drone = drones.find(d => d.id === droneId);
                      return (drone.battery - 20) / 5; // Rough estimate
                    }))).toFixed(0) : 0} min
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SwarmCoordination;
