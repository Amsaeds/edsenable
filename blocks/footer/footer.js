import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // label sections: first = brand + social, rest = link columns
  const sections = footer.querySelectorAll(':scope > div');
  sections.forEach((section, i) => {
    if (i === 0) section.classList.add('footer-brand');
    else section.classList.add('footer-links');
  });

  block.append(footer);
}
