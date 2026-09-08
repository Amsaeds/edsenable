/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base block: accordion.
 * Source: https://wknd-trendsetters.site/ (landing-page FAQ)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Accordion): first row = block name; each subsequent row is one
 * item as 2 cells: [title, content].
 *
 * Source structure: a `.faq-list` containing `<details class="faq-item">` elements,
 * each with a `<summary class="faq-question">` (holds a <span> question + an icon)
 * and a `.faq-answer` content div. We extract the question text into the title cell
 * and the answer into the content cell, dropping the toggle icon.
 *
 * Note: the page-templates.json selector was corrected to target `.faq-list`
 * (container only) since this source uses native <details>/<summary> FAQ markup
 * rather than an `.accordion`.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('details.faq-item, details, .faq-item'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Title: the question text (span inside summary), excluding the toggle icon
    const summary = item.querySelector('summary, .faq-question');
    let titleCell;
    if (summary) {
      const questionSpan = summary.querySelector('span');
      titleCell = questionSpan
        ? [questionSpan]
        : Array.from(summary.childNodes).filter((n) => n.nodeName !== 'IMG');
    } else {
      titleCell = [document.createTextNode('')];
    }

    // Content: the answer body
    const answer = item.querySelector('.faq-answer');
    const contentCell = answer
      ? Array.from(answer.childNodes)
      : Array.from(item.childNodes).filter((n) => n !== summary);

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
