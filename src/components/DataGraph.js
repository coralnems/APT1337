import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonGroup, Button, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DataGraph = () => {
  const [dataType, setDataType] = useState('altitude');
  const [data, setData] = useState([]);

  // Generate mock data for the graph
  useEffect(() => {
    const generateData = () => {
      const newData = [];
      const now = new Date();
      
      for (let i = 20; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30000); // 30 sec intervals
        
        newData.push({
          time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          altitude: Math.floor(80 + Math.random() * 40), // 80-120m
          speed: Math.floor(15 + Math.random() * 15),    // 15-30m/s
          battery: Math.max(0, 100 - i * 1.5),          // Decreasing from 100%
          temperature: Math.floor(25 + Math.random() * 10) // 25-35°C
        });
      }
      
      return newData;
    };
    
    setData(generateData());
    
    // Update data periodically
    const interval = setInterval(() => {
      setData(prev => {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Remove oldest entry and add a new one
        const newData = [...prev.slice(1)];
        newData.push({
          time,
          altitude: Math.floor(80 + Math.random() * 40),
          speed: Math.floor(15 + Math.random() * 15),
          battery: Math.max(0, prev[prev.length - 1].battery - 0.1),
          temperature: Math.floor(25 + Math.random() * 10)
        });
        
        return newData;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getGraphColor = () => {
    switch(dataType) {
      case 'altitude': return '#8884d8';
      case 'speed': return '#82ca9d';
      case 'battery': return '#ffc658';
      case 'temperature': return '#ff8042';
      default: return '#8884d8';
    }
  };
  
  const getYAxisLabel = () => {
    switch(dataType) {
      case 'altitude': return 'Altitude (m)';
      case 'speed': return 'Speed (m/s)';
      case 'battery': return 'Battery (%)';
      case 'temperature': return 'Temperature (°C)';
      default: return '';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Telemetry Data</Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={() => setDataType('altitude')}
            variant={dataType === 'altitude' ? 'contained' : 'outlined'}
          >
            Altitude
          </Button>
          <Button 
            onClick={() => setDataType('speed')}
            variant={dataType === 'speed' ? 'contained' : 'outlined'}
          >
            Speed
          </Button>
          <Button 
            onClick={() => setDataType('battery')}
            variant={dataType === 'battery' ? 'contained' : 'outlined'}
          >
            Battery
          </Button>
          <Button 
            onClick={() => setDataType('temperature')}
            variant={dataType === 'temperature' ? 'contained' : 'outlined'}
          >
            Temperature
          </Button>
        </ButtonGroup>
      </Box>
      
      <Paper elevation={1} sx={{ p: 1, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataType}
              stroke={getGraphColor()}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default DataGraph;
