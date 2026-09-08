/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gallery. Base block: cards.
 * Source: https://wknd-trendsetters.site/ (landing-page "Style in every snapshot" gallery)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Cards): first row = block name; each subsequent row is one card.
 * This instance is an image-only gallery ("no images" is the opposite case — here every
 * card IS just an image). Each grid item holds a single cover image, so each card row
 * contains one cell with that image.
 */
export default function parse(element, { document }) {
  // Each direct child div is one gallery cell holding an image
  const items = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (img) {
      cells.push([img]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
