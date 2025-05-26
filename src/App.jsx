import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AIResults from './components/AIResults';
import apiService from './services/apiService';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [cameraData, setCameraData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="App bg-white min-vh-100">
      <header className="App-header border-bottom bg-white py-3 mb-4">
        <div className="container px-3">
          <h1 className="h3 fw-semibold mb-1 text-primary">ESP32-CAM AI Monitor</h1>
          <div className="text-muted small">Sistem Pemantauan Kamera dengan AI</div>
        </div>
      </header>
      <div className="container px-3 mb-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row g-4 flex-lg-nowrap">
          <div className="col-12 col-lg-7">
            <div className="border rounded-4 bg-white p-3 mb-3">
              <div className="mb-3 text-center">
                {selectedImage?.image_url ? (
                  <img 
                    src={selectedImage.image_url} 
                    alt="Current Camera View" 
                    className="img-fluid rounded-3 border"
                    style={{ maxHeight: '400px', objectFit: 'contain', width: '100%', background: '#f8f9fa' }}
                  />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{height: '150px'}}>
                    <i className="bi bi-camera text-secondary" style={{fontSize: '2.5rem'}}></i>
                    <span className="text-muted mt-2 small">Belum ada gambar dari kamera</span>
                  </div>
                )}
              </div>
              {selectedImage && <AIResults cameraData={selectedImage} />}
              {selectedImage && (
                <div className="mx-auto mt-3" style={{maxWidth: '100%'}}> {/* Ubah maxWidth menjadi 100% */}
                  <div className="row g-2">  {/* Hapus justify-content-between karena akan menggunakan col yang sama */}
                    <div className="col-12 col-md-4">
                      <div className="border rounded-3 bg-light p-3 h-100 d-flex flex-column">
                        <div className="fw-semibold mb-2 text-secondary">Wajah</div>
                        <div className="text-secondary small flex-grow-1">
                          <div>{selectedImage.face_detected ?? 'Tidak terdeteksi'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="border rounded-3 bg-light p-3 h-100 d-flex flex-column">
                        <div className="fw-semibold mb-2 text-secondary">Seragam</div>
                        <div className="text-secondary small flex-grow-1">
                          <div>{selectedImage.uniform_detected ?? 'Tidak terdeteksi'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="border rounded-3 bg-light p-3 h-100 d-flex flex-column">
                        <div className="fw-semibold mb-2 text-secondary">Waktu</div>
                        <div className="text-secondary small flex-grow-1">
                          <div>{new Date(selectedImage.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="border rounded-4 bg-white p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-semibold text-secondary">History</div>
                <button 
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                  onClick={fetchHistoryData}
                  disabled={isLoading}
                  style={{minWidth: 90}}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Memuat...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {cameraData.length > 0 ? (
                  cameraData.map((data, index) => (
                    <div 
                      key={index} 
                      className={`mb-2 p-2 rounded-3 border d-flex align-items-center ${selectedImage === data ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white'} transition`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedImage(data)}
                    >
                      {/* <img 
                        src={data.image_url} 
                        alt={`History ${index}`}
                        className="rounded-2 border me-2"
                        style={{ width: '48px', height: '36px', objectFit: 'cover', background: '#f8f9fa' }}
                      /> */}
                      <div className="flex-grow-1">
                        <div className="small text-secondary"><strong>Wajah:</strong> {data.face_detected || 'Tidak terdeteksi'}</div>
                        
                        <div className="small text-secondary"><strong>Seragam:</strong> {data.uniform_detected || 'Tidak terdeteksi'}</div>
                        <div className="fw-semibold small mb-1">{new Date(data.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-center my-4 small">Belum ada data history</div>
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