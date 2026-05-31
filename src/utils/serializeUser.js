/**
 * Map a lean User object to the clean API shape: stringified `id`, never any
 * password hash or Mongoose internals.
 */
export const serializeUser = (user) => {
  if (!user) return user
  const { _id, __v, passwordHash, id, ...rest } = user
  return { id: String(id ?? _id), ...rest }
}
