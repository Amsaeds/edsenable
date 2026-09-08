/*
 * Hero (light) block
 * A light banner with a text column (heading, intro, CTAs) alongside a
 * cluster of images. Authored as two rows:
 *   row 1 — a group of images (<picture> elements)
 *   row 2 — the text (heading, paragraph, and CTA links)
 *
 * The decoration tags each part so the layout (text beside images on
 * desktop, stacked on mobile) can be handled entirely in CSS. The CTA
 * links are styled as buttons via the global button classes.
 */

export default function decorate(block) {
  const rows = [...block.children];

  // the images row is whichever row contains pictures; the other is text
  const imagesRow = rows.find((row) => row.querySelector('picture, img'));
  const textRow = rows.find((row) => row !== imagesRow);

  if (imagesRow) {
    imagesRow.className = 'hero-light-media';
    // unwrap the single inner cell so the pictures sit directly in the grid
    const cell = imagesRow.querySelector(':scope > div');
    if (cell) {
      [...cell.children].forEach((pic) => imagesRow.append(pic));
      cell.remove();
    }
  }

  if (textRow) {
    textRow.className = 'hero-light-content';
    const cell = textRow.querySelector(':scope > div');
    if (cell) textRow.replaceChildren(...cell.childNodes);

    // style the CTA links as buttons: first = primary, rest = secondary
    const ctas = [...textRow.querySelectorAll('a')];
    ctas.forEach((a, i) => {
      a.classList.add('button', i === 0 ? 'primary' : 'secondary');
      const p = a.closest('p');
      if (p) p.classList.add('button-wrapper');
    });
  }
}
