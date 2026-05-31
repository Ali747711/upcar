import { generatePdfSchema } from '../validation/document.schema.js'
import { renderAndSendPdf } from '../utils/pdfResponse.js'
import { ValidationError } from '../utils/errors.js'

/**
 * POST /generate-pdf
 * Stateless render: validate the payload at the boundary, then render and
 * stream the PDF without persisting anything.
 */
export const generatePdfController = async (req, res) => {
  const parsed = generatePdfSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new ValidationError(
      'Invalid request payload',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    )
  }

  await renderAndSendPdf(res, parsed.data)
}
