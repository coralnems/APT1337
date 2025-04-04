import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Grid
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PanToolIcon from '@mui/icons-material/PanTool';
import ErrorIcon from '@mui/icons-material/Error';
import ApiService from '../../services/ApiService';

function EmergencyPanel({ droneConnected, missionActive }) {
  const [openRTH, setOpenRTH] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRTH = async () => {
    setLoading(true);
    try {
      await ApiService.returnToHome();
      setOpenRTH(false);
    } catch (error) {
      console.error('Failed to execute RTH:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyStop = async () => {
    setLoading(true);
    try {
      await ApiService.emergencyStop();
      setOpenEmergency(false);
    } catch (error) {
      console.error('Failed to execute emergency stop:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            disabled={!droneConnected}
            onClick={() => setOpenRTH(true)}
            startIcon={<HomeIcon />}
            sx={{ py: 1.5 }}
          >
            Return to Home
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            disabled={!droneConnected}
            onClick={() => setOpenEmergency(true)}
            startIcon={<ErrorIcon />}
            sx={{ py: 1.5 }}
          >
            Emergency Stop
          </Button>
        </Grid>
      </Grid>

      {/* Return to Home Confirmation Dialog */}
      <Dialog
        open={openRTH}
        onClose={() => setOpenRTH(false)}
        aria-labelledby="rth-dialog-title"
      >
        <DialogTitle id="rth-dialog-title">
          Confirm Return to Home
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will end the current mission and command the drone to return to its home point. 
            Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRTH(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRTH} color="warning" disabled={loading} autoFocus>
            {loading ? 'Processing...' : 'Return to Home'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Stop Confirmation Dialog */}
      <Dialog
        open={openEmergency}
        onClose={() => setOpenEmergency(false)}
        aria-labelledby="emergency-dialog-title"
      >
        <DialogTitle id="emergency-dialog-title" sx={{ color: 'error.main' }}>
          <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Emergency Stop
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will immediately stop the motors and the drone will fall from its current position.
            Only use in case of absolute emergency when the risk of crashing is less than continuing flight.
            Continue with emergency stop?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmergency(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleEmergencyStop} color="error" disabled={loading} autoFocus>
            {loading ? 'Processing...' : 'Execute Emergency Stop'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmergencyPanel;
