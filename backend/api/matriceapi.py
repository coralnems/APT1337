from flask import Blueprint, request
from flask_restx import Api, Resource, fields, Namespace
from .drone_api import DJISDKInterface
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint for Matrice API
matrice_blueprint = Blueprint('matrice_api', __name__)
matrice_ns = Namespace('matrice', description='Matrice drone specific operations')

# Extended SDK Interface for Matrice series
class MatriceSDKInterface(DJISDKInterface):
    def __init__(self):
        super().__init__()
        self.model = "Matrice 300 RTK"
        self.payload_status = {
            "main_camera": {
                "connected": True,
                "type": "H20T", 
                "status": "idle"
            },
            "secondary_camera": {
                "connected": False,
                "type": "None",
                "status": "not_connected"
            }
        }
        self.rtk_status = {
            "enabled": False,
            "fixed": False,
            "satellites_count": 0
        }
        logger.info("Matrice SDK Interface initialized")
        
    def enable_rtk(self):
        self.rtk_status["enabled"] = True
        return {"status": "rtk_enabled"}
    
    def disable_rtk(self):
        self.rtk_status["enabled"] = False
        return {"status": "rtk_disabled"}
    
    def get_rtk_status(self):
        return self.rtk_status
    
    def get_payload_status(self):
        return self.payload_status
    
    def set_payload_mode(self, camera_id, mode):
        if camera_id not in ["main_camera", "secondary_camera"]:
            return {"error": "Invalid camera ID"}
            
        if not self.payload_status[camera_id]["connected"]:
            return {"error": f"Camera {camera_id} not connected"}
            
        valid_modes = ["normal", "infrared", "zoom", "split"]
        if mode not in valid_modes:
            return {"error": f"Invalid mode. Must be one of {valid_modes}"}
            
        self.payload_status[camera_id]["status"] = mode
        return {"status": "mode_set", "camera": camera_id, "mode": mode}
    
    def start_obstacle_avoidance(self):
        return {"status": "obstacle_avoidance_enabled"}
    
    def stop_obstacle_avoidance(self):
        return {"status": "obstacle_avoidance_disabled"}
    
    def calibrate_sensors(self):
        return {"status": "calibration_started"}

# Create SDK interface instance
matrice_sdk = MatriceSDKInterface()

# Define API models
rtk_model = matrice_ns.model('RTK', {
    'enabled': fields.Boolean(required=True, description='Enable or disable RTK')
})

payload_model = matrice_ns.model('PayloadMode', {
    'camera_id': fields.String(required=True, description='Camera identifier (main_camera, secondary_camera)'),
    'mode': fields.String(required=True, description='Camera mode (normal, infrared, zoom, split)')
})

# Define API endpoints
@matrice_ns.route('/info')
class MatriceInfo(Resource):
    def get(self):
        """Get Matrice drone information"""
        return {
            "model": matrice_sdk.model,
            "connected": matrice_sdk.connected,
            "flight_status": matrice_sdk.flight_status,
            "battery_level": matrice_sdk.battery_level
        }

@matrice_ns.route('/rtk/status')
class MatriceRTKStatus(Resource):
    def get(self):
        """Get RTK status"""
        return matrice_sdk.get_rtk_status()

@matrice_ns.route('/rtk/enable')
class MatriceRTKEnable(Resource):
    @matrice_ns.expect(rtk_model)
    def post(self):
        """Enable or disable RTK"""
        data = request.json
        if data.get('enabled'):
            result = matrice_sdk.enable_rtk()
        else:
            result = matrice_sdk.disable_rtk()
        return result

@matrice_ns.route('/payload/status')
class MatricePayloadStatus(Resource):
    def get(self):
        """Get payload status information"""
        return matrice_sdk.get_payload_status()

@matrice_ns.route('/payload/mode')
class MatricePayloadMode(Resource):
    @matrice_ns.expect(payload_model)
    def post(self):
        """Set camera mode"""
        data = request.json
        result = matrice_sdk.set_payload_mode(data.get('camera_id'), data.get('mode'))
        if 'error' in result:
            return result, 400
        return result

@matrice_ns.route('/obstacle_avoidance/enable')
class MatriceObstacleAvoidanceEnable(Resource):
    def post(self):
        """Enable obstacle avoidance"""
        return matrice_sdk.start_obstacle_avoidance()

@matrice_ns.route('/obstacle_avoidance/disable')
class MatriceObstacleAvoidanceDisable(Resource):
    def post(self):
        """Disable obstacle avoidance"""
        return matrice_sdk.stop_obstacle_avoidance()

@matrice_ns.route('/calibrate')
class MatriceCalibrate(Resource):
    def post(self):
        """Calibrate drone sensors"""
        return matrice_sdk.calibrate_sensors()

# Add Namespace to the Blueprint
api = Api(matrice_blueprint, 
          title='Matrice Drone API',
          version='1.0',
          description='API for controlling DJI Matrice drones')
api.add_namespace(matrice_ns, path='/api/v1')