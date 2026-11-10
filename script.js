(() => {
  const data = window.SITE_DATA || {};
  const $ = (id) => document.getElementById(id);
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const setText = (id, value) => { if (value) $(id).textContent = value; };
  const setLink = (id, href) => {
    const url = safeUrl(href);
    if (url) $(id).href = url;
  };

  setLink('goodreads-link', data.goodreadsUrl);
  setLink('youtube-link', data.youtubePlaylistUrl);
  setLink('apple-link', data.appleMusicPlaylistUrl);
  const mailto = `mailto:${encodeURIComponent(data.email || 'hello@example.com')}`;
  document.querySelector('.about-link').href = mailto;
  $('year').textContent = new Date().getFullYear();

  const addBook = (book) => {
    if (!book?.title) return;

    const coverWrap = document.querySelector('.book-cover-wrap');
    const title = document.querySelector('.book-info h2');
    const author = document.querySelector('.book-info .muted');
    const note = document.querySelector('.book-note');
    const bookLink = document.querySelector('.book-card .card-icon');

    if (coverWrap) {
      if (book.cover) {
        const image = document.createElement('img');
        image.src = safeUrl(book.cover);
        image.alt = `Cover of ${book.title}`;
        image.loading = 'lazy';
        image.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit';
        if (image.src) coverWrap.replaceChildren(image);
      } else {
        coverWrap.style.backgroundImage = '';
        coverWrap.classList.remove('has-cover');
      }
    }

    if (title) title.innerHTML = book.title.replace(/\n/g, '<br>');
    if (author) author.textContent = book.author || 'Currently reading';
    if (note) note.textContent = book.added ? `Added ${book.added}` : 'See what I’m reading';

    const bookUrl = safeUrl(book.url || data.goodreadsUrl);
    if (bookUrl && bookLink) bookLink.href = bookUrl;
    if (bookUrl) setLink('goodreads-link', bookUrl);
  };

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

    const albumArt = safeUrl(song.albumArt);
    if (albumArt) {
      $('music-art').style.backgroundImage = `linear-gradient(180deg, #071b36aa, #071b3655), url("${albumArt}")`;
      $('music-art').classList.add('has-art');
    }

    setText('song-added', song.added ? `ADDED ${song.added}` : 'LATEST PLAYLIST ADDITION');
    const embedUrl = safeUrl(song.embedUrl);
    if (embedUrl) {
      const frame = document.createElement('iframe');
      frame.src = embedUrl;
      frame.title = `Listen to ${song.title} on Apple Music`;
      frame.allow = 'autoplay *; encrypted-media *;';
      frame.loading = 'lazy';
      $('music-embed').replaceChildren(frame);
    }
  };

  fetch('/api/latest')
    .then((response) => {
      if (!response.ok) throw new Error('Could not load playlist updates');
      return response.json();
    })
    .then((latest) => {
      addBook(latest.goodreads);
      addVideo(latest.youtube);
      addSong(latest.appleMusic);
      if (latest.updatedAt) {
        setText('last-updated', `PLAYLISTS CHECKED ${new Date(latest.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}`);
      }
    })
    .catch(() => {
      setText('video-title', 'Open the playlist to see what’s new');
      setText('song-title', 'Open the playlist to see what’s new');
      setText('video-channel', 'Playlist updates are temporarily unavailable');
      setText('song-artist', 'Playlist updates are temporarily unavailable');
      setText('book-note', 'Open Goodreads to see what’s new');
    });
})();
