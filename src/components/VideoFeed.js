import React from 'react';
import './VideoFeed.css';

const VideoFeed = ({ feedType }) => {
  const getFeedClass = () => {
    switch (feedType) {
      case 'drone':
        return 'drone-camera-feed';
      case 'thermal':
        return 'thermal-camera-feed';
      case 'wide':
        return 'wide-angle-feed';
      case 'zoom':
        return 'zoom-camera-feed';
      default:
        return 'default-feed';
    }
  };

  const getFeedLabel = () => {
    switch (feedType) {
      case 'drone':
        return 'Drone Camera Feed';
      case 'thermal':
        return 'Thermal Camera Feed';
      case 'wide':
        return 'Wide Angle Feed';
      case 'zoom':
        return 'Zoom Camera Feed';
      default:
        return 'Video Feed';
    }
  };

  return (
    <div className={`video-feed ${getFeedClass()}`}>
      <div>{getFeedLabel()}</div>
      {/* Video feed will be placed here */}
    </div>
  );
};

export default VideoFeed;
