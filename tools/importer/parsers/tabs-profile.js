/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-profile. Base block: tabs.
 * Source: https://wknd-trendsetters.site/ (landing-page testimonial tabs)
 * Generated for the excat import infrastructure.
 *
 * Library structure (Tabs): first row = block name; each subsequent row is one tab
 * as 2 cells: [tab label, tab content].
 *
 * Source structure: a `.tabs-wrapper` holds `.tabs-content` (the panels, one
 * `.tab-pane` per tab) and a `.tab-menu` (the clickable buttons carrying the tab
 * label + avatar). We pair each menu button (label) with its matching content pane
 * by index.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane, .tab-pane'));
  const buttons = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link, .tab-menu button'));

  // Empty-block guard
  if (panes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    // Label: prefer the matching menu button's inner content; fall back to a
    // derived label from the pane if no button exists.
    let labelCell;
    const button = buttons[i];
    if (button) {
      labelCell = Array.from(button.childNodes);
    } else {
      const strong = pane.querySelector('strong');
      labelCell = strong ? [strong.cloneNode(true)] : [document.createTextNode(`Tab ${i + 1}`)];
    }

    // Content: the pane's inner content
    const contentCell = Array.from(pane.childNodes);

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-profile', cells });
  element.replaceWith(block);
}
