import React, { useCallback } from 'react';
import YouTubePlayer from './YouTubePlayer';
import TwitchPlayer from './TwitchPlayer';
import GenericStreamPlayer from './GenericStreamPlayer';
import { getYouTubeVideoId, getTwitchChannel } from '../utils/videoUtils';
import './VideoPlayer.css';

/**
 * The factory component now uses useCallback to stabilize the functions it
 * passes down to the child players, preventing unnecessary re-renders.
 */
const VideoPlayer = ({ url, onTogglePlay, onPlayerReady, videoId }) => {
  const youTubeId = getYouTubeVideoId(url);
  const twitchChannel = getTwitchChannel(url);
  const genericStream = url && !youTubeId && !twitchChannel;

  // These handlers are now memoized to prevent re-creating them on every render.
  const handleToggle = useCallback((newState) => {
    onTogglePlay(videoId, newState);
  }, [onTogglePlay, videoId]);

  const handleReady = useCallback((player) => {
    onPlayerReady(videoId, player);
  }, [onPlayerReady, videoId]);

  if (youTubeId) {
    return (
      <YouTubePlayer
        videoId={youTubeId}
        onTogglePlay={handleToggle}
        onPlayerReady={handleReady}
      />
    );
  }

  if (twitchChannel) {
    return (
      <TwitchPlayer
        channel={twitchChannel}
        onTogglePlay={handleToggle}
        onPlayerReady={handleReady}
      />
    );
  }

  if (genericStream) {
    return (
      <GenericStreamPlayer
        streamUrl={url}
        onPlayerReady={handleReady}
      />
    );
  }

  return (
    <div className="placeholder">
      Enter a YouTube, Twitch, or other stream URL to start.
    </div>
  );
};

export default VideoPlayer;

