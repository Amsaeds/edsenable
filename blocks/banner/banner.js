/*
 * Banner block
 * Authored content shape (two rows):
 *   Row 1: image
 *   Row 2: title text
 * Renders the image and title inside a wrapper that carries the
 * block's default (blue) look via CSS. No inline styles are set here,
 * so the visual theme lives entirely in banner.css and can be
 * overridden per-page/section if needed.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [imageRow, titleRow] = rows;

  const picture = imageRow?.querySelector('picture');
  const titleText = titleRow?.textContent?.trim() || '';

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