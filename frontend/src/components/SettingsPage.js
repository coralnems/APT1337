import React from 'react';
import { Container, Typography } from '@mui/material';

function SettingsPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Here you can modify drone settings.
      </Typography>
      {/* Add settings form elements here */}
    </Container>
  );
}

export default SettingsPage;
