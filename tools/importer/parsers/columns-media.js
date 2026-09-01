/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base block: columns.
 * Source: https://wknd-trendsetters.site/ (landing-page featured header)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Columns): first row = block name; second row defines the
 * column count; subsequent rows must match that column count.
 *
 * Source variation handled: this instance is a 2-column media/text split — a
 * cover image in the left column and (breadcrumbs + heading + byline/meta) in
 * the right column. We emit a single content row with those two cells.
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
    // Left column: media (image). Right column: text content (breadcrumbs, heading, meta).
    const leftCell = [];
    const img = columns[0].querySelector('img');
    if (img) leftCell.push(img);
    else leftCell.push(...columns[0].childNodes);

    const rightCell = [];
    rightCell.push(...columns[1].childNodes);

    cells.push([leftCell, rightCell]);
  } else {
    // Single column fallback — keep as one cell in a single-column row
    const only = [];
    only.push(...columns[0].childNodes);
    cells.push([only]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
