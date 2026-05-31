import { partLibraryRepository } from '../repositories/partLibraryRepository.js'

/**
 * Map a lean PartLibrary doc to the clean API shape the frontend expects.
 * `.lean()` returns `_id` (the `id` virtual isn't applied without the
 * lean-virtuals plugin), so expose a stringified `id` explicitly.
 */
const serializeLibraryPart = (part) => ({
  id: String(part.id ?? part._id),
  partCode: part.partCode,
  imageUrl: part.imageUrl,
  lastPrice: part.lastPrice
})

/** GET /parts-library — search the user's previously used parts. */
export const listLibraryParts = async (req, res) => {
  const { q, limit } = req.query
  const parts = await partLibraryRepository.findAll({
    ownerId: req.user.id,
    query: q,
    limit: limit ? parseInt(limit) : 50
  })

  res.json({ success: true, data: parts.map(serializeLibraryPart) })
}
