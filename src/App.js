import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
  const [videos, setVideos] = useState([{ id: 1, url: '', playerState: 'unstarted' }]);
  const [gridLayout, setGridLayout] = useState({ rows: 1, cols: 1 });
  const playerRefs = useRef({});
  const containerRef = useRef(null);

  // Optimal tiling algorithm to maximize window coverage
  const calculateOptimalGrid = (videoCount, containerWidth, containerHeight) => {
    if (videoCount <= 0) return { rows: 1, cols: 1 };
    if (videoCount === 1) return { rows: 1, cols: 1 };
    
    // Account for padding, gaps, and controls
    const availableWidth = containerWidth - 40; // padding
    const availableHeight = containerHeight - 120; // title + padding
    
    // Video aspect ratio (16:9)
    const videoAspectRatio = 16 / 9;
    
    let bestLayout = { rows: 1, cols: videoCount };
    let bestCoverage = 0;
    
    // Try different row/column combinations
    for (let rows = 1; rows <= Math.ceil(Math.sqrt(videoCount * 2)); rows++) {
      const cols = Math.ceil(videoCount / rows);
      
      // Calculate tile dimensions
      const tileWidth = availableWidth / cols;
      const tileHeight = availableHeight / rows;
      
      // Calculate video dimensions within tile (accounting for controls)
      const videoWidth = tileWidth - 20; // padding
      const videoHeight = tileHeight - 60; // controls height
      
      // Check if aspect ratio is maintained
      const actualAspectRatio = videoWidth / videoHeight;
      const aspectRatioDiff = Math.abs(actualAspectRatio - videoAspectRatio);
      
      // Calculate coverage (area used by videos)
      const totalVideoArea = videoCount * videoWidth * videoHeight;
      const totalAvailableArea = availableWidth * availableHeight;
      const coverage = totalVideoArea / totalAvailableArea;
      
      // Penalize layouts that don't maintain aspect ratio well
      const aspectRatioPenalty = aspectRatioDiff * 0.1;
      const adjustedCoverage = coverage - aspectRatioPenalty;
      
      // Prefer layouts that use all tiles efficiently
      const efficiency = videoCount / (rows * cols);
      const finalScore = adjustedCoverage * efficiency;
      
      if (finalScore > bestCoverage) {
        bestCoverage = finalScore;
        bestLayout = { rows, cols };
      }
    }
    
    return bestLayout;
  };

  // Update grid layout when videos change or window resizes
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const optimalLayout = calculateOptimalGrid(
          videos.length,
          containerRect.width,
          containerRect.height
        );
        setGridLayout(optimalLayout);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [videos.length]);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleUrlChange = (e, id) => {
    const newVideos = videos.map(video =>
      video.id === id ? { ...video, url: e.target.value } : video
    );
    setVideos(newVideos);
  };

  const handlePlayerStateChange = (id, newState) => {
    const newVideos = videos.map(video =>
      video.id === id ? { ...video, playerState: newState } : video
    );
    setVideos(newVideos);
  };

  const handleTogglePlay = (id) => {
    const player = playerRefs.current[id];
    if (!player) return;

    const video = videos.find(v => v.id === id);
    if (video.playerState === 'playing') {
      player.pauseVideo();
      player.mute();
    } else {
      player.playVideo();
      player.unMute();
    }
  };

  const handlePlayerReady = (id, player) => {
    playerRefs.current[id] = player;
  };

  const handleAddVideo = () => {
    setVideos([...videos, { id: Date.now(), url: '', playerState: 'unstarted' }]);
  };

  return (
    <div className="app" ref={containerRef}>
      <h1 className="title">Video Player Redzone</h1>
      <div 
        className="video-grid"
        style={{
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`
        }}
      >
        {videos.map((video) => {
          const buttonText = video.playerState === 'playing' ? 'Pause / Mute' : 'Play / Unmute';
          return (
            <div key={video.id} className="video-element">
              <div className="top-row-controls">
                <input
                  type="text"
                  placeholder="Paste YouTube URL here"
                  value={video.url}
                  onChange={(e) => handleUrlChange(e, video.id)}
                />
                <button 
                  className="play-toggle" 
                  onClick={() => handleTogglePlay(video.id)}
                >
                  {buttonText}
                </button>
              </div>
              <VideoPlayer 
                videoId={extractVideoId(video.url)} 
                onTogglePlay={(newState) => handlePlayerStateChange(video.id, newState)}
                playerState={video.playerState}
                buttonText={buttonText}
                onPlayerReady={(player) => handlePlayerReady(video.id, player)}
              />
            </div>
          );
        })}
        <button className="add-button" onClick={handleAddVideo}>
          +
        </button>
      </div>
    </div>
  );
}

export default App;