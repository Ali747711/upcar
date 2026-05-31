const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  // On Render, the default home directory cache is often not accessible or persists incorrectly.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
