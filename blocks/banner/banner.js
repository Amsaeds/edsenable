/*
 * Banner block
 * Authored content: one cell with an image, one cell with title text.
 * These can be authored as two rows (one column each) OR as a single
 * row with two columns — this decorate function doesn't assume a
 * fixed shape, it just looks for a <picture> cell and a text cell
 * anywhere inside the block.
 *
 * Renders the image and title inside a wrapper that carries the
 * block's default (blue) look via CSS. No inline styles are set here,
 * so the visual theme lives entirely in banner.css and can be
 * overridden per-page/section if needed.
 */

export default function decorate(block) {
  let picture;
  let titleText = '';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !picture) {
        picture = pic;
      } else {
        const text = cell.textContent.trim();
        if (text && !titleText) {
          titleText = text;
        }
      }
    });
  });

  // Clear the original authored markup
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'banner-wrapper';

  if (picture) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'banner-image';
    imageDiv.append(picture);
    wrapper.append(imageDiv);
  }

  const titleDiv = document.createElement('div');
  titleDiv.className = 'banner-title';

  const heading = document.createElement('h2');
  // use textContent, never innerHTML, since this is user-authored text
  heading.textContent = titleText;
  titleDiv.append(heading);

  wrapper.append(titleDiv);
  block.append(wrapper);
}
