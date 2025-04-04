import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Chip, Stack, Divider } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HomeIcon from '@mui/icons-material/Home';

function MissionStatus({ active, telemetry, onStop }) {
  const [missionTime, setMissionTime] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);

  // Update mission timer when mission is active
  useEffect(() => {
    let timer;
    if (active) {
      const startTime = Date.now() - missionTime * 1000;
      timer = setInterval(() => {
        setMissionTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [active, missionTime]);

  // Update detection count from telemetry
  useEffect(() => {
    if (telemetry && telemetry.detections) {
      setDetectionCount(telemetry.detections.length);
    }
  }, [telemetry]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate mission progress
  const getMissionProgress = () => {
    if (!telemetry || !telemetry.mission) return 0;
    return Math.round((telemetry.mission.completed / telemetry.mission.total) * 100);
  };
  
  const progress = getMissionProgress();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <FlightIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mission Status
      </Typography>

      {active ? (
        <Stack spacing={2}>
          <Box>
            <Chip 
              label="Mission Active" 
              color="success" 
              sx={{ px: 1 }} 
            />
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Mission Duration</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon sx={{ mr: 1 }} />
              <Typography variant="h6">{formatTime(missionTime)}</Typography>
            </Box>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="body2" color="text.secondary">Mission Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ my: 1, height: 10, borderRadius: 5 }} 
            />
            <Typography variant="body2" align="right">{progress}%</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Waypoints</Typography>
            <Typography>
              {telemetry && telemetry.mission ? 
                `${telemetry.mission.completed} / ${telemetry.mission.total}` : 
                'Loading...'}
            </Typography>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="body2" color="text.secondary">Current Speed</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon sx={{ mr: 1 }} />
              <Typography>{telemetry ? `${telemetry.speed} m/s` : '0 m/s'}</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Potential Detections</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonSearchIcon sx={{ mr: 1 }} color={detectionCount > 0 ? 'error' : 'inherit'} />
              <Typography>{detectionCount}</Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onStop}
            startIcon={<HomeIcon />}
          >
            Return To Home
          </Button>
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography>No active mission</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start a search pattern to begin a mission
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default MissionStatus;
