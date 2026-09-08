/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base block: cards.
 * Source: https://wknd-trendsetters.site/ (landing-page "Latest articles")
 * Generated for the excat import infrastructure.
 *
 * Library structure (Cards): first row = block name; each subsequent row is one card
 * with 2 cells: [image, text content]. Text cell may hold title, description and a CTA.
 *
 * Source structure: each card is an `<a class="article-card card-link">` wrapping an
 * `.article-card-image` (image) and an `.article-card-body` (meta tag + date + heading).
 * We place the image in cell 1 and the meta/heading plus a linked CTA in cell 2 so the
 * article link is preserved.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll(':scope > a.article-card, :scope > a.card-link, :scope > a'));

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    const href = card.getAttribute('href');

    // Image cell
    const imageCell = [];
    const img = card.querySelector('img');
    if (img) imageCell.push(img);

    // Text cell: meta (tag + date) + heading. To preserve the article link
    // without duplicating text, wrap the heading's text in an anchor.
    const textCell = [];
    const meta = card.querySelector('.article-card-meta');
    if (meta) textCell.push(...meta.childNodes);
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="heading"]');
    if (heading) {
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = heading.textContent.trim();
        heading.textContent = '';
        heading.append(link);
      }
      textCell.push(heading);
    } else if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = 'Read more';
      textCell.push(cta);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
