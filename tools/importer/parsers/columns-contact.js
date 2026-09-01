/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base block: columns.
 * Source: https://wknd-trendsetters.site/faq (faq-page "Let's connect" section)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Columns): first row = block name; the first content row
 * defines the column count; subsequent rows must match that column count. Each
 * cell becomes a responsive column when rendered.
 *
 * Source variation handled: this instance is a text-only 2-column split — the
 * left column holds a heading + intro paragraph, and the right column holds a
 * list of labeled contact items (Email / Phone / Address, each a label heading
 * plus a link or paragraph value). No imagery. We emit a single 2-cell content
 * row: [left text column, right contact details], matching the 2-column layout.
 */
export default function parse(element, { document }) {
  // The grid has two direct-child columns
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  // Empty-block guard
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  if (columns.length >= 2) {
    // Left column: heading + intro paragraph.
    const leftCell = [];
    leftCell.push(...columns[0].childNodes);

    // Right column: labeled contact items. Prefer the inner .contact-items
    // wrapper so we keep each label heading + value together; fall back to the
    // column's own children if that wrapper is absent.
    const rightCell = [];
    const contactItems = columns[1].querySelector('.contact-items, [class*="contact"]');
    if (contactItems) {
      rightCell.push(...contactItems.childNodes);
    } else {
      rightCell.push(...columns[1].childNodes);
    }

    cells.push([leftCell, rightCell]);
  } else {
    // Single-column fallback — keep everything in one cell in a single-column row
    const only = [];
    only.push(...columns[0].childNodes);
    cells.push([only]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
