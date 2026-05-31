import mongoose from 'mongoose'

const { Schema } = mongoose

// A saved part line. Validation of shape/format is done with Zod at the API
// boundary; this schema mirrors it for storage and basic safety.
const partSchema = new Schema(
  {
    partCode: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    checked: { type: Boolean, default: false },
    imageUrl: { type: String },
    imagePublicId: { type: String }
  },
  { _id: false }
)

/**
 * A Document is a saved Parts Quotation / Inspection project. Totals are not
 * stored — they're derived from parts at read/render time so they can't drift.
 */
const documentSchema = new Schema(
  {
    // Owning user — every document is private to its creator.
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    carName: { type: String, required: true, trim: true },
    carNumber: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    parts: { type: [partSchema], default: [] }
  },
  {
    timestamps: true,
    // Expose `id`, hide `_id`/`__v` so the API returns clean JSON.
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

export const DocumentModel = mongoose.model('Document', documentSchema)
