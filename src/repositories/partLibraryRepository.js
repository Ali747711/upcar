import { PartLibraryModel } from '../models/PartLibrary.js'

export const partLibraryRepository = {
  /** Find unique parts for the owner, searchable by part code. */
  async findAll({ ownerId, query = '', limit = 50 }) {
    const filter = { 
      owner: ownerId,
      partCode: { $regex: query, $options: 'i' }
    }
    
    return PartLibraryModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean({ virtuals: true })
  },

  /** 
   * Upsert parts from a document into the user's library.
   * Only saves parts that have a partCode.
   */
  async syncFromDocument(ownerId, parts) {
    if (!parts || !Array.isArray(parts)) return

    const ops = parts
      .filter(p => p.partCode && p.partCode.trim() !== '')
      .map(p => ({
        updateOne: {
          filter: { owner: ownerId, partCode: p.partCode },
          update: {
            $set: {
              owner: ownerId,
              partCode: p.partCode,
              imageUrl: p.imageUrl,
              imagePublicId: p.imagePublicId,
              lastPrice: p.price
            }
          },
          upsert: true
        }
      }))

    if (ops.length > 0) {
      await PartLibraryModel.bulkWrite(ops)
    }
  }
}
