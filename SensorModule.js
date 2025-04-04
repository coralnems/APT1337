/**
 * SensorModule.js
 * A module for managing and processing sensor data in a 3D environment
 */

class SensorModule {
  constructor(options = {}) {
    this.sensors = {};
    this.isInitialized = false;
    this.updateInterval = options.updateInterval || 100; // ms
    this.dataBuffer = [];
    this.bufferSize = options.bufferSize || 10;
    this.callbacks = {
      onData: options.onData || null,
      onError: options.onError || console.error
    };
  }

  /**
   * Initialize the sensor module with specific sensor configurations
   * @param {Object} sensorConfigs - Configuration for different sensors
   * @returns {Promise} - Resolves when initialization is complete
   */
  async initialize(sensorConfigs = {}) {
    try {
      if (this.isInitialized) {
        throw new Error('Sensor module already initialized');
      }
      
      for (const [sensorId, config] of Object.entries(sensorConfigs)) {
        await this.addSensor(sensorId, config);
      }
      
      this.isInitialized = true;
      this.startUpdates();
      return true;
    } catch (error) {
      this.callbacks.onError('Initialization failed:', error);
      return false;
    }
  }

  /**
   * Add a new sensor to the module
   * @param {String} sensorId - Unique identifier for the sensor
   * @param {Object} config - Sensor configuration
   * @returns {Promise} - Resolves when sensor is added
   */
  async addSensor(sensorId, config) {
    if (this.sensors[sensorId]) {
      throw new Error(`Sensor with ID ${sensorId} already exists`);
    }

    this.sensors[sensorId] = {
      type: config.type,
      range: config.range || { min: 0, max: 100 },
      precision: config.precision || 2,
      calibration: config.calibration || { offset: 0, scale: 1 },
      lastReading: null,
      status: 'ready'
    };

    // Perform any sensor-specific initialization
    if (config.initFunction) {
      await config.initFunction(this.sensors[sensorId]);
    }

    return this.sensors[sensorId];
  }

  /**
   * Start regular sensor updates
   */
  startUpdates() {
    if (!this.isInitialized) {
      throw new Error('Cannot start updates before initialization');
    }
    
    this.updateInterval = setInterval(() => {
      this.readAllSensors();
    }, this.updateInterval);
  }

  /**
   * Stop regular sensor updates
   */
  stopUpdates() {
    clearInterval(this.updateInterval);
  }

  /**
   * Read data from all sensors
   * @returns {Object} - Data from all sensors
   */
  readAllSensors() {
    const readings = {};
    
    for (const [sensorId, sensor] of Object.entries(this.sensors)) {
      try {
        readings[sensorId] = this.readSensor(sensorId);
      } catch (error) {
        this.callbacks.onError(`Error reading sensor ${sensorId}:`, error);
        readings[sensorId] = null;
      }
    }
    
    this.processReadings(readings);
    return readings;
  }

  /**
   * Read data from a specific sensor
   * @param {String} sensorId - ID of the sensor to read
   * @returns {*} - Sensor reading
   */
  readSensor(sensorId) {
    const sensor = this.sensors[sensorId];
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }
    
    // Simulate reading from sensor (would interface with actual sensor in production)
    const rawValue = Math.random() * (sensor.range.max - sensor.range.min) + sensor.range.min;
    
    // Apply calibration
    const calibratedValue = this.calibrate(rawValue, sensor.calibration);
    
    // Apply precision
    const processedValue = Number(calibratedValue.toFixed(sensor.precision));
    
    // Update sensor state
    sensor.lastReading = {
      timestamp: Date.now(),
      value: processedValue,
      raw: rawValue
    };
    
    return sensor.lastReading;
  }

  /**
   * Apply calibration to sensor reading
   * @param {Number} value - Raw sensor value
   * @param {Object} calibration - Calibration parameters
   * @returns {Number} - Calibrated value
   */
  calibrate(value, calibration) {
    return value * calibration.scale + calibration.offset;
  }

  /**
   * Process collected sensor readings
   * @param {Object} readings - All sensor readings
   */
  processReadings(readings) {
    this.dataBuffer.push({
      timestamp: Date.now(),
      readings
    });
    
    // Maintain buffer size
    if (this.dataBuffer.length > this.bufferSize) {
      this.dataBuffer.shift();
    }
    
    // Invoke callback if defined
    if (this.callbacks.onData) {
      this.callbacks.onData(readings, this.dataBuffer);
    }
  }

  /**
   * Get the latest reading from a sensor
   * @param {String} sensorId - ID of the sensor
   * @returns {*} - Latest sensor reading or null
   */
  getLatestReading(sensorId) {
    if (!this.sensors[sensorId]) {
      throw new Error(`Sensor ${sensorId} not found`);
    }
    return this.sensors[sensorId].lastReading;
  }

  /**
   * Get all historic readings in the buffer
   * @returns {Array} - Buffer of historic readings
   */
  getHistoricReadings() {
    return [...this.dataBuffer];
  }

  /**
   * Calculate statistics for a specific sensor
   * @param {String} sensorId - ID of the sensor
   * @returns {Object} - Statistical data
   */
  calculateStats(sensorId) {
    if (!this.sensors[sensorId]) {
      throw new Error(`Sensor ${sensorId} not found`);
    }
    
    const values = this.dataBuffer
      .map(item => item.readings[sensorId]?.value)
      .filter(value => value !== undefined && value !== null);
    
    if (values.length === 0) {
      return { min: null, max: null, avg: null };
    }
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    };
  }

  /**
   * Clean up resources used by the sensor module
   */
  cleanup() {
    this.stopUpdates();
    this.isInitialized = false;
    this.dataBuffer = [];
    
    // Perform any additional cleanup for specific sensors
    for (const sensorId in this.sensors) {
      if (this.sensors[sensorId].cleanup) {
        this.sensors[sensorId].cleanup();
      }
    }
  }
}

// Export the module
module.exports = SensorModule;
