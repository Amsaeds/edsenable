import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { getPlaceholdersPrefix } from '../../scripts/scripts.js';

const PAGE_SIZE = 10;
const COLUMNS = ['Name', 'Department', 'Experience', 'City'];
const DEFAULT_SOURCE = '/employees.json';

/**
 * Reads the source JSON path authored in the block (an authored link),
 * falling back to a default path if none was provided.
 * @param {HTMLElement} block
 * @returns {string}
 */
function getSourcePath(block) {
  const link = block.querySelector('a[href]');
  if (link) {
    try {
      return new URL(link.href).pathname;
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_SOURCE;
}

/**
 * Builds one table row for an employee record.
 * @param {object} employee
 * @returns {HTMLTableRowElement}
 */
function renderRow(employee) {
  const row = document.createElement('tr');
  COLUMNS.forEach((key) => {
    const cell = document.createElement('td');
    cell.textContent = employee[key] ?? '';
    row.append(cell);
  });
  return row;
}

/**
 * Fetches one page of employees from the published sheet using
 * the sheet API's built-in limit/offset pagination.
 * @param {string} sourcePath
 * @param {number} offset
 * @returns {Promise<Array<object>>}
 */
async function fetchPage(sourcePath, offset) {
  const url = `${sourcePath}?limit=${PAGE_SIZE}&offset=${offset}`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const json = await resp.json();
  return Array.isArray(json.data) ? json.data : [];
}

export default async function decorate(block) {
  const sourcePath = getSourcePath(block);

  block.textContent = '';

  const table = document.createElement('table');
  table.className = 'employee-list-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  COLUMNS.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.append(th);
  });
  thead.append(headRow);

  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const loadMoreWrapper = document.createElement('div');
  loadMoreWrapper.className = 'employee-list-load-more-wrapper';
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.type = 'button';
  loadMoreBtn.className = 'employee-list-load-more';
  loadMoreWrapper.append(loadMoreBtn);

  block.append(table, loadMoreWrapper);

  // label for the button comes from the placeholders sheet (key: "Load more")
  const placeholders = await fetchPlaceholders(getPlaceholdersPrefix());
  loadMoreBtn.textContent = placeholders.loadMore || 'Load more';

  let offset = 0;
  let loading = false;

  async function loadNextPage() {
    if (loading) return;
    loading = true;
    loadMoreBtn.disabled = true;

    const rows = await fetchPage(sourcePath, offset);
    rows.forEach((employee) => tbody.append(renderRow(employee)));
    offset += rows.length;

    if (rows.length < PAGE_SIZE) {
      // no more rows to load
      loadMoreWrapper.remove();
    } else {
      loadMoreBtn.disabled = false;
    }

    loading = false;
  }

  loadMoreBtn.addEventListener('click', loadNextPage);

  // render the first page immediately
  await loadNextPage();
}