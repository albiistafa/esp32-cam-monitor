import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';
import { useInView } from 'react-intersection-observer';
import Notification from './Notification';

const HistorySkeleton = () => (
  <div className="col-12 col-md-6 col-lg-4">
    <div className="card h-100">
      <div className="skeleton-image" style={{ height: '200px', backgroundColor: '#e0e0e0' }}></div>
      <div className="card-body">
        <div className="skeleton-title" style={{ height: '24px', width: '60%', backgroundColor: '#e0e0e0', marginBottom: '1rem' }}></div>
        <div className="skeleton-text" style={{ height: '16px', width: '80%', backgroundColor: '#e0e0e0', marginBottom: '0.5rem' }}></div>
        <div className="skeleton-text" style={{ height: '16px', width: '70%', backgroundColor: '#e0e0e0', marginBottom: '0.5rem' }}></div>
        <div className="skeleton-text" style={{ height: '16px', width: '50%', backgroundColor: '#e0e0e0' }}></div>
      </div>
    </div>
  </div>
);

function HistoryPage({ showNotification }) {
  const [isLoading, setIsLoading] = useState(false);
  const [allHistory, setAllHistory] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const ITEMS_PER_PAGE = 12;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milidetik

  // Intersection Observer untuk infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  // Debounce untuk mencegah multiple fetch
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const getCachedData = () => {
    const cached = localStorage.getItem('historyData');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedData = (data) => {
    localStorage.setItem('historyData', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  const fetchAllHistory = useCallback(async (isRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setAllHistory(cachedData);
          setIsLoading(false);
          return;
        }
      }

      const result = await apiService.fetchAllDataHistory();
      
      if (result.success) {
        const historyData = result.data || [];
        setAllHistory(historyData);
        setCachedData(historyData);
        setHasMore(historyData.length > ITEMS_PER_PAGE);
      } else {
        setError('Format data tidak valid');
        setAllHistory([]);
      }
    } catch (error) {
      console.error('Error fetching all history:', error);
      setError('Terjadi kesalahan saat mengambil data');
      setAllHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHistory();
  }, [fetchAllHistory]);

  // Infinite scroll handler
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading]);

  const handleDateFilter = () => {
    setPage(1);
    const filteredData = filterByDate(allHistory);
    setAllHistory(filteredData);
    setHasMore(filteredData.length > ITEMS_PER_PAGE);
    
    if (filteredData.length === 0) {
      showNotification('Tidak ada data yang ditemukan untuk rentang tanggal ini', 'warning');
    } else {
      showNotification(`Menampilkan ${filteredData.length} data`, 'success');
    }
  };

  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
    setAllHistory(allHistory.slice(0, ITEMS_PER_PAGE));
    setHasMore(allHistory.length > ITEMS_PER_PAGE);
    showNotification('Filter tanggal direset', 'info');
  };

  const handleRefresh = () => {
    setPage(1);
    fetchAllHistory(true);
    showNotification('Memperbarui data...', 'info');
  };

  const loadMore = debounce(() => {
    setPage(prev => prev + 1);
  }, 300);

  const getUniformBadge = (uniform) => {
    if (uniform === null) return <span className="badge bg-secondary">❓ NULL</span>;
    return uniform === 'Seragam Lab' 
      ? <span className="badge bg-success">Seragam Lab</span>
      : <span className="badge bg-danger">Non-seragam Lab</span>;
  };

  const getFaceBadge = (face) => {
    if (face === null) return <span className="badge bg-secondary">❓ NULL</span>;
    return face === 'Wajah Terdeteksi' 
      ? <span className="badge bg-success">Wajah Terdeteksi</span>
      : <span className="badge bg-danger">Wajah Tidak Terdeteksi</span>;
  };

  const filterByDate = (data) => {
    if (!startDate && !endDate) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  const displayedHistory = allHistory.slice(0, page * ITEMS_PER_PAGE);

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-4">
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Kembali
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
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

      {error && (
        <div className="alert alert-danger mx-4" role="alert">
          {error}
        </div>
      )}

      {!isLoading && allHistory.length === 0 && !error && (
        <div className="alert alert-info mx-4" role="alert">
          Belum ada data history
        </div>
      )}

      <div className="row g-4 px-4">
        {displayedHistory.map((data, index) => (
          <div key={data.id || index} className="col-12 col-md-6 col-lg-4">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
              <img 
                src={data.image_url} 
                alt={`History ${index}`}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Tersedia';
                }}
              />
              <div className="card-body">
                <h5 className={`card-title ${isDarkMode ? 'text-white' : 'text-dark'}`}>Data {index + 1}</h5>
                <div className={`card-text ${isDarkMode ? 'text-white-50' : 'text-secondary'}`}>
                  <p className="mb-1"><strong>Wajah:</strong> {getFaceBadge(data.face_detected)}</p>
                  <p className="mb-1"><strong>Seragam:</strong> {getUniformBadge(data.uniform_detected)}</p>
                  <p className="mb-0"><strong>Waktu:</strong> {new Date(data.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator untuk infinite scroll */}
      <div ref={ref} className="text-center mt-4">
        {isLoading && (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;