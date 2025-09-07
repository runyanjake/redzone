import React from 'react';
import VideoPlayer from './VideoPlayer';
import { getVideoGridPosition } from '../utils/gridUtils';

/**
 * Renders the grid of video players.
 * This component now contains the direct event handler for URL changes.
 * The play/pause button has been removed to favor direct interaction with the embeds.
 */
const VideoGrid = ({ 
  videos, 
  gridLayout, 
  borderlessMode, 
  onUrlChange, // Renamed prop
  handlePlayerStateChange,
  handlePlayerReady 
}) => {

  // This handler now lives inside the component that owns the input element.
  const handleUrlChange = (e, id) => {
    onUrlChange(id, e.target.value); // It calls the generic update function from props
  };

  return (
    <div 
      className="video-grid"
      style={{
        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`
      }}
    >
      {videos.map((video, index) => {
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
                {/* The play/toggle button has been removed from here */}
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

