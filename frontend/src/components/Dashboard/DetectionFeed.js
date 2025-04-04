import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import WarningIcon from '@mui/icons-material/Warning';

function DetectionFeed({ detections = [], isConnected }) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format detection time
  const formatDetectionTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  // Calculate accuracy color
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 85) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
        >
          <Tab label="All Detections" />
          <Tab 
            label={`High Priority (${detections.filter(d => d.confidence > 85).length})`}
            disabled={!detections.some(d => d.confidence > 85)} 
          />
        </Tabs>
      </Box>

      {!isConnected ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Drone not connected. Live detection feed unavailable.
        </Alert>
      ) : detections.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          flexGrow: 1
        }}>
          <PersonSearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No detections found yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detections will appear here when found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <Grid container spacing={2}>
            {detections
              .filter(detection => {
                // Filter based on selected tab
                if (tabValue === 0) return true;
                return detection.confidence > 85;
              })
              .map((detection, index) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      cursor: 'pointer',
                      bgcolor: selectedDetection === index ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => setSelectedDetection(index)}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        width: 120,
                        height: 90,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'black'
                      }}
                      // Use detection image if available, otherwise placeholder
                      image={detection.imageUrl || ''}
                    >
                      {!detection.imageUrl && (
                        <ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                      )}
                    </CardMedia>
                    
                    <CardContent sx={{ flexGrow: 1, p: 1, pb: '8px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {detection.type || 'Unknown Detection'}
                        </Typography>
                        <Chip
                          label={`${detection.confidence || 0}%`}
                          size="small"
                          color={getAccuracyColor(detection.confidence)}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {formatDetectionTime(detection.timestamp)}
                      </Typography>
                      
                      {detection.coordinates && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {detection.coordinates.latitude.toFixed(6)}, {detection.coordinates.longitude.toFixed(6)}
                        </Typography>
                      )}
                    </CardContent>
                    
                    {detection.urgent && (
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                        <WarningIcon color="error" />
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}
      
      {selectedDetection !== null && detections[selectedDetection] && (
        <Box sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Detection Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1">{detections[selectedDetection].type || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Confidence</Typography>
                <Typography variant="body1">{detections[selectedDetection].confidence || 0}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Time</Typography>
                <Typography variant="body1">{formatDetectionTime(detections[selectedDetection].timestamp)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Altitude</Typography>
                <Typography variant="body1">{detections[selectedDetection].altitude || 'Unknown'} m</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1">
                  {detections[selectedDetection].coordinates ? 
                    `${detections[selectedDetection].coordinates.latitude.toFixed(6)}, ${detections[selectedDetection].coordinates.longitude.toFixed(6)}` : 
                    'Unknown'}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined">Clear</Button>
              <Button variant="contained" color="primary">Mark as Important</Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default DetectionFeed;
