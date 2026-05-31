import { getBrowser } from './browser.js'
import { buildHtml } from '../templates/pdfTemplate.js'
import { AppError } from '../utils/errors.js'

// Overall cap for parsing the HTML document.
const RENDER_TIMEOUT_MS = 30000
// Bounded wait for webfonts + images to settle after the DOM is ready. If a
// remote asset (Google Fonts, a Cloudinary image) is slow or unreachable we
// stop waiting and render with the system-font fallback / image placeholder
// rather than hanging the whole request.
const ASSET_WAIT_MS = 10000

/**
 * Render the Parts Quotation HTML to a PDF buffer using the shared browser.
 * This stays free of HTTP concerns — it takes prepared data and returns bytes.
 *
 * @param {object} data  template data ({ carName, carNumber, notes, rows, grandTotal, itemCount })
 * @returns {Promise<Buffer>}
 */
export const generatePdf = async (data) => {
  const html = buildHtml(data)
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // Use 'domcontentloaded' (not 'networkidle0') so a slow CDN / lingering
    // keep-alive connection to Google Fonts can't stall the render. We then
    // wait explicitly — and with a hard cap — for fonts and images.
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: RENDER_TIMEOUT_MS
    })

    // Deterministically wait for webfonts + images, but never block forever.
    await page.evaluate(async (maxWait) => {
      const fontsReady =
        document.fonts && document.fonts.ready
          ? document.fonts.ready
          : Promise.resolve()

      const pendingImages = Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = resolve
              img.onerror = resolve
            })
        )

      const assetsReady = Promise.all([fontsReady, ...pendingImages])
      const cap = new Promise((resolve) => setTimeout(resolve, maxWait))
      await Promise.race([assetsReady, cap])
    }, ASSET_WAIT_MS)

    // No page margin here: the shared `.doc` padding defines the page
    // margins so the PDF matches the in-app preview exactly.
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    })
  } catch (error) {
    throw new AppError('Failed to render the PDF', 500, error.message)
  } finally {
    // Always close the page to avoid leaking tabs in the long-lived browser.
    await page.close().catch(() => {})
  }
}
