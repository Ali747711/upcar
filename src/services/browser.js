import puppeteer from 'puppeteer'

import { AppError } from '../utils/errors.js'

// A single shared browser instance is reused across requests; only pages are
// opened/closed per request. Launching Chromium per request is the main cause
// of slow PDF generation.
let browserPromise = null

const launchArgs = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]

/**
 * Get the shared browser, launching it on first use. Concurrent callers share
 * the same in-flight launch promise. If a previous browser disconnected, a
 * fresh one is launched.
 */
export const getBrowser = async () => {
  if (browserPromise) {
    const browser = await browserPromise
    if (browser.connected) return browser
    browserPromise = null
  }

  if (!browserPromise) {
    browserPromise = puppeteer.launch({ headless: true, args: launchArgs })
  }

  try {
    return await browserPromise
  } catch (error) {
    browserPromise = null
    throw new AppError(
      'Failed to launch the PDF rendering engine',
      503,
      error.message
    )
  }
}

/** Close the shared browser; used on graceful shutdown. */
export const closeBrowser = async () => {
  if (!browserPromise) return
  try {
    const browser = await browserPromise
    await browser.close()
  } catch {
    // Already gone — nothing to clean up.
  } finally {
    browserPromise = null
  }
}
