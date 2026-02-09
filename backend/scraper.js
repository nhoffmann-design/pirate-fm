/**
 * Headline Scraper
 * Fetches top headlines from HN, TechCrunch, Wired, CNN
 * Runs every 4-6 hours (via APScheduler or Node cron)
 */

import fetch from 'node-fetch';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_PATH || './pirate.db');

/**
 * Fetch top headlines from HackerNews API
 */
async function fetchHackerNews() {
  try {
    const topStories = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(res => res.json());

    const headlines = [];
    for (let i = 0; i < Math.min(5, topStories.length); i++) {
      const storyId = topStories[i];
      const story = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
        .then(res => res.json());

      if (story.title && story.url) {
        headlines.push({
          source: 'HackerNews',
          title: story.title,
          url: story.url,
        });
      }
    }
    return headlines;
  } catch (err) {
    console.error('[SCRAPER] HackerNews error:', err.message);
    return [];
  }
}

/**
 * Fetch TechCrunch headlines (via RSS)
 * Note: May need to add RSS parser (npm install rss-parser)
 */
async function fetchTechCrunch() {
  try {
    // For now, return placeholder; in production, parse RSS feed
    // RSS: https://techcrunch.com/feed/
    // Consider using: npm install rss-parser
    return [
      {
        source: 'TechCrunch',
        title: '[Placeholder] TechCrunch RSS feed not yet integrated',
        url: 'https://techcrunch.com',
      },
    ];
  } catch (err) {
    console.error('[SCRAPER] TechCrunch error:', err.message);
    return [];
  }
}

/**
 * Fetch Wired headlines (via RSS)
 */
async function fetchWired() {
  try {
    // Placeholder; similar to TechCrunch
    // RSS: https://www.wired.com/feed/rss
    return [
      {
        source: 'Wired',
        title: '[Placeholder] Wired RSS feed not yet integrated',
        url: 'https://wired.com',
      },
    ];
  } catch (err) {
    console.error('[SCRAPER] Wired error:', err.message);
    return [];
  }
}

/**
 * Fetch CNN headlines (via RSS)
 */
async function fetchCNN() {
  try {
    // Placeholder
    // RSS: http://rss.cnn.com/rss/cnn_topstories.rss
    return [
      {
        source: 'CNN',
        title: '[Placeholder] CNN RSS feed not yet integrated',
        url: 'https://cnn.com',
      },
    ];
  } catch (err) {
    console.error('[SCRAPER] CNN error:', err.message);
    return [];
  }
}

/**
 * Store headline in database
 */
function storeHeadline(source, title, url) {
  try {
    db.prepare(`
      INSERT INTO headlines (source, title, url)
      VALUES (?, ?, ?)
    `).run(source, title, url);
  } catch (err) {
    console.error('[SCRAPER] DB error:', err.message);
  }
}

/**
 * Main scrape function
 */
export async function scrapeHeadlines() {
  console.log(`[SCRAPER] Starting headline scrape at ${new Date().toISOString()}`);

  try {
    // Fetch from all sources in parallel
    const [hnHeadlines, tcHeadlines, wiredHeadlines, cnnHeadlines] = await Promise.all([
      fetchHackerNews(),
      fetchTechCrunch(),
      fetchWired(),
      fetchCNN(),
    ]);

    // Combine and store
    const allHeadlines = [
      ...hnHeadlines,
      ...tcHeadlines,
      ...wiredHeadlines,
      ...cnnHeadlines,
    ];

    for (const headline of allHeadlines) {
      storeHeadline(headline.source, headline.title, headline.url);
    }

    console.log(`[SCRAPER] ✅ Scraped ${allHeadlines.length} headlines`);
    return allHeadlines;
  } catch (err) {
    console.error('[SCRAPER] Fatal error:', err);
    return [];
  }
}

/**
 * Get top recent headlines for music generation
 */
export function getTopHeadlines(limit = 5) {
  try {
    return db.prepare(`
      SELECT * FROM headlines
      ORDER BY scraped_at DESC
      LIMIT ?
    `).all(limit);
  } catch (err) {
    console.error('[SCRAPER] DB query error:', err.message);
    return [];
  }
}

/**
 * Schedule scraper to run every N hours
 * Usage in server.js:
 * 
 * import { scrapeHeadlines } from './scraper.js';
 * 
 * setInterval(() => {
 *   scrapeHeadlines();
 * }, 6 * 60 * 60 * 1000); // Every 6 hours
 */

// For testing: run immediately if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeHeadlines().then(() => {
    const headlines = getTopHeadlines(5);
    console.log('\nTop Headlines:');
    headlines.forEach((h, i) => {
      console.log(`${i + 1}. [${h.source}] ${h.title}`);
    });
    process.exit(0);
  });
}
