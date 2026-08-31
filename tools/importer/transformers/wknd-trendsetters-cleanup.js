/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site site-wide cleanup.
 *
 * Removes non-authorable site chrome and framework attributes so the import
 * contains only page-level authorable content.
 *
 * All selectors verified against migration-work/cleaned.html:
 *  - div.navbar ............. top navigation bar / mega-menu chrome (line 1)
 *  - a.skip-link ............ "Skip to main content" accessibility link (line 1)
 *  - button.nav-mobile-menu-button . mobile hamburger toggle (line 47)
 *  - footer.footer .......... site footer with social + link nav columns (line 98)
 *  - data-astro-cid-* ....... Astro framework scoping attributes (e.g. body,
 *                             svg elements) — non-authorable build artifacts.
 *
 * NOTE: bare `header` / `nav` are intentionally NOT removed. The hero lives in
 * `#main-content > header.section.secondary-section` (authorable) and the only
 * `<nav>` elements are inside the removed navbar/footer, so targeting the
 * specific chrome wrappers avoids deleting authorable content.
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
