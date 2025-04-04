import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';

const DroneStatus = () => {
  const [status, setStatus] = useState({
    isConnected: true,
    isFlying: false,
    signalStrength: 85,
    mode: 'Standby'
  });

  // Simulating status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        signalStrength: Math.floor(Math.random() * 40) + 60, // 60-99
        mode: prev.isFlying ? 
          ['Hovering', 'Moving', 'Returning Home'][Math.floor(Math.random() * 3)] : 
          'Standby'
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleFlyingStatus = () => {
    setStatus(prev => ({
      ...prev,
      isFlying: !prev.isFlying,
      mode: !prev.isFlying ? 'Taking off' : 'Landing'
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Drone Status
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Connection:
        </Typography>
        <Chip 
          icon={status.isConnected ? <SignalCellularAltIcon /> : <SignalCellularConnectedNoInternet0BarIcon />} 
          label={status.isConnected ? 'Connected' : 'Disconnected'}
          color={status.isConnected ? 'success' : 'error'}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Status:
        </Typography>
        <Chip 
          icon={status.isFlying ? <FlightTakeoffIcon /> : <FlightLandIcon />}
          label={status.isFlying ? 'In Flight' : 'Landed'}
          color={status.isFlying ? 'primary' : 'default'}
          onClick={toggleFlyingStatus}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Mode:
        </Typography>
        <Chip label={status.mode} />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Signal:
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress 
            variant="determinate" 
            value={status.signalStrength} 
            color={status.signalStrength > 70 ? 'success' : status.signalStrength > 40 ? 'warning' : 'error'} 
          />
          <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="caption" component="div" color="text.secondary">
              {`${Math.round(status.signalStrength)}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DroneStatus;
