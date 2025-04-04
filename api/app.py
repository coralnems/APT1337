from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
import time
import logging
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Import routes
from controllers.drone_controller import DroneController
from controllers.mapping_controller import MappingController, mapping_bp
from controllers.detection_controller import DetectionController
from controllers.mock_controller import MockController

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-dev-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure JWT for development mode
    if os.getenv('FLASK_ENV') == 'development':
        app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
        app.config['JWT_COOKIE_SECURE'] = False
        app.config['JWT_COOKIE_CSRF_PROTECT'] = False
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Tokens don't expire in dev
    
    # CORS configuration
    if os.getenv('FLASK_ENV') == 'development':
        CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    else:
        CORS(app)
    
    jwt = JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(mapping_bp, url_prefix='/api/mapping')
    
    # Add login endpoint for testing
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """Test login endpoint that returns a JWT token"""
        # WARNING: This is only for development/testing!
        user_id = request.json.get('username', 'test')
        access_token = create_access_token(identity=user_id)
        return jsonify(access_token=access_token), 200
    
    return app

# Create the application instance
app = create_app()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='api_server.log'
)
logger = logging.getLogger('api')

# Initialize controllers
drone_controller = DroneController()
mapping_controller = MappingController()
detection_controller = DetectionController()
mock_controller = MockController()

# Global state
mock_mode = True  # Start in mock mode by default

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the overall system status"""
    return jsonify({
        'success': True,
        'mockMode': mock_mode,
        'connected': drone_controller.is_connected(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/mode', methods=['POST'])
def set_mode():
    """Switch between mock and production modes"""
    global mock_mode
    data = request.json
    if 'mode' not in data:
        return jsonify({'success': False, 'message': 'Mode parameter is required'}), 400
    
    new_mode = data['mode'].upper() == 'MOCK'
    if mock_mode != new_mode:
        mock_mode = new_mode
        logger.info(f"Switched to {'MOCK' if mock_mode else 'PRODUCTION'} mode")
        
        # Update controllers with new mode
        drone_controller.set_mock_mode(mock_mode)
        mapping_controller.set_mock_mode(mock_mode)
        detection_controller.set_mock_mode(mock_mode)
        
        if mock_mode:
            mock_controller.start()
        else:
            mock_controller.stop()
    
    return jsonify({'success': True, 'mockMode': mock_mode})

@app.route('/api/drone/connect', methods=['POST'])
def connect_drone():
    """Connect to the drone"""
    data = request.json
    connection_type = data.get('connectionType', 'Wi-Fi')
    ip = data.get('ip', '192.168.0.1')
    port = data.get('port', 8080)
    
    try:
        if mock_mode:
            # In mock mode, simulate connection
            success = mock_controller.connect()
            message = "Connected to mock drone"
        else:
            # In production mode, connect to real drone
            success = drone_controller.connect(connection_type, ip, port)
            message = f"Connected to drone at {ip}:{port}"
        
        if success:
            logger.info(message)
            return jsonify({'success': True, 'message': message})
        else:
            logger.error("Failed to connect to drone")
            return jsonify({'success': False, 'message': "Connection failed"}), 500
    except Exception as e:
        logger.exception("Error connecting to drone")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/disconnect', methods=['POST'])
def disconnect_drone():
    """Disconnect from the drone"""
    try:
        if mock_mode:
            # In mock mode, simulate disconnection
            success = mock_controller.disconnect()
            message = "Disconnected from mock drone"
        else:
            # In production mode, disconnect from real drone
            success = drone_controller.disconnect()
            message = "Disconnected from drone"
        
        if success:
            logger.info(message)
            return jsonify({'success': True, 'message': message})
        else:
            logger.error("Failed to disconnect from drone")
            return jsonify({'success': False, 'message': "Disconnection failed"}), 500
    except Exception as e:
        logger.exception("Error disconnecting from drone")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    """Get the latest telemetry data"""
    try:
        if mock_mode:
            # In mock mode, get mock telemetry
            telemetry = mock_controller.get_telemetry()
        else:
            # In production mode, get real telemetry
            telemetry = drone_controller.get_telemetry()
        
        return jsonify({
            'success': True,
            'telemetry': telemetry,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.exception("Error getting telemetry")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/mission', methods=['POST'])
def create_mission():
    """Create a new mission plan"""
    data = request.json
    
    try:
        mission_type = data.get('missionType', 'Search Grid')
        grid_size = float(data.get('gridSize', 100))
        altitude = float(data.get('altitude', 50))
        speed = float(data.get('speed', 5))
        capture_interval = float(data.get('captureInterval', 0.5))
        directional_capture = data.get('useDirectionalCapture', True)
        spotlight_enabled = data.get('useSpotlight', False)
        
        if mock_mode:
            # In mock mode, create mock mission
            mission = mock_controller.create_mission(
                mission_type, grid_size, altitude, speed, 
                capture_interval, directional_capture, spotlight_enabled
            )
        else:
            # In production mode, create real mission
            mission = drone_controller.create_mission(
                mission_type, grid_size, altitude, speed,
                capture_interval, directional_capture, spotlight_enabled
            )
        
        logger.info(f"Created {mission_type} mission with {len(mission['waypoints'])} waypoints")
        return jsonify({
            'success': True,
            'mission': mission
        })
    except Exception as e:
        logger.exception("Error creating mission")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/mission/upload', methods=['POST'])
def upload_mission():
    """Upload mission to drone"""
    try:
        if mock_mode:
            # In mock mode, simulate upload
            success = mock_controller.upload_mission()
        else:
            # In production mode, upload to real drone
            success = drone_controller.upload_mission()
        
        if success:
            logger.info("Mission uploaded to drone")
            return jsonify({'success': True, 'message': "Mission uploaded successfully"})
        else:
            logger.error("Failed to upload mission")
            return jsonify({'success': False, 'message': "Upload failed"}), 500
    except Exception as e:
        logger.exception("Error uploading mission")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/mission/start', methods=['POST'])
def start_mission():
    """Start mission execution"""
    try:
        if mock_mode:
            # In mock mode, simulate mission start
            success = mock_controller.start_mission()
        else:
            # In production mode, start real mission
            success = drone_controller.start_mission()
        
        if success:
            logger.info("Mission started")
            return jsonify({'success': True, 'message': "Mission started"})
        else:
            logger.error("Failed to start mission")
            return jsonify({'success': False, 'message': "Mission start failed"}), 500
    except Exception as e:
        logger.exception("Error starting mission")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/mission/pause', methods=['POST'])
def pause_mission():
    """Pause mission execution"""
    try:
        if mock_mode:
            # In mock mode, simulate mission pause
            success = mock_controller.pause_mission()
        else:
            # In production mode, pause real mission
            success = drone_controller.pause_mission()
        
        if success:
            logger.info("Mission paused")
            return jsonify({'success': True, 'message': "Mission paused"})
        else:
            logger.error("Failed to pause mission")
            return jsonify({'success': False, 'message': "Mission pause failed"}), 500
    except Exception as e:
        logger.exception("Error pausing mission")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/rth', methods=['POST'])
def return_to_home():
    """Initiate return to home"""
    try:
        if mock_mode:
            # In mock mode, simulate RTH
            success = mock_controller.return_to_home()
        else:
            # In production mode, initiate real RTH
            success = drone_controller.return_to_home()
        
        if success:
            logger.info("Return to home initiated")
            return jsonify({'success': True, 'message': "Return to home initiated"})
        else:
            logger.error("Failed to initiate return to home")
            return jsonify({'success': False, 'message': "Return to home failed"}), 500
    except Exception as e:
        logger.exception("Error initiating return to home")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/emergency-stop', methods=['POST'])
def emergency_stop():
    """Execute emergency stop"""
    try:
        if mock_mode:
            # In mock mode, simulate emergency stop
            success = mock_controller.emergency_stop()
        else:
            # In production mode, execute real emergency stop
            success = drone_controller.emergency_stop()
        
        if success:
            logger.info("Emergency stop executed")
            return jsonify({'success': True, 'message': "Emergency stop executed"})
        else:
            logger.error("Failed to execute emergency stop")
            return jsonify({'success': False, 'message': "Emergency stop failed"}), 500
    except Exception as e:
        logger.exception("Error executing emergency stop")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/spotlight', methods=['POST'])
def toggle_spotlight():
    """Toggle AL1 spotlight on/off"""
    data = request.json
    enable = data.get('enable', True)
    brightness = data.get('brightness', 80)
    
    try:
        if mock_mode:
            # In mock mode, simulate spotlight toggle
            success = mock_controller.set_spotlight(enable, brightness)
        else:
            # In production mode, toggle real spotlight
            success = drone_controller.set_spotlight(enable, brightness)
        
        state = "enabled" if enable else "disabled"
        if success:
            logger.info(f"Spotlight {state} with brightness {brightness}%")
            return jsonify({
                'success': True, 
                'message': f"Spotlight {state}",
                'enabled': enable,
                'brightness': brightness
            })
        else:
            logger.error(f"Failed to {state} spotlight")
            return jsonify({'success': False, 'message': f"Failed to {state} spotlight"}), 500
    except Exception as e:
        logger.exception("Error controlling spotlight")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/drone/camera', methods=['POST'])
def configure_camera():
    """Configure camera settings"""
    data = request.json
    capture_interval = float(data.get('captureInterval', 0.5))
    directional_mode = data.get('directionalMode', True)
    
    try:
        if mock_mode:
            # In mock mode, simulate camera configuration
            success = mock_controller.configure_camera(capture_interval, directional_mode)
        else:
            # In production mode, configure real camera
            success = drone_controller.configure_camera(capture_interval, directional_mode)
        
        mode = "3-Directional" if directional_mode else "Omni-Directional"
        if success:
            logger.info(f"Camera configured: {mode} mode with {capture_interval}s interval")
            return jsonify({
                'success': True, 
                'message': "Camera configured",
                'captureInterval': capture_interval,
                'directionalMode': directional_mode
            })
        else:
            logger.error("Failed to configure camera")
            return jsonify({'success': False, 'message': "Failed to configure camera"}), 500
    except Exception as e:
        logger.exception("Error configuring camera")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mapping/start', methods=['POST'])
def start_mapping():
    """Start terrain mapping"""
    data = request.json
    mapping_mode = data.get('mode', '2D Map')
    resolution = data.get('resolution', 'Medium')
    
    try:
        if mock_mode:
            # In mock mode, simulate mapping start
            success = mock_controller.start_mapping(mapping_mode, resolution)
        else:
            # In production mode, start real mapping
            success = mapping_controller.start_mapping(mapping_mode, resolution)
        
        if success:
            logger.info(f"Started {mapping_mode} mapping at {resolution} resolution")
            return jsonify({
                'success': True, 
                'message': "Mapping started",
                'mode': mapping_mode,
                'resolution': resolution
            })
        else:
            logger.error("Failed to start mapping")
            return jsonify({'success': False, 'message': "Failed to start mapping"}), 500
    except Exception as e:
        logger.exception("Error starting mapping")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mapping/stop', methods=['POST'])
def stop_mapping():
    """Stop terrain mapping"""
    try:
        if mock_mode:
            # In mock mode, simulate mapping stop
            success = mock_controller.stop_mapping()
        else:
            # In production mode, stop real mapping
            success = mapping_controller.stop_mapping()
        
        if success:
            logger.info("Stopped mapping")
            return jsonify({'success': True, 'message': "Mapping stopped"})
        else:
            logger.error("Failed to stop mapping")
            return jsonify({'success': False, 'message': "Failed to stop mapping"}), 500
    except Exception as e:
        logger.exception("Error stopping mapping")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mapping/export', methods=['POST'])
def export_mapping():
    """Export mapping data to DJI Terra"""
    data = request.json
    format_type = data.get('format', 'Terra')
    
    try:
        if mock_mode:
            # In mock mode, simulate export
            result = mock_controller.export_mapping(format_type)
        else:
            # In production mode, export real data
            result = mapping_controller.export_mapping(format_type)
        
        if result['success']:
            logger.info(f"Exported mapping data to {format_type} format")
            return jsonify({
                'success': True, 
                'message': "Mapping data exported",
                'format': format_type,
                'fileLocation': result.get('fileLocation', '')
            })
        else:
            logger.error(f"Failed to export mapping data to {format_type}")
            return jsonify({'success': False, 'message': "Failed to export mapping data"}), 500
    except Exception as e:
        logger.exception("Error exporting mapping data")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/detection/settings', methods=['POST'])
def configure_detection():
    """Configure object detection settings"""
    data = request.json
    detection_mode = data.get('mode', 'Combined')
    sensitivity = data.get('sensitivity', 'Medium')
    min_confidence = float(data.get('minConfidence', 70))
    alert_settings = data.get('alerts', {})
    
    try:
        if mock_mode:
            # In mock mode, simulate configuration
            success = mock_controller.configure_detection(
                detection_mode, sensitivity, min_confidence, alert_settings
            )
        else:
            # In production mode, configure real detection
            success = detection_controller.configure_detection(
                detection_mode, sensitivity, min_confidence, alert_settings
            )
        
        if success:
            logger.info(f"Configured detection: {detection_mode} mode with {sensitivity} sensitivity")
            return jsonify({
                'success': True, 
                'message': "Detection configured",
                'mode': detection_mode,
                'sensitivity': sensitivity,
                'minConfidence': min_confidence
            })
        else:
            logger.error("Failed to configure detection")
            return jsonify({'success': False, 'message': "Failed to configure detection"}), 500
    except Exception as e:
        logger.exception("Error configuring detection")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mock/settings', methods=['POST'])
def configure_mock():
    """Configure mock data settings"""
    if not mock_mode:
        return jsonify({'success': False, 'message': "Not in mock mode"}), 400
    
    data = request.json
    flight_path = data.get('flightPath', 'Grid Pattern')
    detection_freq = data.get('detections', 'Occasional')
    update_rate = int(data.get('updateRate', 1000))
    
    try:
        success = mock_controller.configure(flight_path, detection_freq, update_rate)
        
        if success:
            logger.info(f"Configured mock data: {flight_path} path with {detection_freq} detections")
            return jsonify({
                'success': True, 
                'message': "Mock settings applied",
                'flightPath': flight_path,
                'detections': detection_freq,
                'updateRate': update_rate
            })
        else:
            logger.error("Failed to configure mock settings")
            return jsonify({'success': False, 'message': "Failed to configure mock settings"}), 500
    except Exception as e:
        logger.exception("Error configuring mock settings")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
