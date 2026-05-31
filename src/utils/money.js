import { config } from '../config/env.js'

const formatter = new Intl.NumberFormat(config.currencyLocale, {
  style: 'currency',
  currency: config.currency
})

/** Format a numeric amount as a localized currency string. */
export const formatCurrency = (amount) => formatter.format(amount ?? 0)

/** Row total = quantity × price. */
export const rowTotal = (part) => part.quantity * part.price

/**
 * Derive presentation-ready totals from a validated parts list without
 * mutating the input. Returns per-row totals plus grand total and item count.
 */
export const summarize = (parts) => {
  const rows = parts.map((part) => ({
    ...part,
    total: rowTotal(part)
  }))

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)

  return {
    rows,
    grandTotal,
    itemCount: rows.length
  }
}
