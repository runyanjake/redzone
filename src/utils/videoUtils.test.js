import { getTwitchChannel, getYouTubeVideoId } from './videoUtils';

describe('getYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('extracts the id from %s', (url, id) => {
    expect(getYouTubeVideoId(url)).toBe(id);
  });

  it('returns null for empty or non-YouTube urls', () => {
    expect(getYouTubeVideoId('')).toBeNull();
    expect(getYouTubeVideoId('https://example.com/video')).toBeNull();
  });
});

describe('getTwitchChannel', () => {
  it('extracts the channel name', () => {
    expect(getTwitchChannel('https://www.twitch.tv/some_channel')).toBe('some_channel');
    expect(getTwitchChannel('twitch.tv/abc123')).toBe('abc123');
  });

  it('returns null for empty or non-Twitch urls', () => {
    expect(getTwitchChannel(null)).toBeNull();
    expect(getTwitchChannel('https://example.com/some_channel')).toBeNull();
  });
});
