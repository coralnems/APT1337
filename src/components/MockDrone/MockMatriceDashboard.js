import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, LinearProgress } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SpeedIcon from '@mui/icons-material/Speed';
import TerrainIcon from '@mui/icons-material/Terrain';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

const MockMatriceDashboard = ({ droneController }) => {
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    altitude: 0,
    batteryLevel: 100,
    gpsSignal: 'Strong',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  });
  
  const [isFlying, setIsFlying] = useState(false);
  const [activeButtons, setActiveButtons] = useState({});
  
  useEffect(() => {
    if (droneController) {
      const intervalId = setInterval(() => {
        // Get telemetry data from the controller
        const newTelemetry = droneController.getTelemetry ? droneController.getTelemetry() : telemetry;
        setTelemetry(newTelemetry);
        
        // Update flight state from controller
        if (droneController.isFlying !== undefined) {
          setIsFlying(droneController.isFlying);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [droneController, telemetry]);
  
  const handleTakeoff = () => {
    if (droneController && droneController.takeoff) {
      droneController.takeoff();
      setIsFlying(true);
    } else {
      console.error("Takeoff function not available in drone controller");
    }
  };
  
  const handleLand = () => {
    if (droneController && droneController.land) {
      droneController.land();
    } else {
      console.error("Land function not available in drone controller");
    }
  };

  // Handle button press events for continuous control
  const handleButtonPress = (action) => {
    // Set button as active
    setActiveButtons(prev => ({ ...prev, [action]: true }));
    
    // Perform the initial action
    if (droneController && droneController[action]) {
      droneController[action]();
    }
    
    // Start continuous action if button is held
    const interval = setInterval(() => {
      if (droneController && droneController[action]) {
        droneController[action]();
      }
    }, 100);  // Repeat every 100ms
    
    return interval;
  };
  
  // Handle button release events
  const handleButtonRelease = (action, interval) => {
    // Clear the continuous action interval
    clearInterval(interval);
    
    // Mark button as inactive
    setActiveButtons(prev => ({ ...prev, [action]: false }));
  };

  const controlStyles = {
    padding: '12px',
    minWidth: '60px',
    height: '60px',
    margin: '6px',
    backgroundColor: '#2c3e50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#34495e'
    },
    '&:active': {
      backgroundColor: '#1a252f',
      transform: 'translateY(1px)'
    },
    transition: 'all 0.1s ease'
  };
  
  // Create a control button with touch/mouse events
  const ControlButton = ({ action, icon, disabled }) => {
    const [intervalId, setIntervalId] = useState(null);
    
    const handleMouseDown = () => {
      if (!disabled && droneController && droneController[action]) {
        const interval = handleButtonPress(action);
        setIntervalId(interval);
      }
    };
    
    const handleMouseUp = () => {
      if (intervalId) {
        handleButtonRelease(action, intervalId);
        setIntervalId(null);
      }
    };
    
    // Add touch events for mobile devices
    const handleTouchStart = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      handleMouseDown();
    };
    
    const handleTouchEnd = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      handleMouseUp();
    };

    return (
      <Button 
        variant="contained" 
        sx={{
          ...controlStyles,
          backgroundColor: activeButtons[action] ? '#1a5276' : '#2c3e50',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
      >
        {icon}
      </Button>
    );
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        DJI Matrice 300 RTK Controller
      </Typography>
      
      <Grid container spacing={2}>
        {/* Telemetry Display */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, background: '#f5f5f5' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box display="flex" alignItems="center">
                  <BatteryChargingFullIcon color={telemetry.batteryLevel > 20 ? "success" : "error"} />
                  <Box ml={1}>
                    <Typography variant="body2">Battery</Typography>
                    <Typography variant="h6">{telemetry.batteryLevel.toFixed(0)}%</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={telemetry.batteryLevel} 
                      color={telemetry.batteryLevel > 20 ? "success" : "error"} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box display="flex" alignItems="center">
                  <SpeedIcon />
                  <Box ml={1}>
                    <Typography variant="body2">Speed</Typography>
                    <Typography variant="h6">{telemetry.speed.toFixed(1)} m/s</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box display="flex" alignItems="center">
                  <TerrainIcon />
                  <Box ml={1}>
                    <Typography variant="body2">Altitude</Typography>
                    <Typography variant="h6">{telemetry.altitude.toFixed(1)} m</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <GpsFixedIcon color="primary" />
                  <Box ml={1}>
                    <Typography variant="body2">GPS Signal: {telemetry.gpsSignal}</Typography>
                    <Typography variant="body2">
                      Lat: {telemetry.coordinates.lat.toFixed(6)}, Lng: {telemetry.coordinates.lng.toFixed(6)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Flight Controls */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, background: '#f5f5f5' }}>
            <Typography variant="subtitle1" gutterBottom>Flight Controls</Typography>
            
            <Box display="flex" justifyContent="center" mb={2}>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<FlightTakeoffIcon />} 
                onClick={handleTakeoff}
                disabled={isFlying}
                sx={{ mr: 2 }}
              >
                Take Off
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<FlightLandIcon />} 
                onClick={handleLand}
                disabled={!isFlying}
              >
                Land
              </Button>
            </Box>
            
            <Grid container justifyContent="center">
              {/* Directional Controls */}
              <Grid item xs={12} sm={6} container justifyContent="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ControlButton
                    action="moveForward"
                    icon={<KeyboardArrowUpIcon />}
                    disabled={!isFlying}
                  />
                  
                  <Box display="flex">
                    <ControlButton
                      action="moveLeft"
                      icon={<KeyboardArrowLeftIcon />}
                      disabled={!isFlying}
                    />
                    
                    <ControlButton
                      action="moveBackward"
                      icon={<KeyboardArrowDownIcon />}
                      disabled={!isFlying}
                    />
                    
                    <ControlButton
                      action="moveRight"
                      icon={<KeyboardArrowRightIcon />}
                      disabled={!isFlying}
                    />
                  </Box>
                  
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Forward / Backward / Left / Right
                  </Typography>
                </Box>
              </Grid>
              
              {/* Altitude and Rotation Controls */}
              <Grid item xs={12} sm={6} container justifyContent="center">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ControlButton
                    action="moveUp"
                    icon={<Typography>Up</Typography>}
                    disabled={!isFlying}
                  />
                  
                  <Box display="flex">
                    <ControlButton
                      action="rotateCCW"
                      icon={<RotateLeftIcon />}
                      disabled={!isFlying}
                    />
                    
                    <Button 
                      variant="contained" 
                      sx={{...controlStyles, visibility: 'hidden'}}
                      disabled={true}
                    >
                      <KeyboardArrowDownIcon />
                    </Button>
                    
                    <ControlButton
                      action="rotateCW"
                      icon={<RotateRightIcon />}
                      disabled={!isFlying}
                    />
                  </Box>
                  
                  <ControlButton
                    action="moveDown"
                    icon={<Typography>Down</Typography>}
                    disabled={!isFlying}
                  />
                  
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Up / Down / Rotate
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mt={3} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Press and hold any control button for continuous movement
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Status Information */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 1, background: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="body2" color={isFlying ? "success.main" : "text.secondary"}>
              Status: {isFlying ? 'Flying' : 'Landed'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MockMatriceDashboard;
