import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import LayersIcon from '@mui/icons-material/Layers';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

function LiveMap({ telemetry, detections, searchPattern }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const [loading, setLoading] = useState(true);
  
  const droneMarkerRef = useRef(null);
  const searchPatternLayerRef = useRef(null);
  const detectionMarkersRef = useRef([]);
  const homePointRef = useRef(null);

  // Initialize map with mock data if needed
  const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco

  // Function to handle map type change
  const handleMapTypeChange = (event, newType) => {
    if (newType !== null) {
      setMapType(newType);
      if (map) {
        map.setMapTypeId(newType);
      }
    }
  };

  // Initialize map on component mount
  useEffect(() => {
    // Load Google Maps API script if not already loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }

    // Initialize the map
    function initMap() {
      const mapOptions = {
        center: defaultLocation,
        zoom: 15,
        mapTypeId: mapType,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // Add home point marker
      homePointRef.current = new window.google.maps.Marker({
        position: defaultLocation,
        map: newMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: 'Home Point'
      });
      
      // Add drone marker initially hidden
      droneMarkerRef.current = new window.google.maps.Marker({
        position: defaultLocation,
        map: newMap,
        icon: {
          url: 'https://maps.google.com/mapfiles/kml/shapes/helicopter.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        title: 'Drone Position',
        visible: false
      });
      
      setLoading(false);
    }
  }, [mapType]);

  // Update drone position and other map elements when telemetry changes
  useEffect(() => {
    if (!map || !telemetry || !telemetry.coordinates) return;
    
    const position = {
      lat: telemetry.coordinates.latitude,
      lng: telemetry.coordinates.longitude
    };
    
    // Update drone marker position
    if (droneMarkerRef.current) {
      droneMarkerRef.current.setPosition(position);
      droneMarkerRef.current.setVisible(true);
      
      // Move map to follow drone
      map.panTo(position);
    }
    
    // Update home point if first position received
    if (homePointRef.current && telemetry.homePoint) {
      homePointRef.current.setPosition({
        lat: telemetry.homePoint.latitude,
        lng: telemetry.homePoint.longitude
      });
    }

  }, [telemetry, map]);

  // Update detection markers when detections change
  useEffect(() => {
    if (!map || !detections || detections.length === 0) return;
    
    // Clear old detection markers
    detectionMarkersRef.current.forEach(marker => marker.setMap(null));
    detectionMarkersRef.current = [];
    
    // Add new detection markers
    detections.forEach((detection) => {
      if (!detection.coordinates) return;
      
      const detectionMarker = new window.google.maps.Marker({
        position: {
          lat: detection.coordinates.latitude,
          lng: detection.coordinates.longitude
        },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF0000',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: detection.type || 'Detection'
      });
      
      // Add info window with detection details
      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>${detection.type || 'Detection'}</h3>
            <p>Confidence: ${detection.confidence || 'Unknown'}%</p>
            <p>Time: ${detection.timestamp || 'Unknown'}</p>
          </div>
        `
      });
      
      detectionMarker.addListener('click', () => {
        infowindow.open(map, detectionMarker);
      });
      
      detectionMarkersRef.current.push(detectionMarker);
    });
  }, [detections, map]);

  // Draw search pattern when it changes
  useEffect(() => {
    if (!map || !searchPattern) return;
    
    // Clear old pattern
    if (searchPatternLayerRef.current) {
      searchPatternLayerRef.current.setMap(null);
    }
    
    // Get center point from telemetry or default
    const center = telemetry && telemetry.coordinates 
      ? { lat: telemetry.coordinates.latitude, lng: telemetry.coordinates.longitude }
      : defaultLocation;
      
    // Create pattern coordinates based on search pattern type
    let pathCoordinates = [];
    
    if (searchPattern.type === 'spiral') {
      // Generate spiral pattern
      pathCoordinates = generateSpiralPattern(center, searchPattern.size);
    } else if (searchPattern.type === 'grid') {
      // Generate grid pattern
      pathCoordinates = generateGridPattern(center, searchPattern.size, searchPattern.spacing);
    } else if (searchPattern.type === 'expanding') {
      // Generate expanding square pattern
      pathCoordinates = generateExpandingSquarePattern(center, searchPattern.size);
    }
    
    // Draw the pattern on the map
    searchPatternLayerRef.current = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      icons: [{
        icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
        offset: '100%',
        repeat: '100px'
      }],
      map: map
    });
    
  }, [searchPattern, map, telemetry]);

  // Helper functions for generating search patterns
  function generateSpiralPattern(center, size) {
    const points = [];
    const steps = 50;
    const turns = 5;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (turns * 2 * Math.PI * i) / steps;
      const radius = (size * i) / steps;
      
      const lat = center.lat + (radius * Math.cos(angle) / 111111);
      const lng = center.lng + (radius * Math.sin(angle) / (111111 * Math.cos(center.lat * (Math.PI / 180))));
      
      points.push({ lat, lng });
    }
    
    return points;
  }
  
  function generateGridPattern(center, size, spacing = 50) {
    const points = [];
    const rows = Math.ceil(size / spacing);
    const halfSize = size / 2;
    
    // Convert meters to degrees approximately
    const metersToLat = 1 / 111111;
    const metersToLng = 1 / (111111 * Math.cos(center.lat * (Math.PI / 180)));
    
    const spacingLat = spacing * metersToLat;
    const spacingLng = spacing * metersToLng;
    
    // Generate grid pattern with alternating directions for rows
    for (let i = 0; i < rows; i++) {
      const rowLat = center.lat - halfSize * metersToLat + i * spacingLat;
      
      if (i % 2 === 0) {
        // Left to right
        points.push(
          { lat: rowLat, lng: center.lng - halfSize * metersToLng },
          { lat: rowLat, lng: center.lng + halfSize * metersToLng }
        );
      } else {
        // Right to left
        points.push(
          { lat: rowLat, lng: center.lng + halfSize * metersToLng },
          { lat: rowLat, lng: center.lng - halfSize * metersToLng }
        );
      }
      
      // Add vertical connection to next row if not the last row
      if (i < rows - 1) {
        const nextRowLat = center.lat - halfSize * metersToLat + (i + 1) * spacingLat;
        const lastPoint = points[points.length - 1];
        points.push({ lat: nextRowLat, lng: lastPoint.lng });
      }
    }
    
    return points;
  }
  
  function generateExpandingSquarePattern(center, size) {
    const points = [center];
    const maxSteps = 10;
    const stepSize = size / maxSteps;
    
    // Convert meters to degrees approximately
    const metersToLat = 1 / 111111;
    const metersToLng = 1 / (111111 * Math.cos(center.lat * (Math.PI / 180)));
    
    for (let step = 1; step <= maxSteps; step++) {
      const stepSizeLat = step * stepSize * metersToLat;
      const stepSizeLng = step * stepSize * metersToLng;
      
      // Top side (left to right)
      points.push({ lat: center.lat + stepSizeLat, lng: center.lng - stepSizeLng });
      points.push({ lat: center.lat + stepSizeLat, lng: center.lng + stepSizeLng });
      
      // Right side (top to bottom)
      points.push({ lat: center.lat - stepSizeLat, lng: center.lng + stepSizeLng });
      
      // Bottom side (right to left)
      points.push({ lat: center.lat - stepSizeLat, lng: center.lng - stepSizeLng });
      
      // Left side (bottom to top, connecting to next level)
      if (step < maxSteps) {
        points.push({ lat: center.lat + stepSizeLat + stepSize * metersToLat, lng: center.lng - stepSizeLng });
      }
    }
    
    return points;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <ToggleButtonGroup
          value={mapType}
          exclusive
          onChange={handleMapTypeChange}
          aria-label="map type"
          size="small"
        >
          <ToggleButton value="roadmap" aria-label="map">
            <MapIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="satellite" aria-label="satellite">
            <SatelliteAltIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="hybrid" aria-label="hybrid">
            <LayersIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Box>
          {detections && detections.length > 0 && (
            <Typography variant="body2" color="error">
              <PersonPinCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {detections.length} Detection{detections.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Box 
        ref={mapRef} 
        sx={{ 
          flexGrow: 1, 
          minHeight: '400px', 
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)',
            zIndex: 999
          }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default LiveMap;
