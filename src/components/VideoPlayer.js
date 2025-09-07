import React, { useCallback } from 'react';
import YouTubePlayer from './YouTubePlayer';
import TwitchPlayer from './TwitchPlayer';
import HLSStreamPlayer from './HLSStreamPlayer';
import { getYouTubeVideoId, getTwitchChannel } from '../utils/videoUtils';
import './VideoPlayer.css';

const VideoPlayer = ({ url, onTogglePlay, onPlayerReady, videoId }) => {
  const youTubeId = getYouTubeVideoId(url);
  const twitchChannel = getTwitchChannel(url);
  const genericStream = url && !youTubeId && !twitchChannel;

  //Handler for toggling playback state, if supported by the video player.
  const handleToggle = useCallback((newState) => {
    onTogglePlay(videoId, newState);
  }, [onTogglePlay, videoId]);

  // The 'playerData' object now contains both the player instance and its type.
  const handleReady = useCallback((playerData) => {
    onPlayerReady(videoId, playerData);
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
      <HLSStreamPlayer
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

