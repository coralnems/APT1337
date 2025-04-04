import React from 'react';
import { Grid, Box, Paper, Typography } from '@mui/material';
import DroneStatus from './DroneStatus';
import DataGraph from './DataGraph';
import GPSCoordinates from './GPSCoordinates';
import VoiceControl from './VoiceControl';
import StatusPanel from './StatusPanel';
import VideoFeed from './VideoFeed';
import Telemetry from './Telemetry';
import AlertsPanel from './AlertsPanel';
import BatteryIndicator from './BatteryIndicator';
import MatriceControlPanel from './MatriceControlPanel';

const Dashboard = () => {
  const handleMatriceChange = (rows, columns) => {
    console.log(`Dashboard: Matrice dimensions changed to: ${rows}x${columns}`);
    // Update relevant components based on new dimensions
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Drone Control Dashboard
      </Typography>

      <Grid container spacing={2}>
        {/* Main video feed */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <VideoFeed />
          </Paper>
        </Grid>

        {/* Status indicators */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DroneStatus />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <BatteryIndicator />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Matrice Control Panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <MatriceControlPanel onMatriceChange={handleMatriceChange} />
          </Paper>
        </Grid>

        {/* GPS Coordinates */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <GPSCoordinates />
          </Paper>
        </Grid>

        {/* Telemetry Data */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Telemetry />
          </Paper>
        </Grid>

        {/* Alerts Panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <AlertsPanel />
          </Paper>
        </Grid>

        {/* Data Visualization */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <DataGraph />
          </Paper>
        </Grid>

        {/* Voice Control & Status Panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <VoiceControl />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <StatusPanel />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
