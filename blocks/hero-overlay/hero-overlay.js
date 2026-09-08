/*
 * Hero (overlay) block
 * A dark, full-bleed call-to-action hero: a background image tinted into
 * a dark panel, with a heading, paragraph, and CTA overlaid on top.
 * Authored as two rows:
 *   row 1 — the background image (<picture>)
 *   row 2 — the text (heading, paragraph, CTA link)
 *
 * The image is moved into a background layer and the text into a
 * foreground layer so CSS can stack them. The CTA becomes a pill button.
 */

export default function decorate(block) {
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const textRow = rows.find((row) => row !== imageRow);

  block.textContent = '';

  const bg = document.createElement('div');
  bg.className = 'hero-overlay-bg';
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    if (picture) bg.append(picture);
    else {
      const img = imageRow.querySelector('img');
      if (img) bg.append(img);
    }
  }

  const content = document.createElement('div');
  content.className = 'hero-overlay-content';
  if (textRow) {
    const cell = textRow.querySelector(':scope > div') || textRow;
    [...cell.childNodes].forEach((node) => content.append(node));

    // style the CTA as a pill button
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const p = cta.closest('p');
      if (p) p.classList.add('button-wrapper');
    }
  }

  block.append(bg, content);
}
