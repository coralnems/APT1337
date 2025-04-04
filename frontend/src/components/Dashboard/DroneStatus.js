import React from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Stack, Divider } from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

function DroneStatus({ connected, onConnect, onDisconnect, telemetry, loading }) {
  // Format battery percentage with correct color
  const getBatteryColor = (percentage) => {
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  // Format signal strength color
  const getSignalColor = (strength) => {
    if (strength > 80) return 'success';
    if (strength > 40) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <FlightTakeoffIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Drone Status
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : connected ? (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label="Connected" 
              color="success" 
              variant="outlined" 
              sx={{ px: 1 }} 
            />
          </Box>
          
          {telemetry ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Battery</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BatteryFullIcon color={getBatteryColor(telemetry.battery)} sx={{ mr: 1 }} />
                  <Typography>{telemetry.battery}%</Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">Signal Strength</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SignalCellularAltIcon color={getSignalColor(telemetry.signalStrength)} sx={{ mr: 1 }} />
                  <Typography>{telemetry.signalStrength}%</Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">Altitude</Typography>
                <Typography variant="h6">{telemetry.altitude} m</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Speed</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon sx={{ mr: 1 }} />
                  <Typography>{telemetry.speed} m/s</Typography>
                </Box>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{telemetry.status || 'Hovering'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Camera</Typography>
                <Typography variant="body1">{telemetry.cameraMode || 'Standard'}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">Temperature</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DeviceThermostatIcon sx={{ mr: 1 }} />
                  <Typography>{telemetry.temperature || '25'}°C</Typography>
                </Box>
              </Box>
            </Stack>
          ) : (
            <Typography>Waiting for telemetry data...</Typography>
          )}
          
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onDisconnect}
            sx={{ mt: 2 }}
            startIcon={<FlightLandIcon />}
          >
            Disconnect Drone
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" gutterBottom>
            Drone is not connected
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onConnect}
            sx={{ mt: 2 }}
            startIcon={<FlightTakeoffIcon />}
            disabled={loading}
          >
            Connect Drone
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DroneStatus;
