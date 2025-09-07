import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

const HLSStreamPlayer = forwardRef(({ streamUrl, onReady }, ref) => {
  const videoRef = useRef(null);
  const isReadyRef = useRef(false); // Flag to ensure onReady is only called once

  // Expose API to parent component.
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    mute: () => { if(videoRef.current) videoRef.current.muted = true; },
    unMute: () => { if(videoRef.current) videoRef.current.muted = false; },
  }));

  // The 'canplay' event is a good signal that the video is ready.
  useEffect(() => {
    const videoElement = videoRef.current;

    // This handler ensures that we only call the onReady prop the first time.
    const handleCanPlay = () => {
      if (!isReadyRef.current) {
        isReadyRef.current = true;
        onReady();
      }
    };

    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [onReady]);

  return (
    <video
      ref={videoRef}
      src={streamUrl}
      style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
      controls={true}
      // autoPlay is removed. Playback is controlled imperatively from the parent.
      muted={true}
      loop={true}
    />
  );
});

export default HLSStreamPlayer;

