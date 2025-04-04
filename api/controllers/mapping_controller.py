import logging
import time
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, verify_jwt_in_request, get_jwt_identity
from functools import wraps

# Create a Blueprint for mapping routes
mapping_bp = Blueprint('mapping', __name__)

# Create a custom decorator that makes JWT optional for development
def flexible_jwt_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Check if we're in development mode
            if os.getenv('FLASK_ENV') == 'development' or os.getenv('TESTING') == 'True':
                try:
                    verify_jwt_in_request(optional=True)
                except:
                    pass  # Ignore JWT errors in development
            else:
                # In production, always require JWT
                verify_jwt_in_request()
            return fn(*args, **kwargs)
        return decorator
    return wrapper

class MappingController:
    """
    Controller for terrain mapping and DJI Terra integration.
    """
    
    def __init__(self):
        self.logger = logging.getLogger('mapping_controller')
        self.mock_mode = True  # Default to mock mode
        self.mapping_active = False
        self.current_mode = '2D Map'
        self.current_resolution = 'Medium'
        self.area_covered = 0.0
        self.images_captured = 0
        self.mapping_start_time = None
        
    def set_mock_mode(self, mock_mode):
        """Set controller to mock or production mode"""
        self.mock_mode = mock_mode
        
    def start_mapping(self, mapping_mode, resolution):
        """Start terrain mapping with specified mode and resolution"""
        if self.mapping_active:
            self.logger.warning("Mapping already active, stopping previous session")
            self.stop_mapping()
            
        try:
            # This would use the DJI SDK and Terra SDK to start real mapping
            self.mapping_active = True
            self.current_mode = mapping_mode
            self.current_resolution = resolution
            self.mapping_start_time = datetime.now()
            self.area_covered = 0.0
            self.images_captured = 0
            
            self.logger.info(f"Started {mapping_mode} mapping at {resolution} resolution")
            return True
        except Exception as e:
            self.logger.error(f"Failed to start mapping: {str(e)}")
            return False
    
    def stop_mapping(self):
        """Stop current mapping session"""
        if not self.mapping_active:
            self.logger.warning("No active mapping session to stop")
            return True
            
        try:
            # This would use the DJI SDK and Terra SDK to stop real mapping
            self.mapping_active = False
            self.logger.info("Mapping stopped")
            return True
        except Exception as e:
            self.logger.error(f"Failed to stop mapping: {str(e)}")
            return False
    
    def get_mapping_stats(self):
        """Get statistics about the current mapping session"""
        if not self.mapping_active:
            return {
                'active': False,
                'areaCovered': 0.0,
                'imagesCaptured': 0,
                'estimatedCompletion': '00:00:00',
                'resolution': '0.0 cm/px'
            }
        
        # In production mode, would get real stats from the SDK
        # For now, generating mock stats
        elapsed = (datetime.now() - self.mapping_start_time).total_seconds()
        
        res_values = {
            'Low': '5.0 cm/px',
            'Medium': '2.0 cm/px',
            'High': '1.0 cm/px'
        }
        
        # Mock increasing area and images over time
        self.area_covered = min(1.0, elapsed / 600)  # Covering 1 km² over 10 minutes
        self.images_captured = int(elapsed / self.get_capture_interval())
        
        remaining_seconds = max(0, 600 - elapsed)
        hours = int(remaining_seconds / 3600)
        minutes = int((remaining_seconds % 3600) / 60)
        seconds = int(remaining_seconds % 60)
        
        return {
            'active': True,
            'areaCovered': self.area_covered,
            'imagesCaptured': self.images_captured,
            'estimatedCompletion': f"{hours:02d}:{minutes:02d}:{seconds:02d}",
            'resolution': res_values.get(self.current_resolution, '2.0 cm/px'),
            'mode': self.current_mode
        }
    
    def get_capture_interval(self):
        """Get current capture interval based on resolution"""
        # Higher resolution requires more time between captures
        if self.current_resolution == 'Low':
            return 0.3
        elif self.current_resolution == 'Medium':
            return 0.5
        else:  # High resolution
            return 0.8
    
    def export_mapping(self, format_type):
        """Export mapping data to specified format"""
        if not self.mapping_active and self.area_covered <= 0:
            self.logger.warning("No mapping data to export")
            return {'success': False, 'message': "No mapping data to export"}
        
        try:
            # This would use the Terra SDK to export actual mapping data
            
            # Create a mock export filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"mapping_export_{self.current_mode}_{timestamp}"
            
            if format_type == 'Terra':
                file_ext = '.terra'
            elif format_type == 'OBJ':
                file_ext = '.obj'
            else:
                file_ext = '.dat'
                
            file_path = os.path.join(os.getcwd(), 'exports', filename + file_ext)
            
            # In production, would actually create the file
            
            self.logger.info(f"Exported mapping data to {file_path}")
            return {
                'success': True,
                'fileLocation': file_path,
                'format': format_type,
                'timestamp': timestamp
            }
        except Exception as e:
            self.logger.error(f"Failed to export mapping data: {str(e)}")
            return {'success': False, 'message': str(e)}

# Create controller instance
mapping_controller = MappingController()

@mapping_bp.route('/status', methods=['GET'])
@flexible_jwt_required()
def get_mapping_status():
    """Get current mapping status"""
    return jsonify(mapping_controller.get_mapping_stats())

@mapping_bp.route('/start', methods=['POST'])
@flexible_jwt_required()
def start_mapping():
    """Start a new mapping session"""
    data = request.get_json()
    mapping_mode = data.get('mode', '2D Map')
    resolution = data.get('resolution', 'Medium')
    
    success = mapping_controller.start_mapping(mapping_mode, resolution)
    
    if success:
        return jsonify({
            'status': 'success',
            'message': f'Started {mapping_mode} mapping at {resolution} resolution',
            'mappingStats': mapping_controller.get_mapping_stats()
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to start mapping'
        }), 500

@mapping_bp.route('/stop', methods=['POST'])
@flexible_jwt_required()
def stop_mapping():
    """Stop the current mapping session"""
    success = mapping_controller.stop_mapping()
    
    if success:
        return jsonify({
            'status': 'success',
            'message': 'Mapping stopped successfully'
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to stop mapping'
        }), 500

@mapping_bp.route('/export', methods=['POST'])
@flexible_jwt_required()
def export_mapping():
    """Export mapping data in requested format"""
    data = request.get_json()
    format_type = data.get('format', 'Terra')
    
    result = mapping_controller.export_mapping(format_type)
    
    if result.get('success', False):
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': result.get('message', 'Export failed')
        }), 400

@mapping_bp.route('/mock', methods=['POST'])
@flexible_jwt_required()
def set_mock_mode():
    """Set controller to mock or production mode"""
    data = request.get_json()
    mock_mode = data.get('mock', True)
    
    mapping_controller.set_mock_mode(mock_mode)
    
    return jsonify({
        'status': 'success',
        'message': f'Mock mode set to: {mock_mode}'
    }), 200
