/**
 * Extracts the 11-character video ID from various YouTube URL formats.
 * @param {string} url - The full YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Extracts the channel name from a Twitch URL.
 * @param {string} url - The full Twitch URL.
 * @returns {string|null} The channel name or null if not found.
 */
export const getTwitchChannel = (url) => {
  if (!url) return null;
  const regex = /(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

