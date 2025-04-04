import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard/Dashboard';
import MissionPlanner from './components/MissionPlanner/MissionPlanner';
import ApiTest from './components/ApiTest';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Create theme with dark mode support
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    emergency: {
      main: '#ff3d00',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/test" element={<ApiTest />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/mission" element={
              <ProtectedRoute>
                <MissionPlanner />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;