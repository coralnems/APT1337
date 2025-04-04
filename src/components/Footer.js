import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <img 
              src={`${process.env.PUBLIC_URL}/logos/logo.png`}
              alt="VorteX Logo" 
              style={{ 
                height: '30px',
                marginRight: '10px'
              }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'center', sm: 'center' } }}>
            <Typography variant="body2" color="text.secondary">
              {'© '}
              <Link color="inherit" href="https://vortex-technologies.com/">
                VorteX Technologies
              </Link>{' '}
              {new Date().getFullYear()}
              {'. All rights reserved.'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              Mission Critical Support
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
