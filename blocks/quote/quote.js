/*
 * Quote block
 * Authored content: one cell with the quotation text, and (optionally) a
 * second cell/row with the attribution (person, title, source).
 *
 * Renders a semantic <blockquote> with the quote and an optional
 * <figcaption> for attribution. No inline styles are set here — the
 * visual theme lives entirely in quote.css and uses the site's design
 * tokens so it can be restyled per-section if needed.
 */

export default function decorate(block) {
  const rows = [...block.children];

  // First cell holds the quote text, an optional second cell holds attribution.
  const quoteCell = rows[0]?.querySelector('div') || rows[0];
  const attributionCell = rows[1]?.querySelector('div') || rows[1];

  block.textContent = '';

  const figure = document.createElement('figure');
  figure.className = 'quote-figure';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-text';
  if (quoteCell) {
    // move over authored nodes (may include multiple paragraphs)
    [...quoteCell.childNodes].forEach((node) => blockquote.append(node));
  }
  figure.append(blockquote);

  const attributionText = attributionCell ? attributionCell.textContent.trim() : '';
  if (attributionText) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'quote-attribution';
    // use textContent, never innerHTML, since this is user-authored text
    figcaption.textContent = attributionText;
    figure.append(figcaption);
  }

  block.append(figure);
}
