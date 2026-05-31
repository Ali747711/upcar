import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A PartLibrary entry stores the "most recent" version of a part code used
 * by a specific user. This allows them to reuse images and pricing.
 */
const partLibrarySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    partCode: { type: String, required: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    lastPrice: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id
        return ret
      }
    }
  }
)

// One unique part code per user in the library.
partLibrarySchema.index({ owner: 1, partCode: 1 }, { unique: true })

export const PartLibraryModel = mongoose.model('PartLibrary', partLibrarySchema)
