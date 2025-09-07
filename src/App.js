import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoGrid from './components/VideoGrid';
import { calculateOptimalGrid } from './utils/gridUtils';
import './App.css';

function App() {
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

  const handleUrlChange = (e, id) => {
    const newVideos = videos.map(video =>
      video.id === id ? { ...video, url: e.target.value } : video
    );
    setVideos(newVideos);
  };
  
  const handlePlayerStateChange = useCallback((id, newState) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === id ? { ...video, playerState: newState } : video
      )
    );
  }, []);

  const handleTogglePlay = (id) => {
    const player = playerRefs.current[id];
    if (!player) return;

    const video = videos.find(v => v.id === id);
    if (!video) return;

    const currentlyPlaying = video.playerState === 'playing';
    const newMutedState = currentlyPlaying ? true : false;

    if (player.playVideo) { // YouTube
      currentlyPlaying ? player.pauseVideo() : player.playVideo();
      newMutedState ? player.mute() : player.unMute();
    } else if (player.getPlayerState) { // Twitch
      currentlyPlaying ? player.pause() : player.play();
      player.setMuted(newMutedState);
    } else if (player instanceof HTMLVideoElement) { // Generic Stream
      player.muted = !player.muted;
      setVideos(prevVideos => prevVideos.map(v => 
        v.id === id ? { ...v, isMuted: player.muted } : v
      ));
      return; 
    }
    
    setVideos(prevVideos => prevVideos.map(v => 
      v.id === id ? { ...v, isMuted: newMutedState } : v
    ));
  };

  const handlePlayerReady = useCallback((id, player) => {
    playerRefs.current[id] = player;
  }, []);

  const handleAddVideo = () => {
    setVideos([...videos, { id: Date.now(), url: '', playerState: 'unstarted', isMuted: true }]);
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
      <VideoGrid 
        videos={videos}
        gridLayout={gridLayout}
        borderlessMode={borderlessMode}
        handleUrlChange={handleUrlChange}
        handleTogglePlay={handleTogglePlay}
        handlePlayerStateChange={handlePlayerStateChange}
        handlePlayerReady={handlePlayerReady}
      />
    </div>
  );
}

export default App;

