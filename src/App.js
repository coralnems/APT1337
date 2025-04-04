import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';

// Critical components loaded directly
import LandingPage from './components/Landing/LandingPage';

// Lazy load non-critical components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const DJIControl = lazy(() => import('./components/DJIControl/DJIControl'));
const ThreeDModels = lazy(() => import('./components/3DModels/ThreeDModels'));
const Settings = lazy(() => import('./components/Settings/Settings'));

// Loading component for suspense fallback
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress />
  </Box>
);

// Create a responsive theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Component for preloading
function PreloadComponents() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
    
    // Preload components based on current route
    if (location.pathname === '/') {
      // On landing page - preload Dashboard which is likely next
      import('./components/Dashboard/Dashboard');
    } else if (location.pathname === '/dashboard') {
      // On dashboard - preload DJIControl and 3D Models which may be needed next
      import('./components/DJIControl/DJIControl');
      import('./components/3DModels/ThreeDModels');
    }
  }, [location]);

  return null;
}

function App({ ssrMode = false }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <PreloadComponents />
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dji-control" element={<DJIControl />} />
            <Route path="/3d-models" element={
              // Only activate 3D rendering if not in SSR mode
              ssrMode ? <Box sx={{ padding: 4 }}>3D Models will load after hydration</Box> : <ThreeDModels />
            } />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
