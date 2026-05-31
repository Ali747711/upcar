import { getBrowser } from './browser.js'
import { buildHtml } from '../templates/pdfTemplate.js'
import { AppError } from '../utils/errors.js'

// Cap how long we wait for content (fonts/images) so a slow remote image can't
// hang the request indefinitely.
const RENDER_TIMEOUT_MS = 15000

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
    // networkidle0 waits for images and the Noto Sans webfont to finish loading
    // so non-Latin text and thumbnails render correctly.
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: RENDER_TIMEOUT_MS
    })

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
