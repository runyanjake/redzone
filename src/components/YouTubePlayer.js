import React from 'react';
import YouTube from 'react-youtube';

/**
 * Handles the embedding and control of YouTube videos.
 */
const YouTubePlayer = ({ videoId, onTogglePlay, onPlayerReady }) => {

  const onReady = (event) => {
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
      onTogglePlay('ended');
    }
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 1, //Allow controls to be displayed
      loop: 1,
      playlist: videoId,
      autoplay: 1, //Auto play the current (and any following if playlist) videos.
      rel: 0, // Do not show related videos, as this would cause them to autoplay.
    },
  };

  return (
    <div className="youtube-wrapper">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="youtube-iframe"
      />
    </div>
  );
};

export default YouTubePlayer;

