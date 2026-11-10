import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const GOODREADS_URL = 'https://goodreads.com';
const outputPath = join(dirname(fileURLToPath(import.meta.url)), 'current-read.json');

async function fetchCurrentRead() {
  const response = await fetch(GOODREADS_URL);
  if (!response.ok) {
    throw new Error(`Goodreads request failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const currentlyReading = $('#currentlyReading');

  if (!currentlyReading.length) {
    throw new Error('Could not find the #currentlyReading container on Goodreads.');
  }

  const titleElement = currentlyReading.find('.bookTitle').first();
  const authorElement = currentlyReading.find('.authorName').first();
  const coverElement = currentlyReading.find('img').first();

  const title = titleElement.text().trim();
  const author = authorElement.text().trim();
  const coverImage = coverElement.attr('src')
    || coverElement.attr('data-src')
    || coverElement.attr('data-original');

  const missing = [];
  if (!title) missing.push('title');
  if (!author) missing.push('author');
  if (!coverImage) missing.push('cover image URL');
  if (missing.length) {
    throw new Error(`Could not find ${missing.join(', ')} for the first book in #currentlyReading.`);
  }

  const data = {
    title,
    author,
    coverImageUrl: new URL(coverImage, GOODREADS_URL).href,
  };

  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Saved current read to ${outputPath}`);
}

fetchCurrentRead().catch((error) => {
  console.error(`Unable to fetch current read: ${error.message}`);
  process.exitCode = 1;
});
