import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CameraStream from './components/CameraStream';
import CaptureButton from './components/CaptureButton';
import AIResults from './components/AIResults';
import apiService from './services/apiService';

function App() {
  const [espIpAddress, setEspIpAddress] = useState('');
  const [inputIpAddress, setInputIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleConnect = () => {
    if (inputIpAddress) {
      setEspIpAddress(inputIpAddress);
    }
  };

  const handleCapture = async () => {
    if (!espIpAddress) return;
    
    setIsLoading(true);
    try {
      // Tangkap gambar dari ESP32-CAM
      const imageBlob = await apiService.captureImage(espIpAddress);
      setCapturedImage(URL.createObjectURL(imageBlob));

      // Kirim ke server AI untuk pengenalan wajah
      const response = await apiService.recognizeFaceBase64(imageBlob);
      
      // Parse respons untuk face recognition
      let faceRecogResult = -1;
      if (response.num_faces > 0 && response.faces.length > 0) {
        if (response.faces[0].name === "Unknown") {
          faceRecogResult = 2;
        } else if (response.faces[0].similarity < 0.4) {
          faceRecogResult = 1;
        }
      }
      
      // Hasil dari AI (contoh format, sesuaikan dengan respons yang sebenarnya)
      const aiResults = {
        facerecog: faceRecogResult,
        seragam: response.seragam || -1 // Asumsikan server AI juga mengembalikan status seragam
      };

      setResults(aiResults);
      
      // Update bounding boxes jika ada
      if (response.bounding_boxes) {
        setBoundingBoxes(response.bounding_boxes);
      }
    } catch (error) {
      console.error('Error during capture and recognition:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ESP32-CAM AI Monitor</h1>
      </header>
      
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-md-8 offset-md-2">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter ESP32-CAM IP Address (e.g. 192.168.1.100)"
                value={inputIpAddress}
                onChange={(e) => setInputIpAddress(e.target.value)}
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-primary"
                  onClick={handleConnect}
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-8">
            <CameraStream 
              espIpAddress={espIpAddress}
              boundingBoxes={boundingBoxes}
            />
            <CaptureButton 
              onCapture={handleCapture}
              disabled={!espIpAddress || isLoading}
            />
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5>Captured Image</h5>
              </div>
              <div className="card-body text-center">
                {capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="img-fluid captured-image"
                  />
                ) : (
                  <p className="text-muted">No image captured yet</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <AIResults results={results} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;