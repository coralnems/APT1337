import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import HeightIcon from '@mui/icons-material/Height';
import ExploreIcon from '@mui/icons-material/Explore';
import BatteryIcon from '@mui/icons-material/BatteryFull';
import SignalIcon from '@mui/icons-material/SignalCellular4Bar';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

function TelemetryPanel({ telemetry }) {
  // Helper function to get battery color based on percentage
  const getBatteryColor = (percentage) => {
    if (percentage > 50) return '#4caf50';
    if (percentage > 20) return '#ff9800';
    return '#f44336';
  };

  // Format coordinates
  const formatCoordinates = (coordinates) => {
    if (!coordinates) return 'Unknown';
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
  };

  // Format distance
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return 'Unknown';
    return `${distance.toFixed(1)} m`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Telemetry Data
      </Typography>

      {!telemetry ? (
        <Typography color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          No telemetry data available
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <HeightIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Altitude
              </Typography>
              <Typography variant="h6">{telemetry.altitude || '0'} m</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <SpeedIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Speed
              </Typography>
              <Typography variant="h6">{telemetry.speed || '0'} m/s</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <ExploreIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Coordinates
              </Typography>
              <Typography variant="body1">{formatCoordinates(telemetry.coordinates)}</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <BatteryIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 0.5, 
                    verticalAlign: 'middle',
                    color: getBatteryColor(telemetry.battery)
                  }} 
                />
                Battery
              </Typography>
              <Typography variant="body1">{telemetry.battery || '0'}%</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <SignalIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Signal
              </Typography>
              <Typography variant="body1">{telemetry.signalStrength || '0'}%</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Distance to Home
              </Typography>
              <Typography variant="body1">{formatDistance(telemetry.homeDistance)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default TelemetryPanel;
