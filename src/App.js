import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
  const [videos, setVideos] = useState([{ id: 1, url: '', playerState: 'unstarted' }]);
  const [gridLayout, setGridLayout] = useState({ rows: 1, cols: 1 });
  const playerRefs = useRef({});
  const containerRef = useRef(null);

  // Calculate grid positioning for videos, handling odd numbers with centering
  const getVideoGridPosition = (videoIndex, totalVideos, gridCols) => {
    const fullRows = Math.floor(totalVideos / gridCols);
    const videosInLastRow = totalVideos % gridCols;
    
    if (videoIndex < fullRows * gridCols) {
      // Videos in full rows - normal positioning
      return {
        gridColumn: (videoIndex % gridCols) + 1,
        gridRow: Math.floor(videoIndex / gridCols) + 1
      };
    } else {
      // Videos in the last (partial) row - center them
      if (videosInLastRow === 0) {
        // No partial row
        return {
          gridColumn: (videoIndex % gridCols) + 1,
          gridRow: Math.floor(videoIndex / gridCols) + 1
        };
      } else {
        // Center the partial row
        const startCol = Math.floor((gridCols - videosInLastRow) / 2) + 1;
        const colInLastRow = videoIndex - (fullRows * gridCols);
        return {
          gridColumn: startCol + colInLastRow,
          gridRow: fullRows + 1
        };
      }
    }
  };

  // Simple tiling algorithm based on square grids
  const calculateOptimalGrid = (videoCount, containerWidth, containerHeight) => {
    if (videoCount <= 0) return { rows: 1, cols: 1 };
    if (videoCount === 1) return { rows: 1, cols: 1 };
    if (videoCount === 2) return { rows: 1, cols: 2 };
    
    // For n > 2: find the next square that is >= n
    const nextSquare = Math.ceil(Math.sqrt(videoCount));
    const rows = nextSquare;
    const cols = Math.ceil(videoCount / rows);
    
    return { rows, cols };
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
      <div className="header">
        <h1 className="title">Video Player Redzone</h1>
        <button 
          className="add-button" 
          onClick={handleAddVideo}
        >
          + Add Video
        </button>
      </div>
      <div 
        className="video-grid"
        style={{
          gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`
        }}
      >
        {videos.map((video, index) => {
          const buttonText = video.playerState === 'playing' ? 'Pause / Mute' : 'Play / Unmute';
          const gridPosition = getVideoGridPosition(index, videos.length, gridLayout.cols);
          return (
            <div 
              key={video.id} 
              className="video-element"
              style={{
                gridColumn: gridPosition.gridColumn,
                gridRow: gridPosition.gridRow
              }}
            >
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
      </div>
    </div>
  );
}

export default App;