/**
 * Calculates the optimal grid layout (rows and columns) for a given number of videos.
 * Aims for a layout that is as close to a square as possible.
 * @param {number} videoCount - The total number of videos to display.
 * @returns {{rows: number, cols: number}} The calculated number of rows and columns.
 */
export const calculateOptimalGrid = (videoCount) => {
  if (videoCount <= 0) return { rows: 1, cols: 1 };
  if (videoCount === 1) return { rows: 1, cols: 1 };
  if (videoCount === 2) return { rows: 1, cols: 2 };
  
  const nextSquare = Math.ceil(Math.sqrt(videoCount));
  const rows = nextSquare;
  const cols = Math.ceil(videoCount / rows);
  
  return { rows, cols };
};

/**
 * Calculates the specific grid row and column for a video element.
 * This function handles centering the last row if it's not completely full.
 * @param {number} videoIndex - The zero-based index of the video in the array.
 * @param {number} totalVideos - The total number of videos in the grid.
 * @param {number} gridCols - The total number of columns in the grid layout.
 * @returns {{gridColumn: number, gridRow: number}} The CSS grid position.
 */
export const getVideoGridPosition = (videoIndex, totalVideos, gridCols) => {
  const fullRows = Math.floor(totalVideos / gridCols);
  const videosInLastRow = totalVideos % gridCols;
  
  // Check if the video is in a "full" row
  if (videoIndex < fullRows * gridCols) {
    return {
      gridColumn: (videoIndex % gridCols) + 1,
      gridRow: Math.floor(videoIndex / gridCols) + 1
    };
  } 
  // Otherwise, it's in the last, potentially partial row
  else {
    // If the last row is full, it's a normal calculation
    if (videosInLastRow === 0) {
      return {
        gridColumn: (videoIndex % gridCols) + 1,
        gridRow: Math.floor(videoIndex / gridCols) + 1
      };
    } 
    // If the last row is partial, calculate the starting column to center it
    else {
      const startCol = Math.floor((gridCols - videosInLastRow) / 2) + 1;
      const colInLastRow = videoIndex - (fullRows * gridCols);
      return {
        gridColumn: startCol + colInLastRow,
        gridRow: fullRows + 1
      };
    }
  }
};
