import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import DroneIcon from '@mui/icons-material/FlightTakeoff';
import MapIcon from '@mui/icons-material/Map';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';

import DroneStatus from './DroneStatus';
import MissionStatus from './MissionStatus';
import LiveMap from './LiveMap';
import DetectionFeed from './DetectionFeed';
import SearchPatterns from './SearchPatterns';
import ApiService from '../../services/ApiService';
import TelemetryPanel from './TelemetryPanel';
import EmergencyPanel from './EmergencyPanel';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [droneConnected, setDroneConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [detections, setDetections] = useState([]);
  const [missionActive, setMissionActive] = useState(false);
  const [searchPattern, setSearchPattern] = useState(null);
  const navigate = useNavigate();

  // Load system status when component mounts
  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getSystemStatus();
        setDroneConnected(response.data.connected);
        setError(null);
      } catch (err) {
        console.error('Failed to load status:', err);
        setError('Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  // Poll telemetry when drone is connected
  useEffect(() => {
    let intervalId;
    
    if (droneConnected) {
      intervalId = setInterval(async () => {
        try {
          const response = await ApiService.getTelemetry();
          setTelemetry(response.data.telemetry);
          
          // Update detections if available in telemetry
          if (response.data.telemetry.detections) {
            setDetections(response.data.telemetry.detections);
          }
        } catch (err) {
          console.error('Failed to fetch telemetry:', err);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [droneConnected]);

  const handleConnectDrone = async () => {
    try {
      setLoading(true);
      await ApiService.connectDrone({
        connectionType: 'Wi-Fi',
        ip: '192.168.0.1',
        port: 8080
      });
      setDroneConnected(true);
      setError(null);
    } catch (err) {
      setError('Failed to connect to drone');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectDrone = async () => {
    try {
      setLoading(true);
      await ApiService.disconnectDrone();
      setDroneConnected(false);
      setError(null);
    } catch (err) {
      setError('Failed to disconnect drone');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = async (patternData) => {
    try {
      setLoading(true);
      const mission = await ApiService.createMission({
        missionType: 'Search Grid',
        gridSize: patternData.size,
        altitude: patternData.altitude,
        speed: patternData.speed,
        captureInterval: patternData.captureInterval,
        useDirectionalCapture: true,
        useSpotlight: patternData.useSpotlight
      });
      
      await ApiService.uploadMission();
      await ApiService.startMission();
      
      setMissionActive(true);
      setSearchPattern(patternData);
      setError(null);
    } catch (err) {
      setError('Failed to start mission');
    } finally {
      setLoading(false);
    }
  };

  const handleStopMission = async () => {
    try {
      setLoading(true);
      await ApiService.returnToHome();
      setMissionActive(false);
      setError(null);
    } catch (err) {
      setError('Failed to stop mission');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DroneIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Search & Rescue Drone Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/mission')}>
            Mission Planner
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {error && (
        <Box sx={{ bgcolor: 'error.main', color: 'error.contrastText', p: 2, mb: 2 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, mx: 2 }}>
        <Grid container spacing={2}>
          {/* Drone Status Panel */}
          <Grid item xs={12} md={3}>
            <StyledPaper elevation={3}>
              <DroneStatus 
                connected={droneConnected}
                onConnect={handleConnectDrone}
                onDisconnect={handleDisconnectDrone}
                telemetry={telemetry}
                loading={loading}
              />
            </StyledPaper>
          </Grid>
          
          {/* Live Map Panel */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h6" gutterBottom>
                <MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Live Mapping & Tracking
              </Typography>
              <LiveMap 
                telemetry={telemetry} 
                detections={detections}
                searchPattern={searchPattern}
              />
            </StyledPaper>
          </Grid>
          
          {/* Mission Status Panel */}
          <Grid item xs={12} md={3}>
            <StyledPaper elevation={3}>
              <MissionStatus 
                active={missionActive} 
                telemetry={telemetry}
                onStop={handleStopMission}
              />
            </StyledPaper>
          </Grid>
          
          {/* Telemetry Panel */}
          <Grid item xs={12} md={3}>
            <StyledPaper elevation={3}>
              <TelemetryPanel telemetry={telemetry} />
            </StyledPaper>
          </Grid>
          
          {/* Detection Feed Panel */}
          <Grid item xs={12} md={5}>
            <StyledPaper elevation={3}>
              <Typography variant="h6" gutterBottom>
                <PersonSearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Detection Feed
              </Typography>
              <DetectionFeed 
                detections={detections} 
                isConnected={droneConnected}
              />
            </StyledPaper>
          </Grid>
          
          {/* Search Pattern Panel */}
          <Grid item xs={12} md={4}>
            <StyledPaper elevation={3}>
              <Typography variant="h6" gutterBottom>
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Search Patterns
              </Typography>
              <SearchPatterns 
                onStartMission={handleStartMission}
                disabled={!droneConnected || missionActive}
                loading={loading}
              />
            </StyledPaper>
          </Grid>
          
          {/* Emergency Panel */}
          <Grid item xs={12}>
            <StyledPaper elevation={3} sx={{ bgcolor: 'rgba(255, 0, 0, 0.05)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Emergency Controls
              </Typography>
              <EmergencyPanel 
                droneConnected={droneConnected}
                missionActive={missionActive}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
