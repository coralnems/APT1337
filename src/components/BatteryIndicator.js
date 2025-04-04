import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery30Icon from '@mui/icons-material/Battery30';

const BatteryIndicator = ({ level }) => {
  const getBatteryIcon = () => {
    if (level <= 15) return <BatteryAlertIcon color="error" />;
    if (level <= 40) return <Battery30Icon color="warning" />;
    if (level <= 70) return <Battery60Icon color="info" />;
    return <BatteryFullIcon color="success" />;
  };

  const getBatteryColor = () => {
    if (level <= 15) return 'error';
    if (level <= 40) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getBatteryIcon()}
        <Typography>
          Battery Level: {level}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={level} 
        color={getBatteryColor()}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

export default BatteryIndicator;
