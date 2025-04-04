import sys
import os
import json
from datetime import datetime
from PyQt6.QtWidgets import (QApplication, QMainWindow, QTabWidget, QWidget, QVBoxLayout, 
                            QHBoxLayout, QPushButton, QLabel, QComboBox, QGridLayout, 
                            QGroupBox, QStatusBar, QSplitter, QFrame, QCheckBox, QLineEdit)
from PyQt6.QtCore import Qt, QTimer, pyqtSlot, pyqtSignal, QThread
from PyQt6.QtGui import QFont, QIcon, QPixmap, QColor
import pyqtgraph as pg
import numpy as np

from drone_controller import DroneController
from mapping_module import MappingModule
from detection_module import DetectionModule
from mission_planner import MissionPlanner
from telemetry_parser import TelemetryParser
from settings_manager import SettingsManager
from mock_data_generator import MockDataGenerator

class SARMissionControl(QMainWindow):
    def __init__(self):
        super().__init__()
        self.settings = SettingsManager()
        self.mock_mode = True  # Default to mock mode
        self.init_ui()
        self.init_modules()
        self.connect_signals()
        
    def init_ui(self):
        self.setWindowTitle("Search and Rescue Mission Control")
        self.setMinimumSize(1280, 800)
        
        # Set dark theme
        self.setStyleSheet("""
            QMainWindow, QTabWidget, QWidget {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
            QPushButton {
                background-color: #3a3a3a;
                border: 1px solid #5a5a5a;
                border-radius: 4px;
                padding: 6px 12px;
                color: #e0e0e0;
            }
            QPushButton:hover {
                background-color: #4a4a4a;
            }
            QPushButton:pressed {
                background-color: #606060;
            }
            QPushButton#emergency {
                background-color: #8b0000;
                color: white;
                font-weight: bold;
            }
            QPushButton#emergency:hover {
                background-color: #a00000;
            }
            QTabWidget::pane {
                border: 1px solid #5a5a5a;
            }
            QTabBar::tab {
                background-color: #2a2a2a;
                color: #c0c0c0;
                padding: 8px 16px;
                margin-right: 2px;
            }
            QTabBar::tab:selected {
                background-color: #3a3a3a;
                color: #ffffff;
                border-bottom: 2px solid #007acc;
            }
            QGroupBox {
                border: 1px solid #5a5a5a;
                border-radius: 4px;
                margin-top: 8px;
                font-weight: bold;
                color: #c0c0c0;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
            }
            QComboBox, QLineEdit {
                background-color: #3a3a3a;
                border: 1px solid #5a5a5a;
                border-radius: 4px;
                padding: 4px 8px;
                color: #e0e0e0;
            }
        """)
        
        # Central widget
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        
        # Create header with status and mode controls
        header_layout = QHBoxLayout()
        
        # Status indicators
        status_group = QGroupBox("System Status")
        status_layout = QGridLayout(status_group)
        
        self.connection_status = QLabel("NOT CONNECTED")
        self.connection_status.setStyleSheet("color: #ff5555; font-weight: bold")
        status_layout.addWidget(QLabel("Drone Connection:"), 0, 0)
        status_layout.addWidget(self.connection_status, 0, 1)
        
        self.gnss_status = QLabel("No Signal")
        self.gnss_status.setStyleSheet("color: #ff5555; font-weight: bold")
        status_layout.addWidget(QLabel("GNSS Status:"), 1, 0)
        status_layout.addWidget(self.gnss_status, 1, 1)
        
        self.battery_status = QLabel("N/A")
        status_layout.addWidget(QLabel("Battery:"), 2, 0)
        status_layout.addWidget(self.battery_status, 2, 1)
        
        header_layout.addWidget(status_group)
        
        # Mode selection
        mode_group = QGroupBox("Operation Mode")
        mode_layout = QVBoxLayout(mode_group)
        
        mode_selector_layout = QHBoxLayout()
        self.mode_selector = QComboBox()
        self.mode_selector.addItems(["Mock Mode", "Production Mode"])
        self.mode_selector.currentIndexChanged.connect(self.change_mode)
        mode_selector_layout.addWidget(QLabel("Select Mode:"))
        mode_selector_layout.addWidget(self.mode_selector)
        mode_layout.addLayout(mode_selector_layout)
        
        self.mode_indicator = QLabel("MOCK MODE ACTIVE")
        self.mode_indicator.setStyleSheet("color: orange; font-weight: bold")
        mode_layout.addWidget(self.mode_indicator)
        
        header_layout.addWidget(mode_group)
        
        # Emergency button
        emergency_button = QPushButton("EMERGENCY STOP")
        emergency_button.setObjectName("emergency")
        emergency_button.setMinimumHeight(50)
        emergency_button.clicked.connect(self.emergency_stop)
        header_layout.addWidget(emergency_button)
        
        main_layout.addLayout(header_layout)
        
        # Create tab widget for different views
        self.tabs = QTabWidget()
        
        # Main mission control tab
        self.mission_tab = QWidget()
        self.setup_mission_tab()
        self.tabs.addTab(self.mission_tab, "Mission Control")
        
        # Mapping tab
        self.mapping_tab = QWidget()
        self.setup_mapping_tab()
        self.tabs.addTab(self.mapping_tab, "Mapping & Navigation")
        
        # Detection tab
        self.detection_tab = QWidget()
        self.setup_detection_tab()
        self.tabs.addTab(self.detection_tab, "Detection & Analysis")
        
        # Telemetry tab
        self.telemetry_tab = QWidget()
        self.setup_telemetry_tab()
        self.tabs.addTab(self.telemetry_tab, "Telemetry Data")
        
        # Settings tab
        self.settings_tab = QWidget()
        self.setup_settings_tab()
        self.tabs.addTab(self.settings_tab, "Settings")
        
        main_layout.addWidget(self.tabs)
        
        # Status bar
        self.statusBar = QStatusBar()
        self.setStatusBar(self.statusBar)
        self.statusBar.showMessage("System initialized in Mock Mode")
        
        # Set central widget
        self.setCentralWidget(central_widget)
        
    def setup_mission_tab(self):
        layout = QVBoxLayout(self.mission_tab)
        
        # Top area - Mission info and controls
        top_layout = QHBoxLayout()
        
        # Mission info
        mission_info_group = QGroupBox("Mission Information")
        mission_info_layout = QGridLayout(mission_info_group)
        
        self.mission_id_label = QLabel("Mission ID: SAR-2023-001")
        self.mission_status_label = QLabel("Status: Ready")
        self.mission_time_label = QLabel("Elapsed Time: 00:00:00")
        self.mission_location_label = QLabel("Location: N/A")
        
        mission_info_layout.addWidget(self.mission_id_label, 0, 0)
        mission_info_layout.addWidget(self.mission_status_label, 0, 1)
        mission_info_layout.addWidget(self.mission_time_label, 1, 0)
        mission_info_layout.addWidget(self.mission_location_label, 1, 1)
        
        top_layout.addWidget(mission_info_group)
        
        # Mission controls
        mission_control_group = QGroupBox("Mission Controls")
        mission_control_layout = QGridLayout(mission_control_group)
        
        self.start_mission_btn = QPushButton("Start Mission")
        self.pause_mission_btn = QPushButton("Pause Mission")
        self.end_mission_btn = QPushButton("End Mission")
        self.return_home_btn = QPushButton("Return to Home")
        
        self.start_mission_btn.clicked.connect(self.start_mission)
        self.pause_mission_btn.clicked.connect(self.pause_mission)
        self.end_mission_btn.clicked.connect(self.end_mission)
        self.return_home_btn.clicked.connect(self.return_home)
        
        mission_control_layout.addWidget(self.start_mission_btn, 0, 0)
        mission_control_layout.addWidget(self.pause_mission_btn, 0, 1)
        mission_control_layout.addWidget(self.end_mission_btn, 1, 0)
        mission_control_layout.addWidget(self.return_home_btn, 1, 1)
        
        top_layout.addWidget(mission_control_group)
        
        layout.addLayout(top_layout)
        
        # Middle area - Map view and mission planning
        middle_layout = QHBoxLayout()
        
        # Map view placeholder
        map_group = QGroupBox("Mission Map")
        map_layout = QVBoxLayout(map_group)
        self.map_view = QLabel("Map View Will Appear Here")
        self.map_view.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.map_view.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 300px;")
        map_layout.addWidget(self.map_view)
        middle_layout.addWidget(map_group, 2)
        
        # Mission planning tools
        planning_group = QGroupBox("Mission Planning")
        planning_layout = QVBoxLayout(planning_group)
        
        # Mission type selection
        mission_type_layout = QHBoxLayout()
        mission_type_layout.addWidget(QLabel("Mission Type:"))
        self.mission_type_selector = QComboBox()
        self.mission_type_selector.addItems(["Search Grid", "Object Tracking", "Area Mapping", "Perimeter Patrol"])
        mission_type_layout.addWidget(self.mission_type_selector)
        planning_layout.addLayout(mission_type_layout)
        
        # Search parameters
        search_params_group = QGroupBox("Search Parameters")
        search_params_layout = QGridLayout(search_params_group)
        
        search_params_layout.addWidget(QLabel("Grid Size (m):"), 0, 0)
        self.grid_size_input = QLineEdit("100")
        search_params_layout.addWidget(self.grid_size_input, 0, 1)
        
        search_params_layout.addWidget(QLabel("Altitude (m):"), 1, 0)
        self.altitude_input = QLineEdit("50")
        search_params_layout.addWidget(self.altitude_input, 1, 1)
        
        search_params_layout.addWidget(QLabel("Speed (m/s):"), 2, 0)
        self.speed_input = QLineEdit("5")
        search_params_layout.addWidget(self.speed_input, 2, 1)
        
        planning_layout.addWidget(search_params_group)
        
        # Camera settings
        camera_settings_group = QGroupBox("Camera Settings")
        camera_settings_layout = QGridLayout(camera_settings_group)
        
        camera_settings_layout.addWidget(QLabel("Capture Interval (s):"), 0, 0)
        self.interval_input = QLineEdit("0.5")
        camera_settings_layout.addWidget(self.interval_input, 0, 1)
        
        camera_settings_layout.addWidget(QLabel("Directional Capture:"), 1, 0)
        self.directional_checkbox = QCheckBox("Enable 3-Directional")
        self.directional_checkbox.setChecked(True)
        camera_settings_layout.addWidget(self.directional_checkbox, 1, 1)
        
        camera_settings_layout.addWidget(QLabel("Spotlight:"), 2, 0)
        self.spotlight_checkbox = QCheckBox("Enable AL1 Spotlight")
        camera_settings_layout.addWidget(self.spotlight_checkbox, 2, 1)
        
        planning_layout.addWidget(camera_settings_group)
        
        # Generate and upload mission buttons
        self.generate_mission_btn = QPushButton("Generate Mission Plan")
        planning_layout.addWidget(self.generate_mission_btn)
        
        self.upload_mission_btn = QPushButton("Upload to Drone")
        planning_layout.addWidget(self.upload_mission_btn)
        
        middle_layout.addWidget(planning_group, 1)
        layout.addLayout(middle_layout)
        
        # Bottom area - Live feed and detection results
        bottom_layout = QHBoxLayout()
        
        # Live camera feed
        feed_group = QGroupBox("Live Camera Feed")
        feed_layout = QVBoxLayout(feed_group)
        self.camera_feed = QLabel("Camera Feed Will Appear Here")
        self.camera_feed.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.camera_feed.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 150px;")
        feed_layout.addWidget(self.camera_feed)
        bottom_layout.addWidget(feed_group)
        
        # Detection results
        detection_group = QGroupBox("Detection Results")
        detection_layout = QVBoxLayout(detection_group)
        self.detection_results = QLabel("No detections yet")
        self.detection_results.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.detection_results.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 150px;")
        detection_layout.addWidget(self.detection_results)
        bottom_layout.addWidget(detection_group)
        
        layout.addLayout(bottom_layout)
    
    def setup_mapping_tab(self):
        layout = QVBoxLayout(self.mapping_tab)
        
        # Top area - Mapping controls
        controls_layout = QHBoxLayout()
        
        # Terra integration controls
        terra_group = QGroupBox("DJI Terra Integration")
        terra_layout = QGridLayout(terra_group)
        
        terra_layout.addWidget(QLabel("Terra Project:"), 0, 0)
        self.terra_project_selector = QComboBox()
        self.terra_project_selector.addItems(["New Project", "Project 1", "Project 2"])
        terra_layout.addWidget(self.terra_project_selector, 0, 1)
        
        terra_layout.addWidget(QLabel("Mapping Mode:"), 1, 0)
        self.mapping_mode_selector = QComboBox()
        self.mapping_mode_selector.addItems(["2D Map", "3D Model", "Oblique Photography"])
        terra_layout.addWidget(self.mapping_mode_selector, 1, 1)
        
        self.sync_terra_btn = QPushButton("Sync with Terra")
        terra_layout.addWidget(self.sync_terra_btn, 2, 0, 1, 2)
        
        controls_layout.addWidget(terra_group)
        
        # GNSS controls
        gnss_group = QGroupBox("GNSS Navigation")
        gnss_layout = QGridLayout(gnss_group)
        
        gnss_layout.addWidget(QLabel("GNSS Mode:"), 0, 0)
        self.gnss_mode_selector = QComboBox()
        self.gnss_mode_selector.addItems(["RTK", "GPS", "GLONASS", "Galileo", "BeiDou"])
        gnss_layout.addWidget(self.gnss_mode_selector, 0, 1)
        
        gnss_layout.addWidget(QLabel("Accuracy:"), 1, 0)
        self.gnss_accuracy = QLabel("±0.0m")
        gnss_layout.addWidget(self.gnss_accuracy, 1, 1)
        
        self.recalibrate_gnss_btn = QPushButton("Recalibrate GNSS")
        gnss_layout.addWidget(self.recalibrate_gnss_btn, 2, 0, 1, 2)
        
        controls_layout.addWidget(gnss_group)
        
        # Export controls
        export_group = QGroupBox("Data Export")
        export_layout = QVBoxLayout(export_group)
        
        self.export_map_btn = QPushButton("Export Current Map")
        export_layout.addWidget(self.export_map_btn)
        
        self.export_waypoints_btn = QPushButton("Export Waypoints")
        export_layout.addWidget(self.export_waypoints_btn)
        
        self.export_terrain_btn = QPushButton("Export Terrain Model")
        export_layout.addWidget(self.export_terrain_btn)
        
        controls_layout.addWidget(export_group)
        
        layout.addLayout(controls_layout)
        
        # Map view area
        map_splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Main map view
        map_view_group = QGroupBox("Terrain Map")
        map_view_layout = QVBoxLayout(map_view_group)
        self.terrain_map = QLabel("Terrain Map Will Appear Here")
        self.terrain_map.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.terrain_map.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 400px;")
        map_view_layout.addWidget(self.terrain_map)
        map_splitter.addWidget(map_view_group)
        
        # Waypoint and data panel
        waypoint_group = QGroupBox("Waypoints & Mapping Data")
        waypoint_layout = QVBoxLayout(waypoint_group)
        
        self.waypoint_list_label = QLabel("Waypoint List:")
        waypoint_layout.addWidget(self.waypoint_list_label)
        
        self.waypoints_display = QLabel("No waypoints set")
        self.waypoints_display.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.waypoints_display.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 200px; padding: 5px;")
        waypoint_layout.addWidget(self.waypoints_display)
        
        self.mapping_stats_label = QLabel("Mapping Statistics:")
        waypoint_layout.addWidget(self.mapping_stats_label)
        
        self.mapping_stats = QLabel(
            "Area Covered: 0.00 km²\n"
            "Images Captured: 0\n"
            "Estimated Completion: 00:00:00\n"
            "Resolution: 0.0 cm/px"
        )
        self.mapping_stats.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; padding: 5px;")
        waypoint_layout.addWidget(self.mapping_stats)
        
        map_splitter.addWidget(waypoint_group)
        map_splitter.setSizes([700, 300])
        
        layout.addWidget(map_splitter)
    
    def setup_detection_tab(self):
        layout = QVBoxLayout(self.detection_tab)
        
        # Detection controls
        controls_layout = QHBoxLayout()
        
        # Detection settings
        detection_settings_group = QGroupBox("Detection Settings")
        detection_settings_layout = QGridLayout(detection_settings_group)
        
        detection_settings_layout.addWidget(QLabel("Detection Mode:"), 0, 0)
        self.detection_mode_selector = QComboBox()
        self.detection_mode_selector.addItems(["People", "Animals", "Vehicles", "Combined"])
        detection_settings_layout.addWidget(self.detection_mode_selector, 0, 1)
        
        detection_settings_layout.addWidget(QLabel("Sensitivity:"), 1, 0)
        self.sensitivity_selector = QComboBox()
        self.sensitivity_selector.addItems(["Low", "Medium", "High", "Very High"])
        detection_settings_layout.addWidget(self.sensitivity_selector, 1, 1)
        
        detection_settings_layout.addWidget(QLabel("Minimum Confidence:"), 2, 0)
        self.confidence_selector = QComboBox()
        self.confidence_selector.addItems(["50%", "60%", "70%", "80%", "90%"])
        detection_settings_layout.addWidget(self.confidence_selector, 2, 1)
        
        controls_layout.addWidget(detection_settings_group)
        
        # Alert settings
        alert_settings_group = QGroupBox("Alert Settings")
        alert_settings_layout = QVBoxLayout(alert_settings_group)
        
        self.alert_people_checkbox = QCheckBox("Alert on People Detection")
        self.alert_people_checkbox.setChecked(True)
        alert_settings_layout.addWidget(self.alert_people_checkbox)
        
        self.alert_animals_checkbox = QCheckBox("Alert on Animal Detection")
        self.alert_animals_checkbox.setChecked(True)
        alert_settings_layout.addWidget(self.alert_animals_checkbox)
        
        self.alert_vehicles_checkbox = QCheckBox("Alert on Vehicle Detection")
        alert_settings_layout.addWidget(self.alert_vehicles_checkbox)
        
        self.alert_sound_checkbox = QCheckBox("Enable Sound Alerts")
        self.alert_sound_checkbox.setChecked(True)
        alert_settings_layout.addWidget(self.alert_sound_checkbox)
        
        controls_layout.addWidget(alert_settings_group)
        
        # Action settings
        action_settings_group = QGroupBox("Automatic Actions")
        action_settings_layout = QVBoxLayout(action_settings_group)
        
        self.action_hover_checkbox = QCheckBox("Hover on Detection")
        self.action_hover_checkbox.setChecked(True)
        action_settings_layout.addWidget(self.action_hover_checkbox)
        
        self.action_spotlight_checkbox = QCheckBox("Activate Spotlight on Detection")
        self.action_spotlight_checkbox.setChecked(True)
        action_settings_layout.addWidget(self.action_spotlight_checkbox)
        
        self.action_photo_checkbox = QCheckBox("Capture High-Res Photo on Detection")
        self.action_photo_checkbox.setChecked(True)
        action_settings_layout.addWidget(self.action_photo_checkbox)
        
        self.action_notify_checkbox = QCheckBox("Send Mobile Notification")
        self.action_notify_checkbox.setChecked(True)
        action_settings_layout.addWidget(self.action_notify_checkbox)
        
        controls_layout.addWidget(action_settings_group)
        
        layout.addLayout(controls_layout)
        
        # Detection view and results
        detection_layout = QHBoxLayout()
        
        # Live detection feed
        detection_feed_group = QGroupBox("Detection Feed")
        detection_feed_layout = QVBoxLayout(detection_feed_group)
        self.detection_feed = QLabel("Detection Feed Will Appear Here")
        self.detection_feed.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.detection_feed.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 400px;")
        detection_feed_layout.addWidget(self.detection_feed)
        detection_layout.addWidget(detection_feed_group, 2)
        
        # Detection results panel
        results_group = QGroupBox("Detection Results")
        results_layout = QVBoxLayout(results_group)
        
        self.detection_count_label = QLabel(
            "People Detected: 0\n"
            "Animals Detected: 0\n"
            "Vehicles Detected: 0\n"
            "Other Objects: 0"
        )
        results_layout.addWidget(self.detection_count_label)
        
        self.detection_list_label = QLabel("Recent Detections:")
        results_layout.addWidget(self.detection_list_label)
        
        self.detection_list = QLabel(
            "No detections yet"
        )
        self.detection_list.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 200px; padding: 5px;")
        self.detection_list.setAlignment(Qt.AlignmentFlag.AlignTop)
        results_layout.addWidget(self.detection_list)
        
        # Action buttons
        actions_layout = QHBoxLayout()
        
        self.save_detection_btn = QPushButton("Save Current Detection")
        actions_layout.addWidget(self.save_detection_btn)
        
        self.export_detections_btn = QPushButton("Export All Detections")
        actions_layout.addWidget(self.export_detections_btn)
        
        results_layout.addLayout(actions_layout)
        
        self.clear_detections_btn = QPushButton("Clear Detection History")
        results_layout.addWidget(self.clear_detections_btn)
        
        detection_layout.addWidget(results_group, 1)
        
        layout.addLayout(detection_layout)
    
    def setup_telemetry_tab(self):
        layout = QVBoxLayout(self.telemetry_tab)
        
        # Top telemetry widgets
        top_layout = QHBoxLayout()
        
        # Flight data
        flight_data_group = QGroupBox("Flight Data")
        flight_data_layout = QGridLayout(flight_data_group)
        
        self.altitude_label = QLabel("Altitude: 0.0 m")
        flight_data_layout.addWidget(self.altitude_label, 0, 0)
        
        self.speed_label = QLabel("Speed: 0.0 m/s")
        flight_data_layout.addWidget(self.speed_label, 0, 1)
        
        self.distance_label = QLabel("Distance: 0.0 m")
        flight_data_layout.addWidget(self.distance_label, 1, 0)
        
        self.heading_label = QLabel("Heading: 0° N")
        flight_data_layout.addWidget(self.heading_label, 1, 1)
        
        self.flight_time_label = QLabel("Flight Time: 00:00:00")
        flight_data_layout.addWidget(self.flight_time_label, 2, 0)
        
        self.flight_mode_label = QLabel("Flight Mode: N/A")
        flight_data_layout.addWidget(self.flight_mode_label, 2, 1)
        
        top_layout.addWidget(flight_data_group)
        
        # Positioning data
        positioning_group = QGroupBox("Positioning Data")
        positioning_layout = QGridLayout(positioning_group)
        
        self.latitude_label = QLabel("Latitude: 0.00000° N")
        positioning_layout.addWidget(self.latitude_label, 0, 0)
        
        self.longitude_label = QLabel("Longitude: 0.00000° E")
        positioning_layout.addWidget(self.longitude_label, 0, 1)
        
        self.gnss_signal_label = QLabel("GNSS Signal: N/A")
        positioning_layout.addWidget(self.gnss_signal_label, 1, 0)
        
        self.satellites_label = QLabel("Satellites: 0")
        positioning_layout.addWidget(self.satellites_label, 1, 1)
        
        self.position_accuracy_label = QLabel("Position Accuracy: ±0.0 m")
        positioning_layout.addWidget(self.position_accuracy_label, 2, 0, 1, 2)
        
        top_layout.addWidget(positioning_group)
        
        # Battery status
        battery_group = QGroupBox("Battery Status")
        battery_layout = QGridLayout(battery_group)
        
        self.battery_percentage_label = QLabel("Battery: 0%")
        battery_layout.addWidget(self.battery_percentage_label, 0, 0)
        
        self.battery_voltage_label = QLabel("Voltage: 0.0 V")
        battery_layout.addWidget(self.battery_voltage_label, 0, 1)
        
        self.battery_current_label = QLabel("Current: 0.0 A")
        battery_layout.addWidget(self.battery_current_label, 1, 0)
        
        self.battery_temp_label = QLabel("Temperature: 0.0°C")
        battery_layout.addWidget(self.battery_temp_label, 1, 1)
        
        self.battery_remaining_label = QLabel("Remaining Time: 00:00")
        battery_layout.addWidget(self.battery_remaining_label, 2, 0, 1, 2)
        
        top_layout.addWidget(battery_group)
        
        layout.addLayout(top_layout)
        
        # Telemetry graphs
        graphs_layout = QHBoxLayout()
        
        # Altitude graph
        altitude_group = QGroupBox("Altitude (m)")
        altitude_layout = QVBoxLayout(altitude_group)
        self.altitude_graph = pg.PlotWidget()
        self.altitude_graph.setBackground('#2a2a2a')
        self.altitude_graph.showGrid(x=True, y=True, alpha=0.3)
        self.altitude_graph.setLabel('left', 'Altitude', units='m')
        self.altitude_graph.setLabel('bottom', 'Time', units='s')
        altitude_layout.addWidget(self.altitude_graph)
        graphs_layout.addWidget(altitude_group)
        
        # Speed graph
        speed_group = QGroupBox("Speed (m/s)")
        speed_layout = QVBoxLayout(speed_group)
        self.speed_graph = pg.PlotWidget()
        self.speed_graph.setBackground('#2a2a2a')
        self.speed_graph.showGrid(x=True, y=True, alpha=0.3)
        self.speed_graph.setLabel('left', 'Speed', units='m/s')
        self.speed_graph.setLabel('bottom', 'Time', units='s')
        speed_layout.addWidget(self.speed_graph)
        graphs_layout.addWidget(speed_group)
        
        # Battery graph
        battery_graph_group = QGroupBox("Battery (%)")
        battery_graph_layout = QVBoxLayout(battery_graph_group)
        self.battery_graph = pg.PlotWidget()
        self.battery_graph.setBackground('#2a2a2a')
        self.battery_graph.showGrid(x=True, y=True, alpha=0.3)
        self.battery_graph.setLabel('left', 'Battery', units='%')
        self.battery_graph.setLabel('bottom', 'Time', units='s')
        battery_graph_layout.addWidget(self.battery_graph)
        graphs_layout.addWidget(battery_graph_group)
        
        layout.addLayout(graphs_layout)
        
        # Sensor data
        sensor_layout = QHBoxLayout()
        
        # IMU data
        imu_group = QGroupBox("IMU Data")
        imu_layout = QGridLayout(imu_group)
        
        self.roll_label = QLabel("Roll: 0.0°")
        imu_layout.addWidget(self.roll_label, 0, 0)
        
        self.pitch_label = QLabel("Pitch: 0.0°")
        imu_layout.addWidget(self.pitch_label, 0, 1)
        
        self.yaw_label = QLabel("Yaw: 0.0°")
        imu_layout.addWidget(self.yaw_label, 0, 2)
        
        self.acc_x_label = QLabel("Acc X: 0.0 m/s²")
        imu_layout.addWidget(self.acc_x_label, 1, 0)
        
        self.acc_y_label = QLabel("Acc Y: 0.0 m/s²")
        imu_layout.addWidget(self.acc_y_label, 1, 1)
        
        self.acc_z_label = QLabel("Acc Z: 0.0 m/s²")
        imu_layout.addWidget(self.acc_z_label, 1, 2)
        
        sensor_layout.addWidget(imu_group)
        
        # Environmental data
        env_group = QGroupBox("Environmental Data")
        env_layout = QGridLayout(env_group)
        
        self.temperature_label = QLabel("Temperature: 0.0°C")
        env_layout.addWidget(self.temperature_label, 0, 0)
        
        self.pressure_label = QLabel("Pressure: 0.0 hPa")
        env_layout.addWidget(self.pressure_label, 0, 1)
        
        self.wind_speed_label = QLabel("Wind Speed: 0.0 m/s")
        env_layout.addWidget(self.wind_speed_label, 1, 0)
        
        self.wind_direction_label = QLabel("Wind Direction: 0° N")
        env_layout.addWidget(self.wind_direction_label, 1, 1)
        
        sensor_layout.addWidget(env_group)
        
        # Camera data
        camera_group = QGroupBox("Camera Status")
        camera_layout = QGridLayout(camera_group)
        
        self.camera_mode_label = QLabel("Mode: N/A")
        camera_layout.addWidget(self.camera_mode_label, 0, 0)
        
        self.camera_status_label = QLabel("Status: N/A")
        camera_layout.addWidget(self.camera_status_label, 0, 1)
        
        self.camera_storage_label = QLabel("Storage: 0.0 GB Free")
        camera_layout.addWidget(self.camera_storage_label, 1, 0)
        
        self.camera_shots_label = QLabel("Shots Taken: 0")
        camera_layout.addWidget(self.camera_shots_label, 1, 1)
        
        sensor_layout.addWidget(camera_group)
        
        layout.addLayout(sensor_layout)
        
        # Telemetry log
        log_group = QGroupBox("Telemetry Log")
        log_layout = QVBoxLayout(log_group)
        
        self.telemetry_log = QLabel("No telemetry data received yet")
        self.telemetry_log.setStyleSheet("background-color: #2a2a2a; border: 1px dashed #5a5a5a; min-height: 100px; padding: 5px;")
        self.telemetry_log.setAlignment(Qt.AlignmentFlag.AlignTop)
        log_layout.addWidget(self.telemetry_log)
        
        log_buttons_layout = QHBoxLayout()
        
        self.clear_log_btn = QPushButton("Clear Log")
        log_buttons_layout.addWidget(self.clear_log_btn)
        
        self.export_log_btn = QPushButton("Export Log")
        log_buttons_layout.addWidget(self.export_log_btn)
        
        log_layout.addLayout(log_buttons_layout)
        
        layout.addWidget(log_group)
    
    def setup_settings_tab(self):
        layout = QVBoxLayout(self.settings_tab)
        
        # Connection settings
        connection_group = QGroupBox("Connection Settings")
        connection_layout = QGridLayout(connection_group)
        
        connection_layout.addWidget(QLabel("Connection Type:"), 0, 0)
        self.connection_type_selector = QComboBox()
        self.connection_type_selector.addItems(["USB", "Wi-Fi", "Remote Controller"])
        connection_layout.addWidget(self.connection_type_selector, 0, 1)
        
        connection_layout.addWidget(QLabel("Device IP:"), 1, 0)
        self.device_ip_input = QLineEdit("192.168.0.1")
        connection_layout.addWidget(self.device_ip_input, 1, 1)
        
        connection_layout.addWidget(QLabel("Port:"), 2, 0)
        self.device_port_input = QLineEdit("8080")
        connection_layout.addWidget(self.device_port_input, 2, 1)
        
        self.connect_btn = QPushButton("Connect to Drone")
        connection_layout.addWidget(self.connect_btn, 3, 0, 1, 2)
        
        layout.addWidget(connection_group)
        
        # Mock Data Settings
        mock_settings_group = QGroupBox("Mock Data Settings")
        mock_settings_layout = QGridLayout(mock_settings_group)
        
        mock_settings_layout.addWidget(QLabel("Simulated Flight Path:"), 0, 0)
        self.mock_path_selector = QComboBox()
        self.mock_path_selector.addItems(["Grid Pattern", "Circular Pattern", "Random Movement", "Stationary"])
        mock_settings_layout.addWidget(self.mock_path_selector, 0, 1)
        
        mock_settings_layout.addWidget(QLabel("Simulated Detections:"), 1, 0)
        self.mock_detections_selector = QComboBox()
        self.mock_detections_selector.addItems(["None", "Occasional", "Frequent", "Predefined Scenario"])
        mock_settings_layout.addWidget(self.mock_detections_selector, 1, 1)
        
        mock_settings_layout.addWidget(QLabel("Data Update Rate (ms):"), 2, 0)
        self.mock_rate_input = QLineEdit("500")
        mock_settings_layout.addWidget(self.mock_rate_input, 2, 1)
        
        self.apply_mock_settings_btn = QPushButton("Apply Mock Settings")
        mock_settings_layout.addWidget(self.apply_mock_settings_btn, 3, 0, 1, 2)
        
        layout.addWidget(mock_settings_group)
        
        # Application settings
        app_settings_group = QGroupBox("Application Settings")
        app_settings_layout = QGridLayout(app_settings_group)
        
        app_settings_layout.addWidget(QLabel("UI Theme:"), 0, 0)
        self.theme_selector = QComboBox()
        self.theme_selector.addItems(["Dark (Default)", "Light", "System"])
        app_settings_layout.addWidget(self.theme_selector, 0, 1)
        
        app_settings_layout.addWidget(QLabel("Map Provider:"), 1, 0)
        self.map_provider_selector = QComboBox()
        self.map_provider_selector.addItems(["Google Maps", "Bing Maps", "OpenStreetMap", "DJI Maps"])
        app_settings_layout.addWidget(self.map_provider_selector, 1, 1)
        
        app_settings_layout.addWidget(QLabel("Units:"), 2, 0)
        self.units_selector = QComboBox()
        self.units_selector.addItems(["Metric", "Imperial"])
        app_settings_layout.addWidget(self.units_selector, 2, 1)
        
        app_settings_layout.addWidget(QLabel("Log Level:"), 3, 0)
        self.log_level_selector = QComboBox()
        self.log_level_selector.addItems(["Error", "Warning", "Info", "Debug", "Verbose"])
        app_settings_layout.addWidget(self.log_level_selector, 3, 1)
        
        app_settings_layout.addWidget(QLabel("Data Save Path:"), 4, 0)
        self.save_path_layout = QHBoxLayout()
        self.save_path_input = QLineEdit("/home/soldering/Videos/3D/mission_data")
        self.save_path_layout.addWidget(self.save_path_input)
        self.browse_path_btn = QPushButton("Browse")
        self.save_path_layout.addWidget(self.browse_path_btn)
        app_settings_layout.addLayout(self.save_path_layout, 4, 1)
        
        self.save_settings_btn = QPushButton("Save Settings")
        app_settings_layout.addWidget(self.save_settings_btn, 5, 0, 1, 2)
        
        layout.addWidget(app_settings_group)
        
        # About and version
        about_group = QGroupBox("About")
        about_layout = QVBoxLayout(about_group)
        
        self.about_label = QLabel(
            "<b>Search and Rescue Mission Control</b><br>"
            "Version 1.0.0<br>"
            "© 2023 Search and Rescue Solutions<br>"
            "<br>"
            "Designed for emergency mission control with DJI Matrice drone integration.<br>"
            "Includes GNSS navigation, AL1 Spotlight control, and Terra mapping SDK."
        )
        self.about_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        about_layout.addWidget(self.about_label)
        
        layout.addWidget(about_group)
    
    def init_modules(self):
        """Initialize backend modules"""
        # Initialize in mock mode
        self.drone_controller = DroneController(mock_mode=self.mock_mode)
        self.mapping_module = MappingModule(mock_mode=self.mock_mode)
        self.detection_module = DetectionModule(mock_mode=self.mock_mode)
        self.mission_planner = MissionPlanner(mock_mode=self.mock_mode)
        self.telemetry_parser = TelemetryParser(mock_mode=self.mock_mode)
        
        # Start mock data generation if in mock mode
        if self.mock_mode:
            self.mock_data_generator = MockDataGenerator(update_interval=500)  # 500ms update interval
            self.mock_data_generator.start()
        
        # Setup data refresh timer
        self.update_timer = QTimer()
        self.update_timer.timeout.connect(self.update_ui_data)
        self.update_timer.start(500)  # Update UI every 500ms
        
    def connect_signals(self):
        """Connect UI signals and slots"""
        # Connect mission control buttons
        self.connect_btn.clicked.connect(self.connect_to_drone)
        self.generate_mission_btn.clicked.connect(self.generate_mission)
        self.upload_mission_btn.clicked.connect(self.upload_mission)
        
        # Connect mock settings
        self.apply_mock_settings_btn.clicked.connect(self.apply_mock_settings)
        
        # Connect settings buttons
        self.save_settings_btn.clicked.connect(self.save_settings)
        
    def change_mode(self, index):
        """Switch between mock and production modes"""
        if index == 0:  # Mock mode
            self.mock_mode = True
            self.mode_indicator.setText("MOCK MODE ACTIVE")
            self.mode_indicator.setStyleSheet("color: orange; font-weight: bold")
            self.statusBar.showMessage("Switched to Mock Mode")
        else:  # Production mode
            self.mock_mode = False
            self.mode_indicator.setText("PRODUCTION MODE ACTIVE")
            self.mode_indicator.setStyleSheet("color: green; font-weight: bold")
            self.statusBar.showMessage("Switched to Production Mode")
            
        # Update modules with new mode
        self.drone_controller.set_mock_mode(self.mock_mode)
        self.mapping_module.set_mock_mode(self.mock_mode)
        self.detection_module.set_mock_mode(self.mock_mode)
        self.mission_planner.set_mock_mode(self.mock_mode)
        self.telemetry_parser.set_mock_mode(self.mock_mode)
        
        # Start/stop mock data generator
        if self.mock_mode and not hasattr(self, 'mock_data_generator'):
            self.mock_data_generator = MockDataGenerator(update_interval=500)
            self.mock_data_generator.start()
        elif not self.mock_mode and hasattr(self, 'mock_data_generator'):
            self.mock_data_generator.stop()
            delattr(self, 'mock_data_generator')
    
    def update_ui_data(self):
        """Update UI with latest data from modules"""
        if self.mock_mode:
            # Update with mock data
            mock_data = self.mock_data_generator.get_current_data()
            
            # Update flight data
            self.altitude_label.setText(f"Altitude: {mock_data['altitude']:.1f} m")
            self.speed_label.setText(f"Speed: {mock_data['speed']:.1f} m/s")
            self.distance_label.setText(f"Distance: {mock_data['distance']:.1f} m")
            self.heading_label.setText(f"Heading: {mock_data['heading']}° N")
            self.flight_time_label.setText(f"Flight Time: {mock_data['flight_time']}")
            
            # Update positioning data
            self.latitude_label.setText(f"Latitude: {mock_data['latitude']:.5f}° N")
            self.longitude_label.setText(f"Longitude: {mock_data['longitude']:.5f}° E")
            self.gnss_signal_label.setText(f"GNSS Signal: {mock_data['gnss_signal']}")
            
            # Update battery data
            self.battery_percentage_label.setText(f"Battery: {mock_data['battery']}%")
            
            # Update connection status
            if mock_data['connected']:
                self.connection_status.setText("CONNECTED")
                self.connection_status.setStyleSheet("color: #55ff55; font-weight: bold")
            
            # Update GNSS status
            if mock_data['gnss_signal'] != "No Signal":
                self.gnss_status.setText(mock_data['gnss_signal'])
                self.gnss_status.setStyleSheet("color: #55ff55; font-weight: bold")
            
            # Update battery status
            self.battery_status.setText(f"{mock_data['battery']}%")
            
            # Update telemetry log
            current_time = datetime.now().strftime("%H:%M:%S")
            self.telemetry_log.setText(f"{current_time} - Alt: {mock_data['altitude']:.1f}m, Spd: {mock_data['speed']:.1f}m/s, Bat: {mock_data['battery']}%\n" + self.telemetry_log.text())
        else:
            # In production mode, get real data from modules
            try:
                telemetry_data = self.telemetry_parser.get_latest_telemetry()
                if telemetry_data:
                    # Update UI with real telemetry data
                    # This would be implemented with real data sources
                    pass
            except Exception as e:
                self.statusBar.showMessage(f"Error updating telemetry: {str(e)}")
    
    def connect_to_drone(self):
        """Connect to the drone"""
        if self.mock_mode:
            # Simulate connection in mock mode
            self.statusBar.showMessage("Connected to drone (Mock Mode)")
            self.connection_status.setText("CONNECTED")
            self.connection_status.setStyleSheet("color: #55ff55; font-weight: bold")
        else:
            # Attempt real connection in production mode
            try:
                connection_type = self.connection_type_selector.currentText()
                device_ip = self.device_ip_input.text()
                device_port = int(self.device_port_input.text())
                
                success = self.drone_controller.connect(connection_type, device_ip, device_port)
                
                if success:
                    self.statusBar.showMessage(f"Connected to drone at {device_ip}:{device_port}")
                    self.connection_status.setText("CONNECTED")
                    self.connection_status.setStyleSheet("color: #55ff55; font-weight: bold")
                else:
                    self.statusBar.showMessage("Failed to connect to drone")
            except Exception as e:
                self.statusBar.showMessage(f"Connection error: {str(e)}")
    
    def generate_mission(self):
        """Generate a mission plan"""
        mission_type = self.mission_type_selector.currentText()
        
        try:
            grid_size = float(self.grid_size_input.text())
            altitude = float(self.altitude_input.text())
            speed = float(self.speed_input.text())
            capture_interval = float(self.interval_input.text())
            
            # Call mission planner to generate waypoints
            mission_data = self.mission_planner.generate_mission(
                mission_type=mission_type,
                grid_size=grid_size,
                altitude=altitude,
                speed=speed,
                capture_interval=capture_interval,
                directional_capture=self.directional_checkbox.isChecked(),
                spotlight_enabled=self.spotlight_checkbox.isChecked()
            )
            
            # Update waypoints display
            waypoints_text = "Waypoints:\n"
            for i, wp in enumerate(mission_data['waypoints'][:5]):
                waypoints_text += f"{i+1}. Lat: {wp['lat']:.5f}, Lon: {wp['lon']:.5f}, Alt: {wp['alt']}m\n"
            
            if len(mission_data['waypoints']) > 5:
                waypoints_text += f"... {len(mission_data['waypoints']) - 5} more waypoints ..."
                
            self.waypoints_display.setText(waypoints_text)
            
            # Update mission info
            self.mission_status_label.setText("Status: Ready")
            
            self.statusBar.showMessage(f"Mission plan generated: {mission_type} with {len(mission_data['waypoints'])} waypoints")
        except ValueError as e:
            self.statusBar.showMessage(f"Invalid input: {str(e)}")
        except Exception as e:
            self.statusBar.showMessage(f"Error generating mission: {str(e)}")
    
    def upload_mission(self):
        """Upload mission to drone"""
        if self.mock_mode:
            # Simulate upload in mock mode
            self.statusBar.showMessage("Mission uploaded to drone (Mock Mode)")
            self.mission_status_label.setText("Status: Uploaded")
        else:
            # Attempt real upload in production mode
            try:
                success = self.drone_controller.upload_mission()
                
                if success:
                    self.statusBar.showMessage("Mission uploaded to drone")
                    self.mission_status_label.setText("Status: Uploaded")
                else:
                    self.statusBar.showMessage("Failed to upload mission")
            except Exception as e:
                self.statusBar.showMessage(f"Upload error: {str(e)}")
    
    def start_mission(self):
        """Start the mission"""
        if self.mock_mode:
            # Simulate mission start in mock mode
            self.statusBar.showMessage("Mission started (Mock Mode)")
            self.mission_status_label.setText("Status: In Progress")
        else:
            # Attempt real mission start in production mode
            try:
                success = self.drone_controller.start_mission()
                
                if success:
                    self.statusBar.showMessage("Mission started")
                    self.mission_status_label.setText("Status: In Progress")
                else:
                    self.statusBar.showMessage("Failed to start mission")
            except Exception as e:
                self.statusBar.showMessage(f"Mission start error: {str(e)}")
    
    def pause_mission(self):
        """Pause the mission"""
        if self.mock_mode:
            # Simulate mission pause in mock mode
            self.statusBar.showMessage("Mission paused (Mock Mode)")
            self.mission_status_label.setText("Status: Paused")
        else:
            # Attempt real mission pause in production mode
            try:
                success = self.drone_controller.pause_mission()
                
                if success:
                    self.statusBar.showMessage("Mission paused")
                    self.mission_status_label.setText("Status: Paused")
                else:
                    self.statusBar.showMessage("Failed to pause mission")
            except Exception as e:
                self.statusBar.showMessage(f"Mission pause error: {str(e)}")
    
    def end_mission(self):
        """End the mission"""
        if self.mock_mode:
            # Simulate mission end in mock mode
            self.statusBar.showMessage("Mission ended (Mock Mode)")
            self.mission_status_label.setText("Status: Completed")
        else:
            # Attempt real mission end in production mode
            try:
                success = self.drone_controller.end_mission()
                
                if success:
                    self.statusBar.showMessage("Mission ended")
                    self.mission_status_label.setText("Status: Completed")
                else:
                    self.statusBar.showMessage("Failed to end mission")
            except Exception as e:
                self.statusBar.showMessage(f"Mission end error: {str(e)}")
    
    def return_home(self):
        """Return to home point"""
        if self.mock_mode:
            # Simulate return to home in mock mode
            self.statusBar.showMessage("Returning to home (Mock Mode)")
        else:
            # Attempt real return to home in production mode
            try:
                success = self.drone_controller.return_to_home()
                
                if success:
                    self.statusBar.showMessage("Returning to home")
                else:
                    self.statusBar.showMessage("Failed to initiate return to home")
            except Exception as e:
                self.statusBar.showMessage(f"Return to home error: {str(e)}")
    
    def emergency_stop(self):
        """Emergency stop procedure"""
        if self.mock_mode:
            # Simulate emergency stop in mock mode
            self.statusBar.showMessage("EMERGENCY STOP ACTIVATED (Mock Mode)")
        else:
            # Attempt real emergency stop in production mode
            try:
                success = self.drone_controller.emergency_stop()
                
                if success:
                    self.statusBar.showMessage("EMERGENCY STOP ACTIVATED")
                else:
                    self.statusBar.showMessage("Failed to activate emergency stop")
            except Exception as e:
                self.statusBar.showMessage(f"Emergency stop error: {str(e)}")
    
    def apply_mock_settings(self):
        """Apply mock data settings"""
        if self.mock_mode and hasattr(self, 'mock_data_generator'):
            try:
                flight_path = self.mock_path_selector.currentText()
                detection_mode = self.mock_detections_selector.currentText()
                update_rate = int(self.mock_rate_input.text())
                
                self.mock_data_generator.configure(
                    flight_path=flight_path,
                    detection_mode=detection_mode,
                    update_interval=update_rate
                )
                
                self.statusBar.showMessage(f"Applied mock settings: {flight_path}, {detection_mode}, {update_rate}ms")
            except ValueError as e:
                self.statusBar.showMessage(f"Invalid input: {str(e)}")
            except Exception as e:
                self.statusBar.showMessage(f"Error applying mock settings: {str(e)}")
    
    def save_settings(self):
        """Save application settings"""
        try:
            settings = {
                'theme': self.theme_selector.currentText(),
                'map_provider': self.map_provider_selector.currentText(),
                'units': self.units_selector.currentText(),
                'log_level': self.log_level_selector.currentText(),
                'save_path': self.save_path_input.text(),
                'connection': {
                    'type': self.connection_type_selector.currentText(),
                    'ip': self.device_ip_input.text(),
                    'port': self.device_port_input.text()
                }
            }
            
            self.settings.save_settings(settings)
            self.statusBar.showMessage("Settings saved successfully")
        except Exception as e:
            self.statusBar.showMessage(f"Error saving settings: {str(e)}")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SARMissionControl()
    window.show()
    sys.exit(app.exec())
