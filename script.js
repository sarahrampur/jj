(() => {
  const data = window.SITE_DATA || {};
  const $ = (id) => document.getElementById(id);
  const safeUrl = (value) => {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const setText = (id, value) => { if (value) $(id).textContent = value; };
  const setLink = (id, href) => { const url = safeUrl(href); if (url) $(id).href = url; };

  setLink('goodreads-link', data.goodreadsUrl);
  setLink('youtube-link', data.youtubePlaylistUrl);
  setLink('apple-link', data.appleMusicPlaylistUrl);
  const mailto = `mailto:${encodeURIComponent(data.email || 'hello@example.com')}`;
  document.querySelector('.about-link').href = mailto;
  $('year').textContent = new Date().getFullYear();

  const addVideo = (video) => {
    if (!video?.id) return;
    setText('video-title', video.title);
    setText('video-channel', video.channel);
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}`;
    frame.title = video.title || 'Latest addition to Sarah’s YouTube playlist';
    frame.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    $('video-frame').replaceChildren(frame);
    setLink('youtube-link', video.url);
    setText('video-added', video.added ? `ADDED ${video.added}` : 'LATEST PLAYLIST ADDITION');
  };

  const addSong = (song) => {
    if (!song?.title) return;
    setText('song-title', song.title);
    setText('song-artist', song.artist);
    setLink('apple-link', song.url || data.appleMusicPlaylistUrl);
    if (song.albumArt) {
      $('music-art').style.backgroundImage = `linear-gradient(180deg, #071b36aa, #071b3655), url("${song.albumArt.replace(/["\\]/g, '')}")`;
      $('music-art').classList.add('has-art');
    }
    setText('song-added', song.added ? `ADDED ${song.added}` : 'LATEST PLAYLIST ADDITION');
    if (song.embedUrl) {
      const frame = document.createElement('iframe');
      frame.src = song.embedUrl;
      frame.title = `Listen to ${song.title} on Apple Music`;
      frame.allow = 'autoplay *; encrypted-media *;';
      frame.loading = 'lazy';
      $('music-embed').append(frame);
    }
  };

  fetch('/api/latest')
    .then((response) => { if (!response.ok) throw new Error('Could not load playlist updates'); return response.json(); })
    .then((latest) => {
      addVideo(latest.youtube);
      addSong(latest.appleMusic);
      if (latest.updatedAt) setText('last-updated', `PLAYLISTS CHECKED ${new Date(latest.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}`);
    })
    .catch(() => {
      setText('video-title', 'Open the playlist to see what’s new');
      setText('song-title', 'Open the playlist to see what’s new');
      setText('video-channel', 'Playlist updates are temporarily unavailable');
      setText('song-artist', 'Playlist updates are temporarily unavailable');
    });
})();
