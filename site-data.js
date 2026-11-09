/*
  EDIT THIS FILE to refresh your page. No API keys or build tools needed.
  YouTube likes and Goodreads shelves are private/limited integrations, so this
  static page uses values you choose here. For YouTube, paste the ID from the
  video URL (youtube.com/watch?v=VIDEO_ID). For music, paste the Apple Music
  track URL for the final song on your playlist. Update these when you like,
  read, or add something new.
*/
window.SITE_DATA = {
  goodreadsUrl: 'https://www.goodreads.com/review/list/163839274?shelf=currently-reading',
  book: {
    title: 'A book in progress',
    author: 'A good story, lately',
    coverUrl: '', // Optional: direct image URL for the cover
    note: 'The one keeping me up for just one more chapter.'
  },
  youtube: {
    videoId: '', // Example: 'dQw4w9WgXcQ'
    title: 'A good thing I watched',
    channel: 'A tiny internet favorite'
  },
  appleMusic: {
    playlistUrl: 'https://music.apple.com/us/playlist/srmedia/pl.u-BNA6ePVu1VmLWKZ',
    trackUrl: '', // Paste the URL of the last song on the playlist to show its player
    title: 'One more song',
    artist: 'The soundtrack to right now'
  },
  email: 'hello@example.com'
};
