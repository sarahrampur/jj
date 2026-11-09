# Sarah's little now

A small, responsive, static landing page for the things Sarah is currently reading, watching, and listening to. It deploys directly to Vercel with no build step or API keys.

## Edit the page

Edit [`site-data.js`](./site-data.js) to change the book, video, and song details. The file is intentionally separate from the design, so the content is quick to update without touching the HTML or CSS.

- **Goodreads:** the page links to the Currently Reading shelf. Goodreads does not provide a dependable unauthenticated way for this static page to read shelf contents, so update the book's title, author, optional cover image URL, and note in `site-data.js`.
- **YouTube:** set `videoId` to the 11-character ID from the liked video's URL, then edit its title and channel. For example, in `youtube.com/watch?v=abc123def45`, the ID follows `v=`.
- **Apple Music:** the playlist link is prefilled. Set the song's title and artist and, if you want an embedded player for the last track, paste that track's Apple Music URL into `trackUrl`. A static page cannot reliably identify the last playlist track automatically.
- Change `email` to the address for the “say hello” link.

This is a static site: it does not fetch private account data or store credentials. Refresh `site-data.js` when your favorites change.

## Deploy to Vercel

Import this GitHub repository in Vercel and deploy with the defaults. No framework preset, build command, or output directory is required; `index.html` is served from the repository root.
