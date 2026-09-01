/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site site-wide cleanup (blog-article template).
 *
 * Removes non-authorable site chrome and framework attributes so the import
 * contains only page-level authorable content. Mirrors the chrome removed by
 * wknd-trendsetters-cleanup.js (landing-page) — the site shell is identical
 * across templates.
 *
 * All selectors verified against migration-work/blog-article/cleaned.html:
 *  - a.skip-link ..................... "Skip to main content" link (line 1)
 *  - div.navbar ...................... top navigation bar / mega-menu chrome (line 1)
 *  - button.nav-mobile-menu-button ... mobile hamburger toggle (line 47)
 *  - footer.footer ................... site footer with social + link columns (line 136)
 *  - data-astro-cid-* ................ Astro framework scoping attributes
 *                                      (e.g. body, breadcrumb svgs) — build artifacts.
 *
 * NOTE: bare `header` / `nav` are intentionally NOT removed. The only `<nav>`
 * elements are inside the removed navbar/footer, and article content lives in
 * `#main-content > section.section`, so targeting the specific chrome wrappers
 * avoids deleting authorable content.
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

    // The article body contains a plain data table (<thead> "Spec | Detail").
    // Left as-is, md2da turns any HTML <table> into a block named after its first
    // cell ("Spec") — a block this project doesn't have, so it fails to load at
    // runtime. This is authored default content, not a block: convert each row
    // into a "<strong>label</strong>: value" paragraph so it round-trips as
    // ordinary rich text and renders without a block decorator.
    element.querySelectorAll('table').forEach((table) => {
      const doc = table.ownerDocument;
      const frag = doc.createDocumentFragment();
      const bodyRows = table.querySelectorAll('tbody tr');
      const rows = bodyRows.length ? bodyRows : table.querySelectorAll('tr');
      rows.forEach((tr) => {
        const cellNodes = tr.querySelectorAll('td, th');
        if (!cellNodes.length) return;
        // Skip a header row (th-only) — it just labels the columns.
        if (tr.querySelector('th') && !tr.querySelector('td')) return;
        const cells = [...cellNodes];
        const p = doc.createElement('p');
        const label = cells[0] ? cells[0].textContent.trim() : '';
        const value = cells.slice(1).map((c) => c.textContent.trim()).filter(Boolean).join(' — ');
        if (label) {
          const strong = doc.createElement('strong');
          strong.textContent = label;
          p.append(strong);
        }
        if (value) {
          p.append(doc.createTextNode(`${label ? ': ' : ''}${value}`));
        }
        if (p.childNodes.length) frag.append(p);
      });
      if (frag.childNodes.length) {
        table.replaceWith(frag);
      }
    });
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
