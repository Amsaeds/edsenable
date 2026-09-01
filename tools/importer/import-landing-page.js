/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLightParser from './parsers/hero-light.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsGalleryParser from './parsers/cards-gallery.js';
import tabsProfileParser from './parsers/tabs-profile.js';
import cardsArticleParser from './parsers/cards-article.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroOverlayParser from './parsers/hero-overlay.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-light': heroLightParser,
  'columns-media': columnsMediaParser,
  'cards-gallery': cardsGalleryParser,
  'tabs-profile': tabsProfileParser,
  'cards-article': cardsArticleParser,
  'accordion-faq': accordionFaqParser,
  'hero-overlay': heroOverlayParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing layout: hero banner followed by multiple stacked content and feature sections',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'hero-light', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'columns-media', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout'] },
    { name: 'cards-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column'] },
    { name: 'tabs-profile', instances: ['#main-content > section.section:nth-of-type(3) .tabs-wrapper'] },
    { name: 'cards-article', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5) .faq-list, #main-content > section.section:nth-of-type(5) .accordion'] },
    { name: 'hero-overlay', instances: ['#main-content > section.section.inverse-section .card, #main-content > section.section.inverse-section > div'] },
  ],
  // Section metadata is applied by the sections transformer (embeds DOM-verified defs).
  sections: [
    { id: 'rc1', name: 'Hero intro', style: 'secondary' },
    { id: 'rc3', name: 'Gallery', style: 'secondary' },
    { id: 'rc5', name: 'Articles', style: 'secondary' },
  ],
};

// TRANSFORMER REGISTRY (cleanup first, then section boundaries/metadata)
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
