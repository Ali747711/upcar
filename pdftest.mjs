import { buildHtml } from './src/templates/pdfTemplate.js'
import puppeteer from 'puppeteer'

const makeRows = (n) => Array.from({ length: n }, (_, i) => ({
  partCode: String(100000000000 + i),
  quantity: 2, price: 50, checked: i % 2 === 0, imageUrl: null, total: 100,
}))

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] })
const html = buildHtml({ carName: 'Test', carNumber: 'ABC', rows: makeRows(8), grandTotal: 800, itemCount: 8 })
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'domcontentloaded' })

const info = await page.evaluate(() => {
  const mm = 297 * 3.7795275591 // A4 height in px @96dpi
  const doc = document.querySelector('.doc')
  const docPage = document.querySelector('.doc__page')
  const footer = document.querySelector('.doc__footer')
  const r = (el) => el ? { top: Math.round(el.getBoundingClientRect().top), bottom: Math.round(el.getBoundingClientRect().bottom), height: Math.round(el.getBoundingClientRect().height) } : null
  return {
    A4px: Math.round(mm),
    bodyScroll: document.body.scrollHeight,
    doc: r(doc),
    docComputedMinHeight: getComputedStyle(doc).minHeight,
    docPage: r(docPage),
    footer: r(footer),
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
