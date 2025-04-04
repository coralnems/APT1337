# Testing Instructions for Mission Planner

## Setup

1. Start the local server for logo fetching and API functionality:
   ```
   python server.py
   ```

2. Open the application in your browser:
   ```
   http://localhost:8000
   ```

## Test Scenarios

### 1. Basic Login Test

1. You should see the government warning popup first. Click "I Acknowledge"
2. Click on an agency logo to select your agency
3. Login with the following credentials:
   - Username: `police_user`
   - Password: `police123`
   - Agency: `Police Department` (should be pre-selected if you clicked the logo)
4. Verify the dashboard loads with the agency logo in the sidebar

### 2. Mission Management

1. View existing missions in the Active Missions tab
2. Click "Create New Mission" to switch to the Mission Planning tab
3. Fill out the mission form with test data
4. Save the mission and verify it appears in the Active Missions list
5. Click on the mission to edit it

### 3. Map Functionality

1. Click on the "Map View" tab
2. Test adding a marker by clicking the "Add Point" button and then clicking on the map
3. Test adding a route by clicking "Add Route" and clicking several points on the map, then double-click to finish
4. Test adding an area by clicking "Add Area" and clicking several points to create a polygon, then double-click to finish
5. Click "Save" to save your map data

### 4. Communications Test

1. Click on the "Communications" tab
2. Type a test message and click Send
3. Verify the message appears in the message area
4. Check that the sender name and agency are displayed correctly

### 5. Resources View

1. Click on the "Resources" tab
2. Verify that personnel, equipment, and vehicles for your agency are displayed

### 6. Reports Test

1. Click on the "Reports" tab
2. Select a report type from the dropdown
3. Click "Generate Report" and verify content appears in the output area

### 7. Logout Test

1. Click the Logout button in the top-right corner
2. Verify you're returned to the login screen

## Troubleshooting

### Logo Display Issues

If agency logos don't appear:
1. Check that the Python server is running
2. Look for errors in the browser console
3. The application will fall back to placeholder logos if the server isn't available

### Map Loading Issues

If the map doesn't load:
1. Make sure you have an internet connection for the map tiles
2. Check browser console for Leaflet-related errors
3. Try clicking on a different tab and then back to the Map tab

### API Connection Errors

If you see API errors in the console:
1. Verify the server is running on port 8000
2. Check server console for any Python errors
3. The application has fallbacks for most server-dependent functionality
