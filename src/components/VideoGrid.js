import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import { calculateOptimalGrid, getVideoGridPosition } from '../utils/gridUtils';

function VideoGrid() {
  const [videos, setVideos] = useState([{ id: 1, url: '' }]);
  const [gridLayout, setGridLayout] = useState({ rows: 1, cols: 1 });
  const [borderlessMode, setBorderlessMode] = useState(false);
  // This ref will now hold references to our component's imperative handles.
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

  const updateVideoUrl = useCallback((id, newUrl) => {
    setVideos(prev => prev.map(v => (v.id === id ? { ...v, url: newUrl } : v)));
  }, []);

  /**
   * This function is now the trigger. Once a player component signals it's ready,
   * we use its ref to call the imperative 'play' and 'unMute' methods.
   */
  const handlePlayerReady = useCallback((id) => {
    const playerAPI = playerRefs.current[id]?.current;
    if (playerAPI) {
      playerAPI.play();
      playerAPI.unMute();
    }
  }, []);

  const handleAddVideo = () => {
    setVideos(prev => [...prev, { id: Date.now(), url: '' }]);
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
            <button className="borderless-toggle" onClick={() => setBorderlessMode(p => !p)}>
              {borderlessMode ? 'Exit Borderless' : 'Borderless Mode'}
            </button>
            <button className="add-button" onClick={handleAddVideo}>
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
      <div
        className="video-grid"
        style={{
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
        }}
      >
        {videos.map((video, index) => {
          // Ensure a ref object exists for each video
          if (!playerRefs.current[video.id]) {
            playerRefs.current[video.id] = React.createRef();
          }
          const gridPosition = getVideoGridPosition(index, videos.length, gridLayout.cols);
          return (
            <div
              key={video.id}
              className={`video-element ${borderlessMode ? 'borderless' : ''}`}
              style={{ gridColumn: gridPosition.gridColumn, gridRow: gridPosition.gridRow }}
            >
              {!borderlessMode && (
                <div className="top-row-controls">
                  <input
                    type="text"
                    placeholder="YouTube, Twitch, or stream URL"
                    value={video.url}
                    onChange={e => handleUrlChange(e, video.id)}
                  />
                </div>
              )}
              <VideoPlayer
                ref={playerRefs.current[video.id]}
                url={video.url}
                onReady={() => handlePlayerReady(video.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VideoGrid;

