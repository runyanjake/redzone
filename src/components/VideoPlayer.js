import React from 'react';
import YouTubePlayer from './YouTubePlayer';
import TwitchPlayer from './TwitchPlayer';
import HLSStreamPlayer from './HLSStreamPlayer';
import { getYouTubeVideoId, getTwitchChannel } from '../utils/videoUtils';
import './VideoPlayer.css';

//Passes references down to the specific implementation.
const VideoPlayer = React.forwardRef(({ url, onReady }, ref) => {
  const youTubeId = getYouTubeVideoId(url);
  const twitchChannel = getTwitchChannel(url);
  const isHLS = url && !youTubeId && !twitchChannel;

  if (youTubeId) {
    return <YouTubePlayer ref={ref} videoId={youTubeId} onReady={onReady} />;
  }

  if (twitchChannel) {
    return <TwitchPlayer ref={ref} channel={twitchChannel} onReady={onReady} />;
  }

  if (isHLS) {
    return <HLSStreamPlayer ref={ref} streamUrl={url} onReady={onReady} />;
  }

  return (
    <div className="placeholder">
      Enter a YouTube, Twitch, or other stream URL to start.
    </div>
  );
});

export default VideoPlayer;

