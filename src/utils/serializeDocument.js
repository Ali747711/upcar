import { summarize } from './money.js'

/**
 * Map a stored document (lean Mongoose object) to the clean API shape:
 * stringified `id`, no `_id`/`__v`, with derived totals attached so clients
 * don't recompute them.
 */
export const serializeDocument = (doc) => {
  if (!doc) return doc

  const { _id, __v, id, owner, parts = [], ...rest } = doc
  const { grandTotal, itemCount } = summarize(parts)

  return {
    id: String(id ?? _id),
    ...rest,
    parts,
    totals: { itemCount, grandTotal }
  }
}
