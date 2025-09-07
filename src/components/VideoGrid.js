import React from 'react';
import VideoPlayer from './VideoPlayer';
import { getVideoGridPosition } from '../utils/gridUtils';
import { getYouTubeVideoId, getTwitchChannel } from '../utils/videoUtils';


/**
 * Renders the grid of video players.
 * This component contains all the logic for positioning and displaying videos.
 */
const VideoGrid = ({ 
  videos, 
  gridLayout, 
  borderlessMode, 
  handleUrlChange, 
  handleTogglePlay,
  handlePlayerStateChange,
  handlePlayerReady 
}) => {
  return (
    <div 
      className="video-grid"
      style={{
        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`
      }}
    >
      {videos.map((video, index) => {
        const buttonText = video.playerState === 'playing' ? 'Pause / Mute' : 'Play / Unmute';
        const isGeneric = video.url && !getYouTubeVideoId(video.url) && !getTwitchChannel(video.url);
        const gridPosition = getVideoGridPosition(index, videos.length, gridLayout.cols);
        
        return (
          <div 
            key={video.id} 
            className={`video-element ${borderlessMode ? 'borderless' : ''}`}
            style={{ 
              gridColumn: gridPosition.gridColumn, 
              gridRow: gridPosition.gridRow 
            }}
          >
            {!borderlessMode && (
              <div className="top-row-controls">
                <input
                  type="text"
                  placeholder="YouTube, Twitch, or stream URL"
                  value={video.url}
                  onChange={(e) => handleUrlChange(e, video.id)}
                />
                <button 
                  className="play-toggle" 
                  onClick={() => handleTogglePlay(video.id)}
                >
                  {isGeneric
                    ? (video.isMuted ? 'Unmute' : 'Mute')
                    : buttonText
                  }
                </button>
              </div>
            )}
            <VideoPlayer 
              url={video.url}
              videoId={video.id}
              onTogglePlay={handlePlayerStateChange}
              onPlayerReady={handlePlayerReady}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VideoGrid;
