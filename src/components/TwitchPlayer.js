import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const TwitchPlayer = forwardRef(({ channel, onReady }, ref) => {
  const embedRef = useRef(null);
  const playerRef = useRef(null);
  const onReadyRef = useRef(onReady);

  // Keep the ref updated with the latest onReady function without causing re-renders.
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  // Expose API to parent component.
  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.play(),
    pause: () => playerRef.current?.pause(),
    mute: () => playerRef.current?.setMuted(true),
    unMute: () => playerRef.current?.setMuted(false),
  }));
  
  useEffect(() => {
    const initializePlayer = () => {
      if (window.Twitch && embedRef.current) {
        const player = new window.Twitch.Player(embedRef.current.id, {
          channel: channel,
          width: '100%',
          height: '100%',
          parent: [window.location.hostname],
          muted: true,
        });

        player.addEventListener(window.Twitch.Player.READY, () => {
          playerRef.current = player;
          // Call the latest onReady function via the ref.
          onReadyRef.current(); 
        });
      }
    };

    if (!window.Twitch) {
      const script = document.createElement('script');
      script.src = 'https://embed.twitch.tv/embed/v1.js';
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }
    
    const currentEmbedRef = embedRef.current;
    return () => {
      if (currentEmbedRef) {
        currentEmbedRef.innerHTML = "";
      }
    };
    // By removing onReady from the dependency array, we prevent the effect from re-running.
  }, [channel]);

  const embedId = `twitch-embed-${channel}-${Math.random().toString(36).substring(7)}`;

  return <div id={embedId} ref={embedRef} style={{ width: '100%', height: '100%' }} />;
});

export default TwitchPlayer;

