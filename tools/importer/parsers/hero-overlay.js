/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay. Base block: hero.
 * Source: https://wknd-trendsetters.site/ (landing-page closing CTA banner)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: title (heading) + subheading + CTA
 *
 * Source structure: a full-bleed background image (`img.cover-image.utility-overlay`)
 * behind a `.card-body` overlay holding the heading, subheading and a single CTA
 * button. We put the background image in row 2 and the overlay text/CTA in row 3.
 */
export default function parse(element, { document }) {
  // Background image (full-bleed) — the overlay cover image
  const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img[class*="cover"], img');

  // Overlay text content
  const content = element.querySelector('.card-body') || element;
  const heading = content.querySelector('h1, h2, h3, [class*="heading"]');
  const subheading = content.querySelector('p.subheading, p[class*="subheading"], p');
  const ctaLinks = Array.from(content.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image — optional
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: overlay text content (heading + subheading + CTA) in a single cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
