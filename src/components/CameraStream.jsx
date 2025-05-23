import React, { useRef, useEffect, useState } from 'react';
import BoundingBoxOverlay from './BoundingBoxOverlay';
import './CameraStream.css';

const CameraStream = ({ onFrameCapture, espIpAddress }) => {
  const streamRef = useRef(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [streamSize, setStreamSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (espIpAddress) {
      const url = `http://${espIpAddress}/mjpeg/1`;
      setStreamUrl(url);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [espIpAddress]);

  // Mendapatkan ukuran stream untuk overlay
  useEffect(() => {
    if (streamRef.current) {
      const updateDimensions = () => {
        setStreamSize({
          width: streamRef.current.offsetWidth,
          height: streamRef.current.offsetHeight,
        });
      };

      // Initial size
      updateDimensions();
      
      // Update ketika ukuran berubah
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [isConnected]);

  return (
    <div className="camera-stream-container">
      {isConnected ? (
        <div className="stream-wrapper" ref={streamRef}>
          <img 
            src={streamUrl} 
            alt="ESP32-CAM Stream" 
            className="camera-stream"
          />
          <BoundingBoxOverlay 
            width={streamSize.width} 
            height={streamSize.height} 
          />
        </div>
      ) : (
        <div className="no-stream">
          <p>Masukkan alamat IP ESP32-CAM untuk mulai streaming</p>
        </div>
      )}
    </div>
  );
};

export default CameraStream;