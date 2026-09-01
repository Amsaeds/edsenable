import { getLanguage } from './scripts.js';

const LANGUAGES = new Set(['en', 'fr']);

// Get page path without language prefix, always WITHOUT a leading slash
function getPagePathWithoutLanguage() {
  const segments = window.location.pathname.split('/');
  const path = segments.length > 1 && LANGUAGES.has(segments[1])
    ? segments.slice(2).join('/')
    : segments.slice(1).join('/');
  return path; // e.g. "banner", "banniere", or "" for homepage
}

// Fetch language mappings
async function fetchLanguageMappings() {
  // Use centrally loaded placeholders, fallback to fetch if not available
  if (window.placeholders?.['language-switcher']) {
    return window.placeholders['language-switcher'];
  }

  try {
    const response = await fetch('/placeholders.json?sheet=language-switcher');
    const json = response.ok ? await response.json() : {};
    return json.data || [];
  } catch {
    return [];
  }
}

// Find mapped URL for target language
async function findMappedUrl(targetLang) {
  const mappings = await fetchLanguageMappings();
  const currentLang = getLanguage();
  const normalizedPath = getPagePathWithoutLanguage(); // already has no leading slash

  const mapping = mappings.find((item) => {
    const url = item[currentLang];
    if (url === undefined || url === null) return false;
    const normalized = url.startsWith('/') ? url.slice(1) : url;
    return normalized === normalizedPath;
  });

  return mapping?.[targetLang] ?? normalizedPath;
}

// Switch to target language
export async function switchToLanguage(targetLang) {
  if (getLanguage() === targetLang) return;

  try {
    const mappedUrl = await findMappedUrl(targetLang);
    const cleanUrl = mappedUrl && mappedUrl.startsWith('/') ? mappedUrl.slice(1) : mappedUrl;

    // Homepage: / <-> /fr/
    if (!cleanUrl) {
      window.location.href = targetLang === 'fr' ? '/fr/' : '/';
      return;
    }

    // English lives at root, no prefix. Other languages get a prefix.
    window.location.href = targetLang === 'en' ? `/${cleanUrl}` : `/${targetLang}/${cleanUrl}`;
  } catch {
    // Fallback
    const currentPath = getPagePathWithoutLanguage();
    if (!currentPath) {
      window.location.href = targetLang === 'fr' ? '/fr/' : '/';
    } else {
      window.location.href = targetLang === 'en' ? `/${currentPath}` : `/${targetLang}/${currentPath}`;
    }
  }
}

// Toggle between languages
export function switchLanguage() {
  switchToLanguage(getLanguage() === 'en' ? 'fr' : 'en');
}
