import { summarize } from './money.js'
import { generatePdf } from '../services/pdfService.js'

/** Build a filesystem-safe filename from the car name. */
export const buildFileName = (carName) => {
  const slug = String(carName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `quotation-${slug || 'parts'}.pdf`
}

/**
 * Render a quotation ({ carName, carNumber, notes, parts }) to a PDF and stream
 * it back as application/pdf. Totals are derived here from the parts list.
 */
export const renderAndSendPdf = async (res, { carName, carNumber, notes, parts }) => {
  const { rows, grandTotal, itemCount } = summarize(parts)

  const pdf = await generatePdf({
    carName,
    carNumber,
    notes,
    rows,
    grandTotal,
    itemCount
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${buildFileName(carName)}"`
  )
  res.setHeader('Content-Length', pdf.length)
  res.send(pdf)
}
