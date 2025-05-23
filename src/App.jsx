import React, { useState, useEffect } from 'react';
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
  const [mode, setMode] = useState('stream');
  const [cameraData, setCameraData] = useState(null);

  // Polling data dari API setiap 5 detik
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.fetchCameraData();
        console.log('Data dari API:', data); // Log data yang diterima
        if (data.success) {
          setCameraData(data.data);
          console.log('Camera data diupdate:', data.data); // Log data yang diupdate ke state
        }
      } catch (error) {
        console.error('Error fetching camera data:', error);
      }
    };

    // Fetch data pertama kali
    fetchData();

    // Set interval untuk polling
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

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
            <div style={{ marginBottom: 16 }}>
              {mode === 'stream' ? (
                <button onClick={() => setMode('capture')} className="btn btn-warning mb-3">
                  Nonaktifkan Stream (untuk Capture)
                </button>
              ) : (
                <button onClick={() => setMode('stream')} className="btn btn-success mb-3">
                  Aktifkan Stream
                </button>
              )}
            </div>
            {mode === 'stream' && (
              <CameraStream 
                key={mode} 
                espIpAddress={espIpAddress}
                boundingBoxes={boundingBoxes}
              />
            )}
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5>Captured Image</h5>
              </div>
              <div className="card-body text-center">
                {cameraData?.image_url ? (
                  <img 
                    src={cameraData.image_url} 
                    alt="Captured from Camera" 
                    className="img-fluid captured-image"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                ) : capturedImage ? (
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
              <AIResults cameraData={cameraData} />
            </div>

            {/* Tampilkan data dari API */}
            <div className="card mt-4">
              <div className="card-header">
                <h5>Camera Data</h5>
              </div>
              <div className="card-body">
                {cameraData ? (
                  <>
                    <div className="result-item">
                      <strong>Camera ID:</strong> {cameraData.camera_id}
                    </div>
                    <div className="result-item">
                      <strong>Uniform Detected:</strong> {cameraData.uniform_detected}
                    </div>
                    <div className="result-item">
                      <strong>Face Detected:</strong> {cameraData.face_detected}
                    </div>
                    <div className="result-item">
                      <strong>Timestamp:</strong> {new Date(cameraData.timestamp).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Menunggu data dari kamera...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;