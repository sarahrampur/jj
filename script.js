(() => {
  const data = window.SITE_DATA || {};
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => { if (value) $(id).textContent = value; };
  const safeUrl = (value) => {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };

  const book = data.book || {};
  setText('book-title', book.title);
  setText('book-author', book.author);
  setText('book-note', book.note);
  const cover = safeUrl(book.coverUrl);
  if (cover) {
    $('book-cover').src = cover;
    $('book-cover').hidden = false;
    $('book-placeholder').hidden = true;
  }
  $('goodreads-link').href = safeUrl(data.goodreadsUrl) || 'https://www.goodreads.com/';

  const youtube = data.youtube || {};
  setText('video-title', youtube.title);
  setText('video-channel', youtube.channel);
  const videoId = String(youtube.videoId || '').trim();
  if (/^[\w-]{11}$/.test(videoId)) {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
    frame.title = youtube.title || 'YouTube video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    $('video-frame').replaceChildren(frame);
    $('youtube-link').href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  } else {
    $('youtube-link').href = 'https://www.youtube.com/feed/history';
  }

  const music = data.appleMusic || {};
  setText('song-title', music.title);
  setText('song-artist', music.artist);
  const trackUrl = safeUrl(music.trackUrl);
  const playlistUrl = safeUrl(music.playlistUrl);
  const listenUrl = trackUrl || playlistUrl || 'https://music.apple.com/';
  $('apple-link').href = listenUrl;
  if (trackUrl) {
    const embed = document.createElement('iframe');
    embed.src = `https://embed.music.apple.com${new URL(trackUrl).pathname}`;
    embed.title = `Listen to ${music.title || 'the song'} on Apple Music`;
    embed.allow = 'autoplay *; encrypted-media *;';
    embed.loading = 'lazy';
    $('music-embed').append(embed);
  }
  const mailto = `mailto:${encodeURIComponent(data.email || 'hello@example.com')}`;
  $('top').parentElement.querySelector('.about-link').href = mailto;
  $('year').textContent = new Date().getFullYear();
})();
