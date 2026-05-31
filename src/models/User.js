import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    // Stored as a bcrypt hash — never the raw password.
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id
        delete ret.passwordHash // never expose the hash
        return ret
      }
    }
  }
)

export const UserModel = mongoose.model('User', userSchema)
