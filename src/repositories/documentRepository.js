import { DocumentModel } from '../models/Document.js'
import { partLibraryRepository } from './partLibraryRepository.js'

/**
 * Data access for quotation documents. Every operation is scoped to an owner
 * so users can only ever touch their own documents. Business/HTTP layers
 * depend on this interface, not on Mongoose directly.
 */
export const documentRepository = {
  /** Paginated list for one owner, newest first. Returns items + total count. */
  async findAll({ ownerId, page, limit }) {
    const filter = { owner: ownerId }
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      DocumentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      DocumentModel.countDocuments(filter)
    ])
    return { items, total }
  },

  /** Find one of the owner's documents by id, or null. */
  async findById(id, ownerId) {
    return DocumentModel.findOne({ _id: id, owner: ownerId }).lean({ virtuals: true })
  },

  /** Create a new document (data must include `owner`). */
  async create(data) {
    const created = await DocumentModel.create(data)
    const json = created.toJSON()
    // Background sync to library
    void partLibraryRepository.syncFromDocument(data.owner, data.parts)
    return json
  },

  /** Update one of the owner's documents; returns the updated doc or null. */
  async update(id, ownerId, data) {
    const updated = await DocumentModel.findOneAndUpdate({ _id: id, owner: ownerId }, data, {
      new: true,
      runValidators: true
    }).lean({ virtuals: true })
    
    if (updated) {
      // Background sync to library
      void partLibraryRepository.syncFromDocument(ownerId, data.parts)
    }
    
    return updated
  },

  /** Delete one of the owner's documents; returns true if removed. */
  async delete(id, ownerId) {
    const result = await DocumentModel.findOneAndDelete({ _id: id, owner: ownerId })
    return result !== null
  }
}
