/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-trend. Base block: cards.
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport ("Trend alert" grid)
 * Generated for the excat import infrastructure.
 *
 * Library convention (Cards): 2 columns, multiple rows. First row = block name only.
 * Each subsequent row is one card with 2 cells:
 *   cell 1 (mandatory) = image/icon
 *   cell 2 (mandatory) = text content: title (heading), description, optional CTA.
 *
 * Source structure: each card is an `<a class="trend-card card-link" href="...">` wrapping a
 * `.trend-card-image` (image) and a `.trend-card-body` (span.tag + h3 heading + p description).
 * We place the image in cell 1 and the tag + linked heading + description in cell 2 so both
 * the trend link and all text are preserved.
 */
export default function parse(element, { document }) {
  // The import script's onLoad hook unwraps each card <a> into a <div> (with the
  // link preserved on data-href) before html2md runs, so the primary match is
  // div.trend-card. Fall back to the raw <a> forms so the standalone parser
  // validator (which runs against the un-preprocessed page) still works.
  let cards = Array.from(element.querySelectorAll(':scope > div.trend-card, :scope > a.trend-card, :scope > a.card-link'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll(':scope > a, :scope > div'));
  }

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    const href = card.getAttribute('data-href') || card.getAttribute('href');

    // Cell 1: image — clone so the source anchor can be freely detached without
    // the importer's later passes re-touching a shared/moved live node.
    const imageCell = [];
    const img = card.querySelector('img');
    if (img) imageCell.push(img.cloneNode(true));

    // Cell 2: text content, built fresh (tag + linked heading + description).
    // Build brand-new elements per card so no two rows ever share a node
    // reference — identical hrefs across all 8 cards otherwise let the
    // html->md conversion collapse repeated rows down to one.
    const textCell = [];

    // Order the text cell as paragraphs-then-heading (tag + description as <p>,
    // title as the final <h3>). A trailing block-level <p> AFTER an <h3> inside a
    // cards cell makes the html->md->md2da round-trip drop every card row past the
    // first; leading with the paragraphs and ending on the heading mirrors the
    // cards-article layout that round-trips cleanly.
    // Mirror the cards-article cell shape that round-trips cleanly through
    // html2md -> md2da: exactly TWO block elements per cell — a single meta
    // paragraph (tag + description) followed by the title heading. Three or more
    // block elements per cell make md2da's gridtable parser drop every card row
    // past the first on this grid.
    const tag = card.querySelector('.tag');
    const tagText = tag ? tag.textContent.trim() : '';
    const description = card.querySelector('.trend-card-body p, p.paragraph-sm, p');
    const descText = description ? description.textContent.trim() : '';
    const metaText = [tagText, descText].filter(Boolean).join(' — ');
    if (metaText) {
      const metaEl = document.createElement('p');
      metaEl.textContent = metaText;
      textCell.push(metaEl);
    }

    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="heading"]');
    const headingText = heading ? heading.textContent.trim() : '';
    if (headingText) {
      const h = document.createElement('h3');
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = headingText;
        h.append(link);
      } else {
        h.textContent = headingText;
      }
      textCell.push(h);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-trend', cells });
  element.replaceWith(block);
}
