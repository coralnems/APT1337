import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Switch, 
  FormControlLabel, 
  Slider, 
  Button, 
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    dataUpdateFrequency: 5,
    videoQuality: 'high',
    connectionType: 'wifi',
    autoSave: true,
    language: 'en'
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: value !== undefined ? value : checked
    });
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setSettings({
      ...settings,
      [name]: newValue
    });
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    // Here you would typically save to localStorage or make an API call
    alert('Settings saved successfully!');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Application Settings</Typography>
        <Button variant="contained" color="primary" onClick={saveSettings}>
          Save Settings
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Interface Settings</Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.darkMode} 
              onChange={handleChange} 
              name="darkMode" 
            />
          }
          label="Dark Mode"
        />
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={settings.language}
              label="Language"
              name="language"
              onChange={handleChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="zh">Chinese</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Data Settings</Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.notifications} 
              onChange={handleChange} 
              name="notifications" 
            />
          }
          label="Enable Notifications"
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={settings.autoSave} 
              onChange={handleChange} 
              name="autoSave" 
            />
          }
          label="Auto Save Data"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography id="data-frequency-slider" gutterBottom>
            Data Update Frequency: {settings.dataUpdateFrequency} seconds
          </Typography>
          <Slider
            aria-labelledby="data-frequency-slider"
            value={settings.dataUpdateFrequency}
            onChange={handleSliderChange('dataUpdateFrequency')}
            min={1}
            max={60}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Video Settings</Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="video-quality-label">Video Quality</InputLabel>
          <Select
            labelId="video-quality-label"
            id="video-quality"
            value={settings.videoQuality}
            label="Video Quality"
            name="videoQuality"
            onChange={handleChange}
          >
            <MenuItem value="low">Low (480p)</MenuItem>
            <MenuItem value="medium">Medium (720p)</MenuItem>
            <MenuItem value="high">High (1080p)</MenuItem>
            <MenuItem value="ultra">Ultra (4K)</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth>
          <InputLabel id="connection-type-label">Connection Type</InputLabel>
          <Select
            labelId="connection-type-label"
            id="connection-type"
            value={settings.connectionType}
            label="Connection Type"
            name="connectionType"
            onChange={handleChange}
          >
            <MenuItem value="wifi">Wi-Fi</MenuItem>
            <MenuItem value="cellular">Cellular</MenuItem>
            <MenuItem value="satellite">Satellite</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all settings to default?')) {
              setSettings({
                darkMode: false,
                notifications: true,
                dataUpdateFrequency: 5,
                videoQuality: 'high',
                connectionType: 'wifi',
                autoSave: true,
                language: 'en'
              });
            }
          }}
          sx={{ mr: 2 }}
        >
          Reset to Default
        </Button>
        
        <Button variant="contained" color="primary" onClick={saveSettings}>
          Save Settings
        </Button>
      </Box>
    </Paper>
  );
};

export default Settings;
