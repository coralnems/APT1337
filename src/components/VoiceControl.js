import React, { useState, useEffect, useRef } from 'react';
import './VoiceControl.css';

// Mock DJI Neo Voice SDK integration
const DJINeoVoiceSDK = {
  init: (config) => {
    console.log('Initializing DJI Neo Voice SDK with config:', config);
    return Promise.resolve({ status: 'success', message: 'SDK initialized' });
  },
  startListening: () => {
    console.log('Starting voice recognition');
    return Promise.resolve(true);
  },
  stopListening: () => {
    console.log('Stopping voice recognition');
    return Promise.resolve(true);
  },
  processCommand: (command) => {
    console.log('Processing command:', command);
    // Simulate command processing time
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          status: 'success', 
          command: command, 
          executed: true 
        });
      }, 800);
    });
  },
  getAvailableCommands: () => {
    return Promise.resolve([
      { command: "take off", description: "Launch the drone" },
      { command: "land", description: "Land the drone at current position" },
      { command: "return home", description: "Return to takeoff point" },
      { command: "hover", description: "Hold position and altitude" },
      { command: "ascend", description: "Increase altitude" },
      { command: "descend", description: "Decrease altitude" },
      { command: "forward", description: "Move drone forward" },
      { command: "backward", description: "Move drone backward" },
      { command: "left", description: "Move drone left" },
      { command: "right", description: "Move drone right" },
      { command: "rotate left", description: "Rotate drone counter-clockwise" },
      { command: "rotate right", description: "Rotate drone clockwise" },
      { command: "follow me", description: "Enter follow me mode" },
      { command: "orbit mode", description: "Enter orbit mode" },
      { command: "take photo", description: "Capture a single photo" },
      { command: "start recording", description: "Begin video recording" },
      { command: "stop recording", description: "End video recording" },
      { command: "emergency stop", description: "Immediately stop all motors" },
    ]);
  }
};

function VoiceControl({ isConnected }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [availableCommands, setAvailableCommands] = useState([]);
  const [micPermission, setMicPermission] = useState(null);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize SDK on component mount
  useEffect(() => {
    if (isConnected) {
      DJINeoVoiceSDK.init({
        language: 'en-US',
        sensitivity: 0.8,
        noiseThreshold: 0.2
      }).then(() => {
        DJINeoVoiceSDK.getAvailableCommands().then(commands => {
          setAvailableCommands(commands);
        });
      });
    }
    
    // Clean up on unmount
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isConnected]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermission('granted');
      
      // Initialize audio analyzer
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Enable voice control
      setVoiceEnabled(true);
      updateMicrophoneLevel();
      
      return true;
    } catch (error) {
      console.error('Error getting microphone permission:', error);
      setMicPermission('denied');
      return false;
    }
  };

  // Update microphone input level visualization
  const updateMicrophoneLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const level = Math.min(100, average * 2); // Scale to 0-100
    setMicrophoneLevel(level);
    
    // Continue updating if listening
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateMicrophoneLevel);
    }
  };

  // Toggle voice recognition
  const toggleVoiceRecognition = async () => {
    if (!voiceEnabled) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }
    
    if (!isListening) {
      // Start listening
      DJINeoVoiceSDK.startListening().then(() => {
        setIsListening(true);
        animationFrameRef.current = requestAnimationFrame(updateMicrophoneLevel);
        
        // Simulate voice commands for demo purposes
        simulateVoiceCommands();
      });
    } else {
      // Stop listening
      DJINeoVoiceSDK.stopListening().then(() => {
        setIsListening(false);
        setCurrentCommand('');
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      });
    }
  };

  // Simulate voice commands for demonstration
  const simulateVoiceCommands = () => {
    // Only run in demo mode when listening
    if (!isListening) return;
    
    const demoCommands = [
      "hover",
      "ascend",
      "take photo",
      "rotate right",
      "forward",
      "hover"
    ];
    
    let commandIndex = 0;
    
    const simulateNextCommand = () => {
      if (commandIndex < demoCommands.length && isListening) {
        const command = demoCommands[commandIndex];
        
        // Show recognized command
        setCurrentCommand(command);
        
        // Process the command
        setTimeout(() => {
          processCommand(command);
          commandIndex++;
          
          // Schedule next command
          setTimeout(simulateNextCommand, 5000);
        }, 1000);
      }
    };
    
    // Start the simulation after 3 seconds
    setTimeout(simulateNextCommand, 3000);
  };

  // Process a voice command
  const processCommand = (command) => {
    DJINeoVoiceSDK.processCommand(command).then(result => {
      setCurrentCommand('');
      
      const logEntry = {
        id: Date.now(),
        command: command,
        timestamp: new Date(),
        status: result.executed ? 'executed' : 'failed'
      };
      
      setCommandLog(prev => [logEntry, ...prev]);
    });
  };

  // Format timestamp for command log
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="voice-control">
      <h2>Voice Control</h2>
      
      <div className="voice-control-main">
        <div className="voice-status">
          <div className="microphone-container">
            <div className="microphone-visualizer">
              <div 
                className="microphone-level" 
                style={{ height: `${microphoneLevel}%` }}
              ></div>
            </div>
            <button 
              className={`microphone-button ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceRecognition}
              disabled={!isConnected}
            >
              {!voiceEnabled ? '🎙️ Enable Voice' : 
               isListening ? '🔴 Stop Listening' : '🎙️ Start Listening'}
            </button>
            {micPermission === 'denied' && (
              <div className="mic-error">
                Microphone access denied. Please enable in browser settings.
              </div>
            )}
          </div>
          
          <div className="current-command">
            {currentCommand && (
              <>
                <div className="recognizing">Recognized Command:</div>
                <div className="command-text">{currentCommand}</div>
                <div className="processing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="command-history">
          <h3>Command History</h3>
          {commandLog.length === 0 ? (
            <div className="no-commands">No commands yet. Try speaking to the drone.</div>
          ) : (
            <ul className="command-log">
              {commandLog.map(entry => (
                <li 
                  key={entry.id} 
                  className={`log-entry ${entry.status}`}
                >
                  <span className="log-time">{formatTimestamp(entry.timestamp)}</span>
                  <span className="log-command">{entry.command}</span>
                  <span className={`log-status ${entry.status}`}>
                    {entry.status === 'executed' ? '✓' : '✗'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="commands-reference">
        <h3>Available Voice Commands</h3>
        <div className="commands-grid">
          {availableCommands.map((cmd, index) => (
            <div key={index} className="command-item">
              <div className="command-name">"{cmd.command}"</div>
              <div className="command-desc">{cmd.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceControl;
