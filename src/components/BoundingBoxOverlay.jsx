import React, { useState, useEffect } from 'react';
import './BoundingBoxOverlay.css';

const BoundingBoxOverlay = ({ width, height, boxes = [] }) => {
  const [boundingBoxes, setBoundingBoxes] = useState([]);

  useEffect(() => {
    setBoundingBoxes(boxes);
  }, [boxes]);

  return (
    <div 
      className="bounding-box-overlay" 
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {boundingBoxes.map((box, index) => (
        <div 
          key={index}
          className="bounding-box"
          style={{
            left: `${box.x * width}px`,
            top: `${box.y * height}px`,
            width: `${box.width * width}px`,
            height: `${box.height * height}px`,
          }}
        >
          <div className="label">
            {box.label} ({Math.round(box.value * 100)}%)
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoundingBoxOverlay;