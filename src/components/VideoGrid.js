import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import VideoPlayer from './VideoPlayer';
import { calculateOptimalGrid, getVideoGridPosition } from '../utils/gridUtils';
import './VideoGrid.css';

const VideoGrid = forwardRef(({ borderlessMode }, ref) => {
  const [videos, setVideos] = useState([{ id: 1, url: '' }]);
  const [gridLayout, setGridLayout] = useState({ rows: 1, cols: 1 });
  const playerRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        setGridLayout(calculateOptimalGrid(videos.length));
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [videos.length]);

  const handleAddVideo = useCallback(() => {
    setVideos(prev => [...prev, { id: Date.now(), url: '' }]);
  }, []);

  useImperativeHandle(ref, () => ({
    addVideo: () => {
      handleAddVideo();
    }
  }));

  const updateVideoUrl = useCallback((id, newUrl) => {
    setVideos(prev => prev.map(v => (v.id === id ? { ...v, url: newUrl } : v)));
  }, []);

  const handlePlayerReady = useCallback((id) => {
    const playerAPI = playerRefs.current[id]?.current;
    if (playerAPI) {
      playerAPI.play();
      playerAPI.unMute();
    }
  }, []);

  const handleUrlChange = (e, id) => {
    updateVideoUrl(id, e.target.value);
  };

  return (
    <div
      ref={containerRef}
      className="video-grid"
      style={{
        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
      }}
    >
      {videos.map((video, index) => {
        if (!playerRefs.current[video.id]) {
          playerRefs.current[video.id] = React.createRef();
        }
        const gridPosition = getVideoGridPosition(index, videos.length, gridLayout.cols);
        return (
          <div
            key={video.id}
            className={`video-element ${borderlessMode ? 'borderless' : ''}`}
            style={{ gridColumn: gridPosition.gridColumn, gridRow: gridPosition.gridRow }}
          >
            {!borderlessMode && (
              <div className="top-row-controls">
                <input
                  type="text"
                  placeholder="YouTube, Twitch, or stream URL"
                  value={video.url}
                  onChange={e => handleUrlChange(e, video.id)}
                />
              </div>
            )}
            <VideoPlayer
              ref={playerRefs.current[video.id]}
              url={video.url}
              onReady={() => handlePlayerReady(video.id)}
            />
          </div>
        );
      })}
    </div>
  );
});

export default VideoGrid;

