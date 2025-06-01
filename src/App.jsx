import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AIResults from './components/AIResults';
import HistoryPage from './components/HistoryPage';
import ThemeToggle from './components/ThemeToggle';
import apiService from './services/apiService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Notification from './components/Notification';

function MainApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [cameraData, setCameraData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notification, setNotification] = useState(null);
  const [streamUrl] = useState('http://172.20.10.4/mjpeg/1');

  // Helper function to check if AI detection result is detected
  const isDetected = (value) => {
    if (value === null || value === undefined) return false;
    const str = String(value).trim().toLowerCase();
    return !['tidak terdeteksi', 'null', 'unknown', ''].includes(str);
  };

  // Fungsi untuk mengambil data history (manual refresh)
  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.fetchAllCameraData();
      if (data.success) {
        setCameraData(data.data);
        if (!selectedImage && data.data.length > 0) {
          setSelectedImage(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      setError('Gagal mengambil data history. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengambil data terbaru (polling)
  const fetchLatestData = async () => {
    try {
      const data = await apiService.fetchLatestCameraData();
      if (data.success && data.data) {
        // Update selected image jika ini adalah data terbaru
        setSelectedImage(data.data);
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  // Polling data terbaru setiap 5 detik
  useEffect(() => {
    // Fetch data history pertama kali
    fetchHistoryData();

    // Set interval untuk polling data terbaru
    const intervalId = setInterval(fetchLatestData, 5000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  return (
    <div className="App min-vh-100">
      <nav className="navbar navbar-expand-lg border-bottom py-2 mb-4">
        <div className="w-100 px-3 px-md-4 d-flex justify-content-between align-items-center">
          <div className="navbar-brand d-flex align-items-center">
            <img 
              src="/logowebcam.svg" 
              alt="Logo" 
              width="52" 
              height="52" 
              className="me-2 me-md-3"
            />
            <div className="text-start">
              <h1 className="h5 fw-semibold mb-0 text-primary">Lab Cam Monitor</h1>
              <h1 className="text-muted small d-none d-sm-block">Sistem Pemantauan LABRES dengan AI</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>
      
      <div className="px-3 px-md-4 mb-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="row g-3 g-md-4 flex-lg-nowrap">
          <div className="col-12 col-lg-7">
            <div className="border rounded-4 p-3 mb-3">
              {/* Live Stream Section */}
              <div className="mb-4">
                <div className="border rounded-3 overflow-hidden position-relative">
                  <img 
                    src={streamUrl}
                    alt="Live Stream"
                    className="img-fluid w-100"
                    style={{ 
                      width: '100%', 
                      height: '340px', 
                      objectFit: 'contain', 
                      background: isDarkMode ? '#000000' : '#ffffff', 
                      display: 'block' 
                    }}
                  />
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-danger bg-opacity-75 d-flex align-items-center gap-1">
                      <span className="rounded-circle bg-white" style={{width: '6px', height: '6px'}}></span>
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="text-muted small text-center mt-2">Live Stream Camera</div>
              </div>

              {/* Captured Image and AI Results Section */}
              <div className="row g-3">
                {/* Captured Image */}
                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0 text-secondary">
                        <i className="bi bi-camera me-2"></i>
                        Captured Image
                      </h6>
                      <span className={
                        isDarkMode
                          ? 'badge bg-dark bg-opacity-50 text-white'
                          : 'badge bg-light bg-opacity-25 text-secondary'
                      }>
                        {selectedImage ? new Date(selectedImage.timestamp).toLocaleTimeString() : '--:--'}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      {selectedImage?.image_url ? (
                        <div>
                          <div className="border rounded-3 overflow-hidden mb-2" style={{height: '200px'}}>
                            <img 
                              src={selectedImage.image_url} 
                              alt="Captured Image" 
                              className="img-fluid w-100 h-100"
                              style={{ 
                                objectFit: 'contain', 
                                background: isDarkMode ? '#000000' : '#ffffff'
                              }}
                            />
                          </div>
                          <div className="small text-muted">
                            {new Date(selectedImage.timestamp).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{height: '200px'}}>
                          <i className="bi bi-camera-fill mb-2" style={{fontSize: '3rem', opacity: 0.3}}></i>
                          <div className="small">Belum ada gambar tersimpan</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Detection Results */}
                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-semibold mb-0 text-secondary">
                        <i className="bi bi-robot me-2"></i>
                        AI Detection
                      </h6>
                      <span className="badge bg-primary bg-opacity-25 text-primary">
                        <i className="bi bi-cpu me-1"></i>
                        AI
                      </span>
                    </div>
                    
                    {selectedImage ? (
                      <div>
                        {/* Face Detection */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="small fw-medium text-secondary">
                              <i className="bi bi-person-circle me-1"></i>
                              Face Detection
                            </span>
                            <span className={`badge ${isDetected(selectedImage.face_detected)
                              ? 'bg-success' : 'bg-danger'} bg-opacity-25`}>
                              {isDetected(selectedImage.face_detected) ? 'Detected' : 'Undetected'}
                            </span>
                          </div>
                          <div className="small text-muted ps-3">
                            {selectedImage.face_detected || 'Tidak ada wajah terdeteksi'}
                          </div>
                        </div>

                        {/* Uniform Detection */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="small fw-medium text-secondary">
                              <i className="bi bi-person-badge me-1"></i>
                              Uniform Detection
                            </span>
                            <span className={`badge ${isDetected(selectedImage.uniform_detected)
                              ? 'bg-success' : 'bg-danger'} bg-opacity-25`}>
                              {isDetected(selectedImage.uniform_detected) ? 'Detected' : 'Undetected'}
                            </span>
                          </div>
                          <div className="small text-muted ps-3">
                            {selectedImage.uniform_detected || 'Tidak ada seragam terdeteksi'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{height: '160px'}}>
                        <i className="bi bi-robot mb-2" style={{fontSize: '3rem', opacity: 0.3}}></i>
                        <div className="small text-center">Pilih data dari history<br/>untuk melihat hasil deteksi AI</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Section */}
              {notification && (
                <div className="mt-3">
                  <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="border rounded-4 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold text-secondary d-flex align-items-center">
                  <i className="bi bi-clock-history me-2"></i>
                  Detection History
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    onClick={fetchHistoryData}
                    disabled={isLoading}
                    style={{minWidth: 90}}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-1">Loading...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise"></i>
                        <span className="ms-1">Refresh</span>
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => navigate('/history')}
                  >
                    <i className="bi bi-list-ul"></i>
                    <span className="ms-1">View All</span>
                  </button>
                </div>
              </div>
              
              <div style={{ maxHeight: 'min(65vh, 500px)', overflowY: 'auto' }} className="pe-2">
                {cameraData.length > 0 ? (
                  cameraData.map((data, index) => (
                    <div 
                      key={index} 
                      className={`mb-2 p-3 rounded-3 border transition-all ${
                        selectedImage === data 
                          ? 'bg-primary bg-opacity-10 border-primary shadow-sm' 
                          : 'border-secondary border-opacity-25 hover-shadow'
                      }`} 
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedImage(data)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="fw-semibold small">
                          {new Date(data.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {selectedImage === data && (
                          <i className="bi bi-check-circle-fill text-primary"></i>
                        )}
                      </div>
                      
                      <div className="small">
                        <div className="mb-2">
                          <div className="d-flex align-items-center mb-1">
                            <span className="text-secondary fw-medium">
                              <i className="bi bi-person-circle me-1"></i>
                              Face:
                            </span>
                          </div>
                          <div className="text-muted small ps-3" style={{fontSize: '0.8rem'}}>
                            {data.face_detected || 'Tidak terdeteksi'}
                          </div>
                        </div>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="text-secondary fw-medium">
                              <i className="bi bi-person-badge me-1"></i>
                              Uniform:
                            </span>
                          </div>
                          <div className="text-muted small ps-3" style={{fontSize: '0.8rem'}}>
                            {data.uniform_detected || 'Tidak terdeteksi'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-center my-5">
                    <i className="bi bi-inbox mb-2" style={{fontSize: '2rem', opacity: 0.3}}></i>
                    <div className="small">Belum ada data history</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;