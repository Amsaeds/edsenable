import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_INDEX = '/query-index.json';
const PAGE_SIZE = 500; // query-index.json pages in chunks of up to 500 rows

/**
 * Fetches every row of an AEM index sheet (e.g. query-index.json), paging
 * through the results if the sheet is larger than one page.
 * @param {string} path path to the index, e.g. /query-index.json or /blog/query-index.json
 * @returns {Promise<object[]>} the full list of row objects
 */
async function fetchIndex(path) {
  const results = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = new URL(path, window.location.origin);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', PAGE_SIZE);

    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${url.pathname}${url.search}`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    if (!Array.isArray(json.data)) break;

    results.push(...json.data);
    total = json.total ?? results.length;
    offset += json.limit || PAGE_SIZE;
  }

  return results;
}

/**
 * Reads simple two-column config rows authored inside the block, e.g.
 *   | Path   | /blog/query-index.json |
 *   | Limit  | 6                      |
 *   | Filter | /blog/                 |
 *   | Sort   | lastModified-desc      |
 * then removes those rows from the DOM once read.
 * @param {HTMLElement} block
 * @returns {Record<string, string>}
 */
function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key) config[key] = value;
    }
    row.remove();
  });
  return config;
}

/**
 * Sorts entries by a "<field>-asc" or "<field>-desc" spec, e.g. "lastModified-desc".
 */
function sortEntries(entries, sort) {
  if (!sort) return entries;
  const [field, dir] = sort.split('-');
  const factor = dir === 'desc' ? -1 : 1;
  return [...entries].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

function buildCard(entry) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.href = entry.path;
  link.setAttribute('aria-label', entry.title || entry.path);

  if (entry.image) {
    const picture = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '400' }]);
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-list-card-image';
    imageWrapper.append(picture);
    link.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  if (entry.title) {
    const title = document.createElement('h3');
    title.textContent = entry.title;
    body.append(title);
  }

  if (entry.description) {
    const desc = document.createElement('p');
    desc.textContent = entry.description;
    body.append(desc);
  }

  if (entry.lastModified) {
    const ts = Number(entry.lastModified) * 1000;
    if (!Number.isNaN(ts)) {
      const date = document.createElement('p');
      date.className = 'article-list-card-date';
      date.textContent = new Date(ts).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      body.append(date);
    }
  }

  link.append(body);
  li.append(link);
  return li;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const indexPath = config.path || DEFAULT_INDEX;
  const limit = config.limit ? parseInt(config.limit, 10) : undefined;
  const { filter } = config;
  const sort = config.sort || 'lastModified-desc';

  block.textContent = '';
  block.classList.add('article-list-loading');

  let entries = [];
  try {
    entries = await fetchIndex(indexPath);
  } catch (error) {
    // fall through to the empty state below
  }

  if (filter) {
    entries = entries.filter((entry) => entry.path && entry.path.includes(filter));
  }

  entries = sortEntries(entries, sort);

  if (limit) entries = entries.slice(0, limit);

  block.classList.remove('article-list-loading');

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'article-list-empty';
    empty.textContent = 'No articles found.';
    block.append(empty);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'article-list-grid';
  entries.forEach((entry) => ul.append(buildCard(entry)));
  block.append(ul);
}