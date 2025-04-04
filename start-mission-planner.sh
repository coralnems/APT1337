#!/bin/bash

# Start mission_planner/server.py in background
echo "Starting Mission Planner server..."
cd /home/soldering/Videos/3D
python mission_planner/server.py &
MISSION_SERVER_PID=$!

# Wait for server to start
sleep 2
echo "Mission Planner server running on http://localhost:8000"

# Start frontend in foreground without HOST variable
echo "Starting frontend..."
cd frontend
BROWSER=none npm start

# When frontend process is terminated, also kill the server
kill $MISSION_SERVER_PID
