/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-light. Base block: hero.
 * Source: https://wknd-trendsetters.site/ (landing-page top hero)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: background/hero image(s) (optional)
 *   Row 3: title (heading) + subheading + CTA buttons
 *
 * Source variation handled: hero-light is a light, side-by-side hero where the
 * text column holds the heading/subheading/CTAs and a second column holds one or
 * more cover images. We place all images in row 2 and the text content in row 3.
 */
export default function parse(element, { document }) {
  // Text column: the grid child that contains the heading
  const heading = element.querySelector('h1, h2, [class*="heading"]');
  // Capture ALL body paragraphs in the hero (some heroes have a subheading plus a
  // supporting paragraph). Grabbing only the first dropped the 2nd hero paragraph.
  const paragraphs = Array.from(element.querySelectorAll('p'));
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Image column: all cover/hero images (exclude inline SVG/icon data-URIs are still <img>,
  // but the hero image column uses .cover-image which is what we want)
  const images = Array.from(element.querySelectorAll('img.cover-image, img[class*="cover"]'));

  // Empty-block guard
  if (!heading && paragraphs.length === 0 && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image(s) — optional
  if (images.length > 0) {
    cells.push([images]);
  }

  // Row 3: text content (heading + all paragraphs + CTAs) in a single cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-light', cells });
  element.replaceWith(block);
}
