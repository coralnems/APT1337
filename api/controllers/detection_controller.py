import logging
import time
from datetime import datetime

class DetectionController:
    """
    Controller for object detection (people, animals, vehicles).
    """
    
    def __init__(self):
        self.logger = logging.getLogger('detection_controller')
        self.mock_mode = True  # Default to mock mode
        self.detection_mode = 'Combined'
        self.sensitivity = 'Medium'
        self.min_confidence = 70.0
        self.alerts = {
            'people': True,
            'animals': True,
            'vehicles': False,
            'sound': True
        }
        self.detections = []
        self.detection_counts = {
            'People': 0,
            'Animals': 0,
            'Vehicles': 0,
            'Other': 0
        }
        
    def set_mock_mode(self, mock_mode):
        """Set controller to mock or production mode"""
        self.mock_mode = mock_mode
        
    def configure_detection(self, detection_mode, sensitivity, min_confidence, alert_settings):
        """Configure object detection settings"""
        try:
            # This would configure real detection models in production mode
            self.detection_mode = detection_mode
            self.sensitivity = sensitivity
            self.min_confidence = min_confidence
            
            # Update alert settings if provided
            if 'people' in alert_settings:
                self.alerts['people'] = alert_settings['people']
            if 'animals' in alert_settings:
                self.alerts['animals'] = alert_settings['animals']
            if 'vehicles' in alert_settings:
                self.alerts['vehicles'] = alert_settings['vehicles']
            if 'sound' in alert_settings:
                self.alerts['sound'] = alert_settings['sound']
                
            self.logger.info(f"Detection configured: {detection_mode} mode with {sensitivity} sensitivity")
            return True
        except Exception as e:
            self.logger.error(f"Failed to configure detection: {str(e)}")
            return False
    
    def get_detection_settings(self):
        """Get current detection settings"""
        return {
            'mode': self.detection_mode,
            'sensitivity': self.sensitivity,
            'minConfidence': self.min_confidence,
            'alerts': self.alerts
        }
    
    def get_detection_counts(self):
        """Get detection count statistics"""
        return self.detection_counts
    
    def get_recent_detections(self, limit=10):
        """Get list of recent detections"""
        return self.detections[:limit]
    
    def add_detection(self, detection_type, confidence, latitude, longitude):
        """Add a new detection"""
        if confidence < self.min_confidence:
            # Ignore detections below confidence threshold
            return False
            
        # In production mode this would be called by the actual detection algorithm
        try:
            timestamp = datetime.now()
            detection = {
                'id': int(timestamp.timestamp() * 1000),  # Use milliseconds as ID
                'type': detection_type,
                'confidence': confidence,
                'timestamp': timestamp.isoformat(),
                'location': {
                    'lat': latitude,
                    'lng': longitude
                }
            }
            
            # Add to detections list
            self.detections.insert(0, detection)
            
            # Limit list size
            if len(self.detections) > 100:
                self.detections = self.detections[:100]
                
            # Update counts
            if detection_type in self.detection_counts:
                self.detection_counts[detection_type] += 1
            else:
                self.detection_counts['Other'] += 1
                
            # Check if alerts should be triggered
            should_alert = False
            if detection_type == 'People' and self.alerts['people']:
                should_alert = True
            elif detection_type == 'Animals' and self.alerts['animals']:
                should_alert = True
            elif detection_type == 'Vehicles' and self.alerts['vehicles']:
                should_alert = True
                
            if should_alert:
                self.trigger_alert(detection)
                
            self.logger.info(f"New detection: {detection_type} with {confidence}% confidence")
            return detection
        except Exception as e:
            self.logger.error(f"Failed to add detection: {str(e)}")
            return None
    
    def trigger_alert(self, detection):
        """Trigger alert for a detection"""
        # In production mode, this would send notifications, play sounds, etc.
        self.logger.info(f"Alert triggered for {detection['type']} detection")
        
        # If sound alerts are enabled
        if self.alerts['sound']:
            # This would play a sound alert in production mode
            pass
            
        # Additional alert actions could be added here
