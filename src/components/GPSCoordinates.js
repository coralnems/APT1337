import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HeightIcon from '@mui/icons-material/Height';

const GPSCoordinates = () => {
  const [gpsData, setGpsData] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 120,
    speed: 15,
    heading: 275,
    satellites: 9,
    timestamp: new Date().toISOString(),
    accuracy: 3.2
  });

  // Simulate changing GPS data
  useEffect(() => {
    const interval = setInterval(() => {
      setGpsData(prev => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        altitude: Math.max(0, prev.altitude + (Math.random() - 0.5) * 5),
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 2),
        heading: (prev.heading + Math.random() * 5) % 360,
        satellites: Math.floor(Math.random() * 4) + 8, // 8-11 satellites
        timestamp: new Date().toISOString(),
        accuracy: Math.max(1, prev.accuracy + (Math.random() - 0.5) * 0.5)
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Format coordinates to be more readable
  const formatCoordinate = (coord, isLatitude) => {
    const direction = isLatitude 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    
    const absCoord = Math.abs(coord);
    const degrees = Math.floor(absCoord);
    const minutes = Math.floor((absCoord - degrees) * 60);
    const seconds = ((absCoord - degrees) * 60 - minutes) * 60;
    
    return `${degrees}° ${minutes}' ${seconds.toFixed(1)}" ${direction}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">GPS Coordinates</Typography>
        <Chip 
          size="small" 
          label={`${gpsData.satellites} satellites`} 
          color="primary" 
          sx={{ ml: 'auto' }} 
        />
      </Box>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Latitude</Typography>
            <Typography variant="body1">{formatCoordinate(gpsData.latitude, true)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Longitude</Typography>
            <Typography variant="body1">{formatCoordinate(gpsData.longitude, false)}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">Altitude</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeightIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body1">{gpsData.altitude.toFixed(1)} m</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">Speed</Typography>
            <Typography variant="body1">{gpsData.speed.toFixed(1)} m/s</Typography>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">Heading</Typography>
            <Typography variant="body1">{gpsData.heading.toFixed(0)}°</Typography>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">Accuracy</Typography>
            <Typography variant="body1">±{gpsData.accuracy.toFixed(1)} m</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Last updated: {new Date(gpsData.timestamp).toLocaleTimeString()}
        </Typography>
        <MyLocationIcon color="action" fontSize="small" sx={{ ml: 1 }} />
      </Box>
    </Box>
  );
};

export default GPSCoordinates;
