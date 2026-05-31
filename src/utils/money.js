// Dot as thousands separator, no currency symbol, no trailing decimal zeros.
// e.g. 10000 → "10.000", 1500.5 → "1.500,5", 150 → "150"
const formatter = new Intl.NumberFormat('de-DE', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

/** Format a numeric amount as a plain number (no currency symbol). */
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
