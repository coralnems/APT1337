import React, { useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import DroneScene from '../MockDrone/DroneScene';
import MockMatriceDashboard from '../MockDrone/MockMatriceDashboard';

function Dashboard() {
  // Declare these variables for future implementation but disable ESLint warnings
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [connected, setConnected] = useState(false);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh' }}>
            <DroneScene />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
            <MockMatriceDashboard />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
