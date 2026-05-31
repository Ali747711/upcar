import { UserModel } from '../models/User.js'

/**
 * Data access for users. Returns full Mongoose documents where the password
 * hash is needed (login), and lean/sanitized data otherwise.
 */
export const userRepository = {
  /** Find by email including the password hash (for login). Returns a doc or null. */
  async findByEmail(email) {
    return UserModel.findOne({ email })
  },

  /** Find by id without the password hash. Returns a lean object or null. */
  async findById(id) {
    return UserModel.findById(id).select('-passwordHash').lean({ virtuals: true })
  },

  /** Create a user; returns the sanitized JSON (no password hash). */
  async create(data) {
    const created = await UserModel.create(data)
    return created.toJSON()
  }
}
