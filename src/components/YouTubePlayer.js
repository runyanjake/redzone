import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayer = forwardRef(({ videoId, onReady }, ref) => {
  const playerRef = useRef(null);

  // Expose API to parent component.
  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    mute: () => playerRef.current?.mute(),
    unMute: () => playerRef.current?.unMute(),
  }));

  const handleReady = (event) => {
    playerRef.current = event.target;
    onReady(); // Signal to the parent that the player is ready to be controlled.
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      controls: 1,
      loop: 1,
      playlist: videoId,
      autoplay: 1,
      rel: 0,
    },
  };

  return (
    <div className="youtube-wrapper">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        className="youtube-iframe"
      />
    </div>
  );
});

export default YouTubePlayer;

