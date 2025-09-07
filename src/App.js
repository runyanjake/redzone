import React from 'react';
import VideoGrid from './components/VideoGrid';
import './App.css';

function App() {
  // App is now just a simple wrapper component that renders the main VideoGrid.
  // All state and logic have been moved into the VideoGrid component itself.
  return (
    <VideoGrid />
  );
}

export default App;

