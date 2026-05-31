import { buildHtml } from './src/templates/pdfTemplate.js'
import puppeteer from 'puppeteer'
const makeRows = (n) => Array.from({ length: n }, (_, i) => ({ partCode: String(100000000000+i), quantity:2, price:50, checked:i%2===0, imageUrl:null, total:100 }))
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] })
const html = buildHtml({ carName:'Test', carNumber:'ABC', rows: makeRows(16), grandTotal:1600, itemCount:16 })
const page = await browser.newPage()
await page.setContent(html, { waitUntil:'domcontentloaded' })
const info = await page.evaluate(() => {
  const A4 = Math.round(297*3.7795275591)
  const f = document.querySelector('.doc__footer').getBoundingClientRect()
  const d = document.querySelector('.doc').getBoundingClientRect()
  return { A4, docHeight: Math.round(d.height), footerBottom: Math.round(f.bottom), marginLeft: Math.round(A4 - f.bottom) }
})
console.log(JSON.stringify(info))
await browser.close()
