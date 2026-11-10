# Sarah — Currently

A responsive, minimal landing page with cool neutrals and navy accents. Vercel serves the static page and the `/api/latest` serverless function fetches the latest public playlist entries.

## Live playlist entries

The page checks the public YouTube playlist feed for its newest entry and reads public song metadata from the Apple Music playlist page. The API response is cached for five minutes by Vercel. If Apple's public page markup changes or blocks requests, its card gracefully falls back to the playlist link.

Goodreads links directly to the public Currently Reading shelf. Goodreads does not provide a dependable unauthenticated interface for a static site to retrieve shelf books, so the page links visitors to the live shelf rather than showing potentially stale book details.

## Edit the page

- Change playlist URLs and contact email in `site-data.js`.
- Adjust colors, typography, spacing, and card layout in `styles.css`.
- Update markup in `index.html` and behavior in `script.js`.

No credentials or Google OAuth secrets are used or needed. Never put secrets in frontend files.

## Deploy to Vercel

Import the repository into Vercel and deploy with the defaults. The `/api` directory is automatically deployed as a serverless function; the static site is served from the repository root. No build command or output directory is required.
