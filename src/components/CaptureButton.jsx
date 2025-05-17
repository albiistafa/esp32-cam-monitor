import React from 'react';
import './CaptureButton.css';

const CaptureButton = ({ onCapture, disabled }) => {
  return (
    <button 
      className="capture-button" 
      onClick={onCapture}
      disabled={disabled}
    >
      <span className="camera-icon">📷</span>
      Capture
    </button>
  );
};

export default CaptureButton;