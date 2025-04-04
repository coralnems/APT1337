// Map handling functionality

let map;
let markers = [];
let routes = [];
let areas = [];
let drawingMode = null;
let tempPoints = [];

// Initialize the map
function initMap() {
    if (map) return; // Map already initialized
    
    const mapContainer = document.getElementById('mission-map');
    
    // Default map center (can be adjusted based on mission location)
    const defaultCenter = [34.0522, -118.2437]; // Los Angeles
    
    // Create map
    map = L.map('mission-map').setView(defaultCenter, 13);
    
    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add map controls
    setupMapControls();
    
    // Load any existing map data if we have an active mission
    loadMissionMapData();
}

// Setup map control buttons
function setupMapControls() {
    const addMarkerBtn = document.getElementById('add-marker');
    const addRouteBtn = document.getElementById('add-route');
    const addAreaBtn = document.getElementById('add-area');
    const saveMapBtn = document.getElementById('save-map');
    
    // Add marker button
    addMarkerBtn.addEventListener('click', function() {
        setDrawingMode('marker');
        this.classList.add('active');
        addRouteBtn.classList.remove('active');
        addAreaBtn.classList.remove('active');
    });
    
    // Add route button
    addRouteBtn.addEventListener('click', function() {
        setDrawingMode('route');
        this.classList.add('active');
        addMarkerBtn.classList.remove('active');
        addAreaBtn.classList.remove('active');
        tempPoints = [];
    });
    
    // Add area button
    addAreaBtn.addEventListener('click', function() {
        setDrawingMode('area');
        this.classList.add('active');
        addMarkerBtn.classList.remove('active');
        addRouteBtn.classList.remove('active');
        tempPoints = [];
    });
    
    // Save map button
    saveMapBtn.addEventListener('click', function() {
        saveMapData();
    });
    
    // Map click handler
    map.on('click', handleMapClick);
}

// Set the current drawing mode
function setDrawingMode(mode) {
    drawingMode = mode;
    
    if (mode) {
        map.getContainer().style.cursor = 'crosshair';
    } else {
        map.getContainer().style.cursor = '';
    }
}

// Handle map click based on drawing mode
function handleMapClick(e) {
    if (!drawingMode) return;
    
    const latlng = e.latlng;
    
    switch (drawingMode) {
        case 'marker':
            addMarker(latlng);
            setDrawingMode(null); // Turn off marker mode after placing one
            document.getElementById('add-marker').classList.remove('active');
            break;
            
        case 'route':
            tempPoints.push(latlng);
            // Visual feedback for the user - temporary marker
            L.circleMarker(latlng, { radius: 5, color: 'blue' }).addTo(map);
            
            // If two or more points, draw a line
            if (tempPoints.length >= 2) {
                const lastPoint = tempPoints[tempPoints.length - 2];
                L.polyline([lastPoint, latlng], {color: 'blue'}).addTo(map);
            }
            
            // Double-click to finish route
            if (e.originalEvent && e.originalEvent.detail === 2) {
                addRoute(tempPoints);
                tempPoints = [];
                setDrawingMode(null);
                document.getElementById('add-route').classList.remove('active');
            }
            break;
            
        case 'area':
            tempPoints.push(latlng);
            // Visual feedback
            L.circleMarker(latlng, { radius: 5, color: 'red' }).addTo(map);
            
            // If two or more points, draw lines
            if (tempPoints.length >= 2) {
                const lastPoint = tempPoints[tempPoints.length - 2];
                L.polyline([lastPoint, latlng], {color: 'red'}).addTo(map);
            }
            
            // Double-click to finish area
            if (e.originalEvent && e.originalEvent.detail === 2) {
                // Close the polygon
                if (tempPoints.length >= 3) {
                    addArea(tempPoints);
                } else {
                    alert('Area needs at least 3 points');
                }
                tempPoints = [];
                setDrawingMode(null);
                document.getElementById('add-area').classList.remove('active');
            }
            break;
    }
}

// Add a marker to the map
function addMarker(latlng, options = {}) {
    const icon = options.icon || 'location';
    const color = options.color || 'blue';
    const label = options.label || 'Point of Interest';
    
    // Create a popup with more info
    const popup = L.popup().setContent(`
        <div class="marker-popup">
            <h3>${label}</h3>
            <p>Position: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</p>
            <button class="edit-marker">Edit</button>
            <button class="delete-marker">Delete</button>
        </div>
    `);
    
    // Create marker
    const marker = L.marker(latlng).addTo(map)
        .bindPopup(popup);
    
    // Store marker data
    markers.push({
        id: Date.now(), // Simple unique ID
        latlng,
        icon,
        color,
        label,
        leafletMarker: marker
    });
    
    // Add event listeners to popup buttons
    marker.on('popupopen', function() {
        const deleteBtn = document.querySelector('.delete-marker');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteMarker(marker);
            });
        }
        
        const editBtn = document.querySelector('.edit-marker');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editMarker(marker);
            });
        }
    });
    
    return marker;
}

// Add a route line to the map
function addRoute(points, options = {}) {
    const color = options.color || 'blue';
    const label = options.label || 'Route';
    const width = options.width || 3;
    
    // Create polyline
    const polyline = L.polyline(points, {
        color: color,
        weight: width
    }).addTo(map);
    
    // Create a popup
    const popup = L.popup().setContent(`
        <div class="route-popup">
            <h3>${label}</h3>
            <p>Length: ${calculateRouteDistance(points).toFixed(2)} km</p>
            <button class="edit-route">Edit</button>
            <button class="delete-route">Delete</button>
        </div>
    `);
    
    polyline.bindPopup(popup);
    
    // Store route data
    routes.push({
        id: Date.now(),
        points: [...points],
        color,
        label,
        width,
        leafletPolyline: polyline
    });
    
    // Add popup event handlers
    polyline.on('popupopen', function() {
        const deleteBtn = document.querySelector('.delete-route');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteRoute(polyline);
            });
        }
        
        const editBtn = document.querySelector('.edit-route');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editRoute(polyline);
            });
        }
    });
    
    // Fit map to the route
    map.fitBounds(polyline.getBounds());
    
    return polyline;
}

// Add an area polygon to the map
function addArea(points, options = {}) {
    const color = options.color || 'red';
    const fillColor = options.fillColor || 'red';
    const fillOpacity = options.fillOpacity || 0.2;
    const label = options.label || 'Area';
    
    // Create polygon
    const polygon = L.polygon(points, {
        color: color,
        fillColor: fillColor,
        fillOpacity: fillOpacity
    }).addTo(map);
    
    // Create a popup
    const popup = L.popup().setContent(`
        <div class="area-popup">
            <h3>${label}</h3>
            <p>Area: ${calculatePolygonArea(points).toFixed(2)} sq km</p>
            <button class="edit-area">Edit</button>
            <button class="delete-area">Delete</button>
        </div>
    `);
    
    polygon.bindPopup(popup);
    
    // Store area data
    areas.push({
        id: Date.now(),
        points: [...points],
        color,
        fillColor,
        fillOpacity,
        label,
        leafletPolygon: polygon
    });
    
    // Add popup event handlers
    polygon.on('popupopen', function() {
        const deleteBtn = document.querySelector('.delete-area');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteArea(polygon);
            });
        }
        
        const editBtn = document.querySelector('.edit-area');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editArea(polygon);
            });
        }
    });
    
    // Fit map to the area
    map.fitBounds(polygon.getBounds());
    
    return polygon;
}

// Delete a marker
function deleteMarker(marker) {
    // Remove from map
    map.removeLayer(marker);
    
    // Remove from array
    markers = markers.filter(m => m.leafletMarker !== marker);
}

// Edit marker (simple implementation - could be expanded)
function editMarker(marker) {
    const markerData = markers.find(m => m.leafletMarker === marker);
    if (!markerData) return;
    
    const newLabel = prompt('Enter new label for this marker:', markerData.label);
    if (newLabel) {
        markerData.label = newLabel;
        
        // Update popup
        marker.getPopup().setContent(`
            <div class="marker-popup">
                <h3>${newLabel}</h3>
                <p>Position: ${markerData.latlng.lat.toFixed(5)}, ${markerData.latlng.lng.toFixed(5)}</p>
                <button class="edit-marker">Edit</button>
                <button class="delete-marker">Delete</button>
            </div>
        `);
    }
}

// Delete a route
function deleteRoute(polyline) {
    // Remove from map
    map.removeLayer(polyline);
    
    // Remove from array
    routes = routes.filter(r => r.leafletPolyline !== polyline);
}

// Edit route (placeholder)
function editRoute(polyline) {
    const routeData = routes.find(r => r.leafletPolyline === polyline);
    if (!routeData) return;
    
    const newLabel = prompt('Enter new label for this route:', routeData.label);
    if (newLabel) {
        routeData.label = newLabel;
        
        // Update popup
        polyline.getPopup().setContent(`
            <div class="route-popup">
                <h3>${newLabel}</h3>
                <p>Length: ${calculateRouteDistance(routeData.points).toFixed(2)} km</p>
                <button class="edit-route">Edit</button>
                <button class="delete-route">Delete</button>
            </div>
        `);
    }
}

// Delete an area
function deleteArea(polygon) {
    // Remove from map
    map.removeLayer(polygon);
    
    // Remove from array
    areas = areas.filter(a => a.leafletPolygon !== polygon);
}

// Edit area (placeholder)
function editArea(polygon) {
    const areaData = areas.find(a => a.leafletPolygon === polygon);
    if (!areaData) return;
    
    const newLabel = prompt('Enter new label for this area:', areaData.label);
    if (newLabel) {
        areaData.label = newLabel;
        
        // Update popup
        polygon.getPopup().setContent(`
            <div class="area-popup">
                <h3>${newLabel}</h3>
                <p>Area: ${calculatePolygonArea(areaData.points).toFixed(2)} sq km</p>
                <button class="edit-area">Edit</button>
                <button class="delete-area">Delete</button>
            </div>
        `);
    }
}

// Calculate route distance in kilometers
function calculateRouteDistance(points) {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
        distance += points[i-1].distanceTo(points[i]);
    }
    return distance / 1000; // Convert to kilometers
}

// Calculate polygon area (approximate)
function calculatePolygonArea(points) {
    if (points.length < 3) return 0;
    
    // Use Leaflet's built-in calculation
    const polygon = L.polygon(points);
    let area = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0]);
    return area / 1000000; // Convert to square kilometers
}

// Save map data to the mission
function saveMapData() {
    // In a real application, this would send the data to a server
    
    // Extract the necessary data for saving
    const mapData = {
        markers: markers.map(m => ({
            id: m.id,
            lat: m.latlng.lat,
            lng: m.latlng.lng,
            icon: m.icon,
            color: m.color,
            label: m.label
        })),
        routes: routes.map(r => ({
            id: r.id,
            points: r.points.map(p => ({ lat: p.lat, lng: p.lng })),
            color: r.color,
            label: r.label,
            width: r.width
        })),
        areas: areas.map(a => ({
            id: a.id,
            points: a.points.map(p => ({ lat: p.lat, lng: p.lng })),
            color: a.color,
            fillColor: a.fillColor,
            fillOpacity: a.fillOpacity,
            label: a.label
        }))
    };
    
    console.log('Map data saved:', mapData);
    alert('Map data saved successfully');
    
    // In a real app, we would save this to the mission data on the server
}

// Load mission map data
function loadMissionMapData() {
    // This would normally fetch data from the server
    // For demo purposes, we'll use hardcoded data if there's an active mission
    
    // Check if we have an active mission in the app state
    const appState = window.appState;
    
    if (!appState || !appState.activeMission) {
        // No active mission, nothing to load
        return;
    }
    
    const mission = appState.activeMission;
    
    // If the mission has a location, center the map on it
    if (mission.location) {
        map.setView([mission.location.lat, mission.location.lng], 13);
    }
    
    // Load sample map data for demo purposes
    // In a real app, this would be loaded from the server
    if (mission.id === 1) { // Demo for Mission 1
        // Add some markers
        addMarker(L.latLng(34.0522, -118.2437), { label: 'Operational HQ' });
        addMarker(L.latLng(34.0550, -118.2500), { label: 'Surveillance Point Alpha' });
        addMarker(L.latLng(34.0480, -118.2400), { label: 'Surveillance Point Beta' });
        
        // Add a route
        addRoute([
            L.latLng(34.0522, -118.2437),
            L.latLng(34.0550, -118.2500),
            L.latLng(34.0480, -118.2400),
            L.latLng(34.0522, -118.2437)
        ], { label: 'Patrol Route' });
        
        // Add an area
        addArea([
            L.latLng(34.0530, -118.2450),
            L.latLng(34.0560, -118.2460),
            L.latLng(34.0550, -118.2400),
            L.latLng(34.0510, -118.2410)
        ], { label: 'Operational Area' });
    }
}

// We need to check if the map container is visible before initializing
// This is because Leaflet requires the container to be visible when initializing
document.addEventListener('DOMContentLoaded', function() {
    const mapTab = document.querySelector('[data-tab="map"]');
    if (mapTab) {
        mapTab.addEventListener('click', function() {
            setTimeout(initMap, 100);
        });
    }
});
