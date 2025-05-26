import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './AIResult.css';

const AIResults = ({ cameraData }) => {
  const { isDarkMode } = useTheme();

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
    <div className="border rounded-3 p-3 mb-3">
      <h5 className="fw-semibold mb-3 text-secondary">Hasil Deteksi AI</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className={`border rounded-3 p-3 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-person me-2 text-primary"></i>
              <span className="fw-semibold">Deteksi Wajah</span>
            </div>
            <div className="text-secondary">
              {cameraData.face_detected || 'Tidak terdeteksi'}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className={`border rounded-3 p-3 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-person-badge me-2 text-primary"></i>
              <span className="fw-semibold">Deteksi Seragam</span>
            </div>
            <div className="text-secondary">
              {cameraData.uniform_detected || 'Tidak terdeteksi'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResults;