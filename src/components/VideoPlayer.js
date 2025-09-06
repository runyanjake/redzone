import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoId, onTogglePlay, playerState, buttonText, onPlayerReady }) => {
  const playerRef = useRef(null);

  const onReady = (event) => {
    playerRef.current = event.target;
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };

  const onStateChange = (event) => {
    const playerStatus = event.data;
    if (playerStatus === window.YT.PlayerState.PLAYING) {
      onTogglePlay('playing');
    } else if (playerStatus === window.YT.PlayerState.PAUSED) {
      onTogglePlay('paused');
    } else if (playerStatus === window.YT.PlayerState.ENDED) {
      onTogglePlay('unstarted');
    }
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 0,
      loop: 1,
    },
  };

  return (
    <>
      {videoId ? (
        <div className="youtube-wrapper">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      ) : (
        <div className="placeholder">Enter a video URL to start a stream.</div>
      )}
    </>
  );
};

export default VideoPlayer;