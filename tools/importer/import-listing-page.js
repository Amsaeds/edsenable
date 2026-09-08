/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLightParser from './parsers/hero-light.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsArticleParser from './parsers/cards-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-listing-page-cleanup.js';
import sectionsTransformer from './transformers/wknd-listing-page-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-light': heroLightParser,
  'columns-media': columnsMediaParser,
  'cards-article': cardsArticleParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'listing-page',
  description: 'Index/listing layout: hero header, featured article, article-card grid, and subscribe CTA',
  urls: [
    'https://wknd-trendsetters.site/blog',
  ],
  blocks: [
    { name: 'hero-light', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'columns-media', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout'] },
    { name: 'cards-article', instances: ['#articles .grid-layout.desktop-4-column'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero header', style: 'secondary' },
    { id: 'rc3', name: 'Latest articles', style: 'secondary' },
    { id: 'rc4', name: 'Subscribe', style: 'accent' },
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
