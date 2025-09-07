import React, { useRef, useEffect } from 'react';

/**
 * A generic video player that now reports when it's ready so App.js
 * can control its muted state. It also includes native controls.
 */
const GenericStreamPlayer = ({ streamUrl, onPlayerReady }) => {
  const videoRef = useRef(null);

  // When the component mounts, pass the video element reference to App.js
  useEffect(() => {
    if (videoRef.current && onPlayerReady) {
      onPlayerReady(videoRef.current);
    }
  }, [onPlayerReady]);

  return (
    <video 
      ref={videoRef} 
      src={streamUrl}
      style={{ width: '100%', height: '100%', backgroundColor: 'black' }} 
      controls={true} // Enable native controls for volume/fullscreen
      autoPlay={true}
      muted={true} // Start muted to comply with autoplay policies
      loop={true}
    />
  );
};

export default GenericStreamPlayer;

