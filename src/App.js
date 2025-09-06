import React, { useState, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
  const [videos, setVideos] = useState([{ id: 1, url: '', playerState: 'unstarted' }]);
  const playerRefs = useRef({});

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
    <div className="app">
      <h1 className="title">Video Player Redzone</h1>
      <div className="video-grid">
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