#!/bin/bash

# Start backend in background
echo "Starting Flask backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
cd api
python app.py &
BACKEND_PID=$!

# Start frontend in foreground 
echo "Starting frontend..."
cd ../frontend
# Fix node_modules issues before starting
if [ -d "node_modules" ]; then
  echo "Cleaning old node_modules to prevent conflicts..."
  rm -rf node_modules
fi
npm install
# Add this to identify and fix eslint conflicts
echo "Checking for eslint conflicts..."
npm ls eslint-plugin-react || true
npm start

# When frontend process is terminated, also kill the backend
kill $BACKEND_PID
