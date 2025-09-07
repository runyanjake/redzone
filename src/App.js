import React, { useState, useEffect, useRef } from 'react';
import VideoGrid from './components/VideoGrid';
import './App.css';

function App() {
  const [borderlessMode, setBorderlessMode] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setBorderlessMode(isFullscreen);
    };
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && borderlessMode) {
        event.preventDefault();
        setBorderlessMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress, true);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [borderlessMode]);

  const handleAddVideoClick = () => {
    gridRef.current?.addVideo();
  };

  return (
    <div className={`app ${borderlessMode ? 'borderless-mode' : ''}`}>
      {!borderlessMode && (
        <div className="header">
          <h1 className="title">Web Video Redzone</h1>
          <div className="header-buttons">
            <button className="borderless-toggle" onClick={() => setBorderlessMode(p => !p)}>
              Borderless Mode
            </button>
            <button className="add-button" onClick={handleAddVideoClick}>
              + Add Video
            </button>
          </div>
        </div>
      )}
      {borderlessMode && (
        <div className="borderless-hint" onClick={() => setBorderlessMode(false)}>
          Press ESC or click here to exit
        </div>
      )}
      <div className="main-content">
        <VideoGrid ref={gridRef} borderlessMode={borderlessMode} />
      </div>
    </div>
  );
}

export default App;

