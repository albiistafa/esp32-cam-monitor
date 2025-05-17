import React from 'react';
import './AIResult.css';

const AIResults = ({ results }) => {
  if (!results) {
    return <div className="ai-results empty">No results yet</div>;
  }

  return (
    <div className="ai-results">
      <h3>AI Detection Results</h3>
      <div className="result-item">
        <strong>Face Recognition:</strong> 
        {results.facerecog === 1 && <span className="success">Recognized</span>}
        {results.facerecog === 2 && <span className="warning">Unknown Face</span>}
        {results.facerecog === -1 && <span className="error">No Face Detected</span>}
      </div>
      <div className="result-item">
        <strong>Uniform Detection:</strong> 
        {results.seragam === 1 && <span className="success">Wearing Uniform</span>}
        {results.seragam === 0 && <span className="error">No Uniform</span>}
        {results.seragam === -1 && <span className="warning">Not Detected</span>}
      </div>
    </div>
  );
};

export default AIResults;