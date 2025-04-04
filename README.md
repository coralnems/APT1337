# 3D Visualization Platform with DJI Drone Control

This project provides a 3D visualization platform with a DJI drone control interface.

## Features

- DJI drone control panel
- Live video feed from drone
- Battery and GPS status monitoring
- Flight mode selection
- Altitude control

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

To run both the frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5000

You can also run them separately:

```bash
# Frontend only
npm start

# Backend only
npm run server
```

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/drone/status` - Get current drone status
- `POST /api/drone/connect` - Connect/disconnect from the drone
- `POST /api/drone/takeoff` - Initiate drone takeoff
- `POST /api/drone/land` - Initiate drone landing
- `POST /api/drone/mode` - Change flight mode
- `POST /api/drone/altitude` - Change drone altitude

## Development

This project uses React for the frontend and Express for the backend. The frontend communicates with the backend using axios.

## Dependencies

- React
- Material-UI
- Express
- Axios
- Concurrently (dev dependency for running frontend and backend simultaneously)
