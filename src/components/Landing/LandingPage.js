import React from 'react';
import { Box, Button, Container, Grid, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const LandingPage = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 140px)', // Adjusted to account for header and footer
        pt: 8, // Padding to account for fixed app bar
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('/assets/drone-hero.jpg')`,
          minHeight: '400px',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography component="h1" variant="h2" color="inherit" gutterBottom>
                Mission Critical Support
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Advanced drone technology for emergency response teams. Real-time monitoring, 
                accurate data collection, and immediate deployment.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/dashboard"
                endIcon={<KeyboardArrowRightIcon />}
                sx={{ mt: 2, alignSelf: 'flex-start' }}
              >
                Access Dashboard
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 6 }}>
          Our Professional Drone Solutions
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <FlightTakeoffIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Real-Time Monitoring
              </Typography>
              <Typography>
                Live data streaming and analytics from any mission location. 
                Monitor drone telemetry, flight path, and sensor data in real-time.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                component={RouterLink}
                to="/dashboard"
              >
                Learn More
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <FlightTakeoffIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Emergency Response
              </Typography>
              <Typography>
                Rapid deployment systems for emergency situations. Assess situations from
                safe distances and make informed decisions with aerial intelligence.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                component={RouterLink}
                to="/dji-control"
              >
                Learn More
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <FlightTakeoffIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                3D Visualization
              </Typography>
              <Typography>
                Advanced 3D mapping and terrain modeling for critical operations.
                Create accurate digital twins and visualizations of any environment.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                component={RouterLink}
                to="/3d-models"
              >
                Learn More
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
