import React, { useEffect, useRef } from 'react';

/**
 * Handles embedding and controlling Twitch streams using the Twitch Embed API.
 */
const TwitchPlayer = ({ channel, onTogglePlay, onPlayerReady }) => {
  const embedRef = useRef(null);

  useEffect(() => {
    let player = null;
    const initializePlayer = () => {
      if (window.Twitch && embedRef.current) {
        player = new window.Twitch.Player(embedRef.current.id, {
          channel: channel,
          width: '100%',
          height: '100%',
          parent: [window.location.hostname], // IMPORTANT: Required by Twitch API
          muted: true, // Start muted to allow autoplay
          //Cannot set controls=false here, as twitch forces controls to be visible.
        });

        player.addEventListener(window.Twitch.Player.READY, () => {
          if (onPlayerReady) {
            onPlayerReady(player);
          }
        });

        player.addEventListener(window.Twitch.Player.PLAYING, () => onTogglePlay('playing'));
        player.addEventListener(window.Twitch.Player.PAUSED, () => onTogglePlay('paused'));
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

    return () => {
        if (embedRef.current) {
            embedRef.current.innerHTML = "";
        }
    }

  }, [channel, onPlayerReady, onTogglePlay]);

  // Give the embed div a unique ID to prevent conflicts
  const embedId = `twitch-embed-${channel}-${Math.random().toString(36).substring(7)}`;

  return <div id={embedId} ref={embedRef} style={{ width: '100%', height: '100%' }} />;
};

export default TwitchPlayer;

