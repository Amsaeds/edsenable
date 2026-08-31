/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site (faq-page template) section boundaries +
 * section metadata.
 *
 * Inserts a section break (<hr>) before each non-first section (3 breaks for 4
 * sections) and a "Section Metadata" block for each styled section.
 *
 * SECTION SOURCE: This project's page-templates.json uses a per-block `section`
 * schema and has no top-level `template.sections` array, so the DOM-verified
 * section boundaries and styles from migration-work/faq-page/page-structure.json
 * are embedded below. If a future page-templates.json populates
 * `payload.template.sections`, that takes precedence.
 *
 * Selectors verified against migration-work/faq-page/cleaned.html
 * (main#main-content children: 1 header + 3 sections):
 *  - rc1 header.secondary-section .. style: secondary
 *  - rc2 section:nth-of-type(1) .... FAQ accordion, default white (no metadata)
 *  - rc3 section.secondary-section . style: secondary
 *  - rc4 section.accent-section .... style: accent
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

const EMBEDDED_SECTIONS = [
  { id: 'rc1', selector: '#main-content > header.section.secondary-section', style: 'secondary' },
  { id: 'rc2', selector: '#main-content > section.section:nth-of-type(1)' },
  { id: 'rc3', selector: '#main-content > section.section.secondary-section', style: 'secondary' },
  { id: 'rc4', selector: '#main-content > section.section.accent-section', style: 'accent' },
];

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections
    && payload.template.sections.length)
    ? payload.template.sections
    : EMBEDDED_SECTIONS;

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    // Reverse order so live element references aren't shifted by earlier inserts.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers may have replaced section elements. Anchor each styled section's
    // Section Metadata block to whichever survives: the marker <hr> or the
    // original element (first section case).
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
