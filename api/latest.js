const YOUTUBE_PLAYLIST = 'https://www.youtube.com/feeds/videos.xml?playlist_id=PLKcPCbW_zBkU';
const APPLE_PLAYLIST = 'https://music.apple.com/us/playlist/srmedia/pl.u-BNA6ePVu1VmLWKZ';
const GOODREADS_SHELF = 'https://www.goodreads.com/review/list/163839274?shelf=currently-reading';
const GOODREADS_FEED = 'https://www.goodreads.com/review/list_rss/163839274?shelf=currently-reading';

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ');
}

function decodeHtml(value = '') {
  return decodeXml(
    value
      .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/&nbsp;/g, ' ')
  );
}

function cleanText(value = '') {
  return decodeHtml(String(value).replace(/\s+/g, ' ').trim());
}

function tag(content, name) {
  const match = content.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, '').trim()) : '';
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SarahCurrent/1.0)',
      Accept: 'application/xml,text/html,*/*'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.text();
}

function getGoodreadsBook(xml) {
  const item = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/i)?.[0];
  if (!item) return null;

  const title = tag(item, 'book_title') || tag(item, 'title');
  if (!title) return null;

  const bookId = tag(item, 'book_id');
  const link = tag(item, 'link');
  const author = tag(item, 'author_name');
  const cover = tag(item, 'book_large_image_url') || tag(item, 'book_image_url');
  const dateAdded = tag(item, 'date_added');

  return {
    title: title.replace(/\s+by\s+.+$/i, '').trim(),
    author,
    url: link || (bookId ? `https://www.goodreads.com/book/show/${encodeURIComponent(bookId)}` : GOODREADS_SHELF),
    cover: cover ? cover.replace(/_SY75_/, '_SX600_').replace(/_SX75_/, '_SX600_') : '',
    added: dateAdded ? new Date(dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''
  };
}

function getGoodreadsBookHtml(html) {
  const titleMatches = [...html.matchAll(/"title"\s*:\s*"((?:\\.|[^"\\])+)"/g)];
  const coverMatches = [...html.matchAll(/"smallImageUrl"\s*:\s*"((?:\\.|[^"\\])+)"/g)];
  const bookUrlMatch = html.match(/href="(\/book\/show\/[0-9]+[^"\s]*)"/i)?.[1];

  if (!titleMatches.length) return null;

  const title = JSON.parse(`"${titleMatches.at(-1)[1]}"`);
  const cover = coverMatches.length ? JSON.parse(`"${coverMatches.at(-1)[1]}"`) : '';

  return {
    title: cleanText(title),
    author: 'Currently reading',
    url: bookUrlMatch ? `https://www.goodreads.com${bookUrlMatch}` : GOODREADS_SHELF,
    cover: cover ? cover.replace(/_SY75_/, '_SX600_').replace(/_SX75_/, '_SX600_') : '',
    added: ''
  };
}

function getYoutube(xml) {
  const entry = xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/i)?.[0];
  if (!entry) return null;

  const videoId = tag(entry, 'yt:videoId');
  if (!/^[\w-]{11}$/.test(videoId)) return null;

  const channel = tag(entry, 'author').match(/<name>([\s\S]*?)<\/name>/i)?.[1];

  return {
    id: videoId,
    title: tag(entry, 'title') || 'Latest playlist addition',
    channel: channel ? decodeXml(channel) : 'From Sarah’s YouTube playlist',
    url: `https://www.youtube.com/watch?v=${videoId}`,
    added: tag(entry, 'published') ? new Date(tag(entry, 'published')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''
  };
}

function getAppleTrack(html) {
  const names = [...html.matchAll(/"trackName"\s*:\s*"((?:\\.|[^"\\])+)"/g)];
  const artists = [...html.matchAll(/"artistName"\s*:\s*"((?:\\.|[^"\\])+)"/g)];
  const songLinks = [...html.matchAll(/https?:\\?\/\\?\/music\.apple\.com\\?\/[^"\\\s]*\\?\/song\\?\/[^"\\\s]+/g)];
  const clean = (text) => {
    try { return JSON.parse(`"${text}"`); } catch { return text; }
  };

  if (names.length) {
    const index = names.length - 1;
    const title = clean(names[index][1]);
    const artist = artists.length ? clean(artists[Math.min(index, artists.length - 1)][1]) : '';
    const link = songLinks[index]?.[0]?.replace(/\\\//g, '/') || '';
    const songUrl = link || APPLE_PLAYLIST;
    const embedUrl = link ? link.replace('music.apple.com/', 'embed.music.apple.com/') : '';
    const artworkMatches = [...html.matchAll(/"artwork"\s*:\s*\{[^}]*"url"\s*:\s*"((?:\\.|[^"\\])+)"/g)];
    const artwork = artworkMatches.at(-1)?.[1] || '';

    return {
      title,
      artist,
      url: songUrl.replace(/\\\//g, '/'),
      embedUrl,
      albumArt: artwork ? clean(artwork).replace('{w}', '600').replace('{h}', '600') : '',
      added: ''
    };
  }

  const title = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] || '';
  const description = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i)?.[1] || '';

  if (title) {
    return {
      title: decodeHtml(title),
      artist: decodeHtml(description),
      url: APPLE_PLAYLIST,
      albumArt: '',
      added: ''
    };
  }

  return null;
}

export default async function handler(_request, response) {
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  response.setHeader('Access-Control-Allow-Origin', '*');

  const result = {
    updatedAt: new Date().toISOString(),
    goodreads: null,
    youtube: null,
    appleMusic: null
  };

  const [goodreadsFeed, goodreadsShelf, youtube, apple] = await Promise.allSettled([
    fetchText(GOODREADS_FEED),
    fetchText(GOODREADS_SHELF),
    fetchText(YOUTUBE_PLAYLIST),
    fetchText(APPLE_PLAYLIST)
  ]);

  if (goodreadsFeed.status === 'fulfilled') {
    result.goodreads = getGoodreadsBook(goodreadsFeed.value);
  } else if (goodreadsShelf.status === 'fulfilled') {
    result.goodreads = getGoodreadsBookHtml(goodreadsShelf.value);
  }

  if (youtube.status === 'fulfilled') result.youtube = getYoutube(youtube.value);
  if (apple.status === 'fulfilled') result.appleMusic = getAppleTrack(apple.value);

  if (!result.goodreads && !result.youtube && !result.appleMusic) {
    return response.status(502).json({ error: 'Playlist data is temporarily unavailable.' });
  }

  return response.status(200).json(result);
}

