import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Testimonials block
 * Authored content: one row per testimonial. Each row has three cells:
 *   1. avatar image (a <picture>)
 *   2. the quote text
 *   3. the person's name (and optional title/role on a second line)
 *
 * Any cell may be omitted by an author; the block degrades gracefully.
 * Renders each testimonial as a <figure> with a semantic <blockquote>
 * and a <figcaption> for the name. Styling lives in testimonials.css
 * and uses the site's design tokens.
 */

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'testimonials-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // an image may be delivered as a <picture> or a bare <img>
    const image = row.querySelector('picture, img');

    // the quote/name are the text cells that don't hold the image
    const textCells = cells.filter((cell) => !cell.querySelector('picture, img'));
    const quoteCell = textCells[0];
    const nameCell = textCells[1];

    const item = document.createElement('li');
    item.className = 'testimonials-item';

    const figure = document.createElement('figure');
    figure.className = 'testimonials-figure';

    if (image) {
      const avatar = document.createElement('div');
      avatar.className = 'testimonials-avatar';
      const img = image.tagName === 'IMG' ? image : image.querySelector('img');
      if (img) {
        avatar.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
      } else {
        avatar.append(image);
      }
      figure.append(avatar);
    }

    if (quoteCell) {
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'testimonials-quote';
      [...quoteCell.childNodes].forEach((node) => blockquote.append(node));
      figure.append(blockquote);
    }

    const nameText = nameCell ? nameCell.textContent.trim() : '';
    if (nameText) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'testimonials-name';
      // preserve authored line breaks (e.g. name + role) as separate lines
      [...nameCell.childNodes].forEach((node) => figcaption.append(node));
      figure.append(figcaption);
    }

    item.append(figure);
    list.append(item);
  });

  block.replaceChildren(list);
}
