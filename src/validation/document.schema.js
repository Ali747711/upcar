import { z } from 'zod'

import { config } from '../config/env.js'

export const partSchema = z.object({
  id: z.string().optional(),
  // Part code is required.
  partCode: z
    .string()
    .min(1, 'Part code is required'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be 0 or greater'),
  checked: z.boolean().default(false),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
  // Cloudinary public id, returned by POST /upload — kept so the image can be
  // cleaned up later if needed.
  imagePublicId: z.string().optional()
})

/** Canonical shape of a saved quotation document / PDF payload. */
export const documentSchema = z.object({
  carName: z.string().trim().min(1, 'Car name is required'),
  carNumber: z.string().trim().min(1, 'Car number is required'),
  notes: z.string().trim().optional(),
  parts: z
    .array(partSchema)
    .min(1, 'At least one part is required')
    .max(config.maxParts, `A maximum of ${config.maxParts} parts is allowed`)
})

// Stateless PDF rendering uses the same payload as a document.
export const generatePdfSchema = documentSchema

// Partial update: any subset of fields, but at least one must be present.
export const updateDocumentSchema = documentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update'
  })

// MongoDB ObjectId: 24 hex characters.
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid document id')

/** Pagination query params with sane defaults and caps. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(config.maxPageSize)
    .default(config.defaultPageSize)
})
