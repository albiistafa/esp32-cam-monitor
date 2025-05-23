import React from 'react';
import './AIResult.css';

const AIResults = ({ cameraData }) => {
  if (!cameraData) {
    return <div className="ai-results empty">No results yet</div>;
  }

  // Fungsi untuk menentukan status deteksi
  const getDetectionStatus = () => {
    const faceDetected = cameraData.face_detected;
    const uniformDetected = cameraData.uniform_detected;

    // No Action - Jika wajah NULL
    if (!faceDetected || faceDetected === "NULL") {
      return {
        status: "warning",
        message: "No Action"
      };
    }

    // Terdeteksi - Wajah terdeteksi dan seragam lab
    if (faceDetected !== "Unknown" && uniformDetected === "Seragam Lab") {
      return {
        status: "success",
        message: "Terdeteksi"
      };
    }

    // Tidak Terdeteksi - Wajah Unknown atau tidak pakai seragam lab
    if (faceDetected === "Unknown" || uniformDetected !== "Seragam Lab") {
      return {
        status: "error",
        message: "Tidak Terdeteksi"
      };
    }

    // Default case
    return {
      status: "warning",
      message: "No Action"
    };
  };

  const detectionStatus = getDetectionStatus();

  return (
    <div className="ai-results">
      <h3>AI Detection Results</h3>
      <div className="result-item">
        <strong>Status Deteksi:</strong>
        <span className={detectionStatus.status}>{detectionStatus.message}</span>
      </div>
      <div className="result-description">
        {detectionStatus.description}
      </div>
    </div>
  );
};

export default AIResults;