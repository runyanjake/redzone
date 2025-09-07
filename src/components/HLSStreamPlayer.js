import React, { useRef, useEffect } from 'react';

//Generic video player for HLS streams, embedding them in an Iframe.
const HLSStreamPlayer = ({ streamUrl, onPlayerReady }) => {
  const videoRef = useRef(null);

  // Notify the caller when the player is ready.
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
      controls={true} //Enable stream controls
      autoPlay={true}
      muted={false} // Start muted to comply with browser autoplay policies
      loop={true}
    />
  );
};

export default HLSStreamPlayer;

