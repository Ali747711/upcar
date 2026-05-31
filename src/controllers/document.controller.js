import {
  documentSchema,
  updateDocumentSchema,
  objectIdSchema,
  listQuerySchema
} from '../validation/document.schema.js'
import { documentRepository } from '../repositories/documentRepository.js'
import { serializeDocument } from '../utils/serializeDocument.js'
import { renderAndSendPdf } from '../utils/pdfResponse.js'
import { AppError, ValidationError } from '../utils/errors.js'

/** Validate with a Zod schema or throw a ValidationError with field details. */
const validate = (schema, value, message) => {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new ValidationError(
      message,
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    )
  }
  return parsed.data
}

/** Validate the :id param and return it, or throw a 400. */
const requireId = (req) => validate(objectIdSchema, req.params.id, 'Invalid document id')

/** Load one of the owner's documents by id or throw a 404. */
const loadOrFail = async (id, ownerId) => {
  const doc = await documentRepository.findById(id, ownerId)
  if (!doc) throw new AppError('Document not found', 404)
  return doc
}

/** POST /documents — create (save) a new document for the current user. */
export const createDocument = async (req, res) => {
  const data = validate(documentSchema, req.body, 'Invalid document payload')
  const created = await documentRepository.create({ ...data, owner: req.user.id })
  res.status(201).json({ success: true, data: serializeDocument(created) })
}

/** GET /documents — paginated list of the current user's documents. */
export const listDocuments = async (req, res) => {
  const { page, limit } = validate(listQuerySchema, req.query, 'Invalid query parameters')
  const { items, total } = await documentRepository.findAll({
    ownerId: req.user.id,
    page,
    limit
  })

  res.json({
    success: true,
    data: items.map(serializeDocument),
    meta: { total, page, limit }
  })
}

/** GET /documents/:id — read one of the current user's documents. */
export const getDocument = async (req, res) => {
  const id = requireId(req)
  const doc = await loadOrFail(id, req.user.id)
  res.json({ success: true, data: serializeDocument(doc) })
}

/** PUT /documents/:id — update (partial fields allowed). */
export const updateDocument = async (req, res) => {
  const id = requireId(req)
  const data = validate(updateDocumentSchema, req.body, 'Invalid document payload')

  const updated = await documentRepository.update(id, req.user.id, data)
  if (!updated) throw new AppError('Document not found', 404)

  res.json({ success: true, data: serializeDocument(updated) })
}

/** DELETE /documents/:id — remove. */
export const deleteDocument = async (req, res) => {
  const id = requireId(req)
  const removed = await documentRepository.delete(id, req.user.id)
  if (!removed) throw new AppError('Document not found', 404)

  res.json({ success: true, data: { id, deleted: true } })
}

/** POST /documents/:id/pdf — render a saved document to a PDF. */
export const renderDocumentPdf = async (req, res) => {
  const id = requireId(req)
  const doc = await loadOrFail(id, req.user.id)
  await renderAndSendPdf(res, doc)
}
