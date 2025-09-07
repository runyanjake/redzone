import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import { calculateOptimalGrid, getVideoGridPosition } from '../utils/gridUtils';

//Grid object defining a layout and managing a list of videos.
// Divides space among videos and manages state.
function VideoGrid() {
  const [videos, setVideos] = useState([{ id: 1, url: '', playerState: 'unstarted', isMuted: true }]);
  const [gridLayout, setGridLayout] = useState({ rows: 1, cols: 1 });
  const [borderlessMode, setBorderlessMode] = useState(false);
  const playerRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        setGridLayout(calculateOptimalGrid(videos.length));
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [videos.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement);
      setBorderlessMode(isFullscreen);
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && borderlessMode) {
        event.preventDefault();
        event.stopPropagation();
        setBorderlessMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    document.addEventListener('keydown', handleKeyPress, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [borderlessMode]);

  const updateVideoUrl = useCallback((id, newUrl) => {
    setVideos(prevVideos => prevVideos.map(video =>
      video.id === id ? { ...video, url: newUrl } : video
    ));
  }, []);
  
  const handlePlayerStateChange = useCallback((id, newState) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === id ? { ...video, playerState: newState } : video
      )
    );
  }, []);

  const handlePlayerReady = useCallback((id, player) => {
    playerRefs.current[id] = player;
  }, []);

  const handleAddVideo = () => {
    setVideos([...videos, { id: Date.now(), url: '', playerState: 'unstarted', isMuted: true }]);
  };

  const handleUrlChange = (e, id) => {
    updateVideoUrl(id, e.target.value);
  };

  return (
    <div className={`app ${borderlessMode ? 'borderless-mode' : ''}`} ref={containerRef}>
      {!borderlessMode && (
        <div className="header">
          <h1 className="title">Web Video Redzone</h1>
          <div className="header-buttons">
            <button 
              className="borderless-toggle" 
              onClick={() => setBorderlessMode(!borderlessMode)}
            >
              {borderlessMode ? 'Exit Borderless' : 'Borderless Mode'}
            </button>
            <button 
              className="add-button" 
              onClick={handleAddVideo}
            >
              + Add Video
            </button>
          </div>
        </div>
      )}
      {borderlessMode && (
        <div 
          className="borderless-hint"
          onClick={() => setBorderlessMode(false)}
        >
          Press ESC or click here to exit
        </div>
      )}
      <div 
        className="video-grid"
        style={{
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`
        }}
      >
        {videos.map((video, index) => {
          const gridPosition = getVideoGridPosition(index, videos.length, gridLayout.cols);
          
          return (
            <div 
              key={video.id} 
              className={`video-element ${borderlessMode ? 'borderless' : ''}`}
              style={{ 
                gridColumn: gridPosition.gridColumn, 
                gridRow: gridPosition.gridRow 
              }}
            >
              {!borderlessMode && (
                <div className="top-row-controls">
                  <input
                    type="text"
                    placeholder="YouTube, Twitch, or stream URL"
                    value={video.url}
                    onChange={(e) => handleUrlChange(e, video.id)}
                  />
                </div>
              )}
              <VideoPlayer 
                url={video.url}
                videoId={video.id}
                onTogglePlay={handlePlayerStateChange}
                onPlayerReady={handlePlayerReady}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VideoGrid;

