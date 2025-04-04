import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  Slider, 
  CircularProgress
} from '@mui/material';
import FlightModeSelector from './FlightModeSelector';
import DroneStatus from './DroneStatus';
import VideoFeed from './VideoFeed';
import BatteryIndicator from './BatteryIndicator';
import GPSCoordinates from './GPSCoordinates';

const DJIControlPanel = () => {
  const [connected, setConnected] = useState(false);
  const [flightMode, setFlightMode] = useState('normal');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [altitude, setAltitude] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const fetchDroneStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/drone/status');
        const { data } = response;
        
        setBatteryLevel(data.batteryLevel);
        setAltitude(data.altitude);
        setCoordinates(data.gps);
        setConnected(data.connected);
        setSpeed(data.speed);
      } catch (error) {
        console.error('Failed to fetch drone status:', error);
      }
    };

    const intervalId = setInterval(fetchDroneStatus, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/drone/connect');
      setConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to connect to drone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeoff = async () => {
    try {
      await axios.post('http://localhost:5000/api/drone/takeoff');
    } catch (error) {
      console.error('Failed to initiate takeoff:', error);
    }
  };

  const handleLand = async () => {
    try {
      await axios.post('http://localhost:5000/api/drone/land');
    } catch (error) {
      console.error('Failed to initiate landing:', error);
    }
  };

  const handleFlightModeChange = (mode) => {
    setFlightMode(mode);
    axios.post('http://localhost:5000/api/drone/mode', { mode })
      .catch(error => console.error('Failed to change flight mode:', error));
  };

  const handleAltitudeChange = (event, newValue) => {
    setAltitude(newValue);
    axios.post('http://localhost:5000/api/drone/altitude', { altitude: newValue })
      .catch(error => console.error('Failed to change altitude:', error));
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        DJI Drone Control Panel
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <VideoFeed connected={connected} />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <DroneStatus 
              connected={connected} 
              altitude={altitude}
              speed={speed}
              flightMode={flightMode}
            />
            <Box sx={{ mt: 3 }}>
              <BatteryIndicator level={batteryLevel} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <GPSCoordinates coordinates={coordinates} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Flight Controls
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color={connected ? "error" : "success"}
              fullWidth
              disabled={loading}
              onClick={handleConnect}
              sx={{ mb: 2, height: '50px' }}
            >
              {loading ? <CircularProgress size={24} /> : (connected ? "Disconnect" : "Connect")}
            </Button>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  disabled={!connected}
                  onClick={handleTakeoff}
                  sx={{ height: '50px' }}
                >
                  Takeoff
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  color="warning" 
                  fullWidth
                  disabled={!connected}
                  onClick={handleLand}
                  sx={{ height: '50px' }}
                >
                  Land
                </Button>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography id="altitude-slider" gutterBottom>
              Altitude (m): {altitude}
            </Typography>
            <Slider
              value={altitude}
              min={0}
              max={120}
              step={1}
              onChange={handleAltitudeChange}
              disabled={!connected}
              aria-labelledby="altitude-slider"
            />
            
            <Box sx={{ mt: 3 }}>
              <FlightModeSelector 
                value={flightMode}
                onChange={handleFlightModeChange}
                disabled={!connected}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DJIControlPanel;
