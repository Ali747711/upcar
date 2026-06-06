import { formatCurrency } from "../utils/money.js";

/** Escape user-provided text so it can't break out of the HTML context. */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

const checkbox = (checked) => (checked ? "&#9745;" : "&#9744;"); // ☑ / ☐

// Page 1 has the header, the last page has the footer — both need space
// reserved. Only "middle" pages (2 to n-1) can use the full 10 per column.
const ROWS_PER_COLUMN_EDGE   = 9;   // first page (header) and last page (footer)
const ROWS_PER_COLUMN_MIDDLE = 10;  // interior pages — no header, no footer

const EDGE_MAX   = ROWS_PER_COLUMN_EDGE   * 2;  // 18
const MIDDLE_MAX = ROWS_PER_COLUMN_MIDDLE * 2;  // 20

/**
 * Split rows into pages:
 *   page 1          → up to 18 rows  (header eats space)
 *   pages 2 … n-1   → up to 20 rows  (full page)
 *   last page       → up to 18 rows  (footer eats space)
 *
 * If the natural last chunk has 19-20 rows, the excess is split off onto a
 * new page so the footer always fits alongside the final rows.
 */
const chunkPages = (items) => {
  if (items.length === 0) return [];

  const pages = [];

  // First page
  pages.push(items.slice(0, EDGE_MAX));

  // Fill remaining rows in 20-row chunks
  for (let i = EDGE_MAX; i < items.length; i += MIDDLE_MAX) {
    pages.push(items.slice(i, i + MIDDLE_MAX));
  }

  // If the last page (other than the only page) is too full to also fit the
  // footer, split the overflow onto a fresh page that becomes the footer page.
  if (pages.length > 1 && pages[pages.length - 1].length > EDGE_MAX) {
    const last = pages.pop();
    pages.push(last.slice(0, EDGE_MAX));
    pages.push(last.slice(EDGE_MAX));
  }

  return pages;
};

const imageCell = (imageUrl) => {
  if (!imageUrl) {
    return '<span class="doc__entry-img doc__entry-img--empty">No image</span>';
  }
  // onerror swaps a broken/missing image for the placeholder so a bad URL
  // never leaves an empty cell or breaks layout.
  return `<img class="doc__entry-img" src="${escapeHtml(imageUrl)}" alt="Part image"
    onerror="this.outerHTML='<span class=\'doc__entry-img doc__entry-img--empty\'>No image</span>'" />`;
};

const renderEntry = (row) => `
  <div class="doc__entry">
    <span class="doc__entry-check">${checkbox(row.checked)}</span>
    ${imageCell(row.imageUrl)}
    <div class="doc__entry-info">
      <div class="doc__entry-code">${escapeHtml(row.partCode)}</div>
      <div class="doc__entry-nums">${row.quantity} &times; ${formatCurrency(
        row.price,
      )} = <span class="doc__entry-total">${formatCurrency(row.total)}</span></div>
    </div>
  </div>`;

const renderPage = (page, rowsPerColumn, footer = "") => `
  <section class="doc__page">
    <div class="doc__columns">
      <div class="doc__column">${page
        .slice(0, rowsPerColumn)
        .map(renderEntry)
        .join("")}</div>
      <div class="doc__divider"></div>
      <div class="doc__column">${page
        .slice(rowsPerColumn)
        .map(renderEntry)
        .join("")}</div>
    </div>
    ${footer}
  </section>`;

/**
 * Build the full HTML document for a Parts Inspection / Quotation Sheet.
 * Parts flow into two columns of up to 10 rows per page, divided by a vertical
 * line, with large images. This layout/CSS is kept in sync with the frontend
 * preview (src/components/document/*) so preview === PDF.
 *
 * @param {object} params
 * @param {string} params.carName
 * @param {string} params.carNumber
 * @param {string} [params.notes]
 * @param {Array<object>} params.rows   parts with computed row totals
 * @param {number} params.grandTotal
 * @param {number} params.itemCount
 * @param {Date}   [params.date]
 */
export const buildHtml = ({
  carName,
  carNumber,
  notes,
  rows,
  grandTotal,
  itemCount,
  date = new Date(),
}) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Parts Quotation - ${escapeHtml(carName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+KR:wght@400;600;700&display=swap"
  rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }

  .doc {
    --doc-border: #cfcfcf;
    --doc-ink: #171717;
    --doc-muted: #525252;

    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 14mm 12mm;
    background: #ffffff;
    color: var(--doc-ink);
    font-family: 'Noto Sans KR', 'Noto Sans', Arial, sans-serif;
    font-size: 11px;
    line-height: 1.4;
  }

  .doc__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 12px;
    margin-bottom: 14px;
    border-bottom: 2px solid var(--doc-ink);
  }
  .doc__title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
  .doc__subtitle { margin: 2px 0 0; font-size: 12px; color: var(--doc-muted); }
  .doc__meta { text-align: right; font-size: 11px; color: var(--doc-muted); white-space: nowrap; }
  .doc__meta-label { font-weight: 600; color: var(--doc-ink); }

  .doc__page + .doc__page { break-before: page; page-break-before: always; padding-top: 10mm; }

  .doc__columns {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
  }
  .doc__divider { background: var(--doc-border); }
  .doc__column { display: flex; flex-direction: column; }

  .doc__entry {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .doc__entry:last-child { border-bottom: 0; }

  .doc__entry-check { 
    flex-shrink: 0; 
    width: 40px; 
    text-align: center; 
    font-size: 28px; 
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .doc__entry-img {
    flex-shrink: 0;
    width: 150px;
    height: 90px;
    object-fit: cover;
    border: 1px solid var(--doc-border);
    border-radius: 4px;
  }
  .doc__entry-img--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-style: dashed;
    font-size: 9px;
    color: var(--doc-muted);
  }

  .doc__entry-info { min-width: 0; flex: 1; }
  .doc__entry-code { font-weight: 700; font-size: 13px; word-break: break-all; }
  .doc__entry-nums { margin-top: 4px; font-size: 11px; color: var(--doc-muted); }
  .doc__entry-total { font-weight: 700; color: var(--doc-ink); }

  .doc__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 2px solid var(--doc-ink);
    break-before: avoid;
    page-break-before: avoid;
  }
  .doc__notes { max-width: 60%; }
  .doc__notes .label { font-weight: 600; margin-bottom: 4px; }
  .doc__notes p { margin: 0; color: #333; white-space: pre-wrap; }
  .doc__summary-item { font-size: 11px; color: var(--doc-muted); }
  .doc__grand-total { text-align: right; }
  .doc__grand-total-label { font-size: 11px; color: var(--doc-muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .doc__grand-total-value { font-size: 20px; font-weight: 700; }
</style>
</head>
<body>
  <article class="doc">
    <header class="doc__header">
      <div>
        <div class="doc__title">${escapeHtml(carName)}</div>
        <div class="doc__subtitle">${escapeHtml(carNumber)}</div>
      </div>
      <div class="doc__meta">
        <div><span class="doc__meta-label">Date:</span> ${formatDate(date)}</div>
        <div>Upcar Group</div>
      </div>
    </header>

    ${(() => {
      const pages = chunkPages(rows);
      const footerHtml = `
    <footer class="doc__footer">
      ${
        notes
          ? `<div class="doc__notes"><div class="label">Notes</div><p>${escapeHtml(notes)}</p></div>`
          : `<div class="doc__summary-item">Total items: <strong>${itemCount}</strong></div>`
      }
      <div class="doc__grand-total">
        <div class="doc__grand-total-label">Grand Total</div>
        <div class="doc__grand-total-value">${formatCurrency(grandTotal)}</div>
      </div>
    </footer>`;
      return pages
        .map((page, i) => {
          // First and last pages use the smaller column count (header / footer).
          // Every page in between gets the full 10.
          const rowsPerColumn =
            i === 0 || i === pages.length - 1
              ? ROWS_PER_COLUMN_EDGE
              : ROWS_PER_COLUMN_MIDDLE;
          const footer = i === pages.length - 1 ? footerHtml : "";
          return renderPage(page, rowsPerColumn, footer);
        })
        .join("");
    })()}
  </article>
</body>
</html>`;
