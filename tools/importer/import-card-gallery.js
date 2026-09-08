/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLightParser from './parsers/hero-light.js';
import cardsTrendParser from './parsers/cards-trend.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-card-gallery-cleanup.js';
import sectionsTransformer from './transformers/wknd-card-gallery-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-light': heroLightParser,
  'cards-trend': cardsTrendParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'card-gallery',
  description: 'Gallery layout: hero header, trend-card grid, media columns, and accent CTA band',
  urls: [
    'https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport',
  ],
  blocks: [
    { name: 'hero-light', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'cards-trend', instances: ['#trends .grid-layout.desktop-4-column'] },
    { name: 'columns-media', instances: ['#main-content > section.section.secondary-section .grid-layout'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero header', style: 'secondary' },
    { id: 'rc3', name: 'Explore', style: 'secondary' },
    { id: 'rc4', name: 'CTA band', style: 'accent' },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

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
  // Runs BEFORE html2md preprocesses the DOM. html2md coalesces adjacent
  // sibling <a> elements that share the same href — the 8 trend cards all link
  // to /fashion-trends-young-adults, so all but the first get merged away before
  // any parser runs. Unwrap each card anchor into a <div> (preserving the href
  // on data-href) so there are no sibling links left to coalesce.
  onLoad: ({ document }) => {
    document.querySelectorAll('#trends a.trend-card, #trends a.card-link').forEach((a) => {
      const div = document.createElement('div');
      div.className = a.className;
      const href = a.getAttribute('href');
      if (href) div.setAttribute('data-href', href);
      while (a.firstChild) div.append(a.firstChild);
      a.replaceWith(div);
    });
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
