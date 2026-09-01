/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site (faq-page template) site-wide cleanup.
 *
 * Removes non-authorable site chrome and framework attributes so the import
 * contains only page-level authorable content. Mirrors
 * wknd-trendsetters-cleanup.js — same site shell.
 *
 * All selectors verified against migration-work/faq-page/cleaned.html:
 *  - div.navbar ..................... top navigation bar / mega-menu chrome
 *  - a.skip-link .................... "Skip to main content" accessibility link
 *  - button.nav-mobile-menu-button .. mobile hamburger toggle
 *  - footer.footer .................. site footer (footer.footer.inverse-footer)
 *  - data-astro-cid-* ............... Astro framework scoping attributes —
 *                                     non-authorable build artifacts.
 *
 * NOTE: bare `header` / `nav` are intentionally NOT removed. The hero lives in
 * `#main-content > header.section.secondary-section` (authorable) and the only
 * `<nav>` elements are inside the removed navbar/footer, so targeting specific
 * chrome wrappers avoids deleting authorable content.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Site chrome that could interfere with block parsing/matching.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'button.nav-mobile-menu-button',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remaining non-authorable chrome.
    WebImporter.DOMUtils.remove(element, [
      'div.navbar',
      'footer.footer',
    ]);

    // Strip Astro framework scoping attributes from every element.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-astro-cid')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
