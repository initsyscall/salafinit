export function formatTranslation(text) {
  if (!text) return '';
  const parts = text.split(/(\([^)]*\)|\[[^\]]*\])/g);
  return parts.map(part => {
    if (!part) return '';
    if (part.startsWith('(') || part.startsWith('[')) {
      return `<span class="bracket">${part}</span>`;
    }
    return `<strong>${part}</strong>`;
  }).join('');
}

export function formatTafsirText(text) {
  if (!text) return '';
  let formatted = text
    .replace(/<h1>/gi, '<h1 class="quran-tafsir-h1">')
    .replace(/<h2>/gi, '<h2 class="quran-tafsir-h2">')
    .replace(/<h3>/gi, '<h3 class="quran-tafsir-h3">')
    .replace(/<p>/gi, '<p class="quran-tafsir-p">');
  return formatted;
}

export function stripHtmlTags(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function highlightText(text, searchTerm) {
  if (!text) return '';
  const cleanText = stripHtmlTags(text);
  if (!searchTerm) return escapeHtml(cleanText);
  const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeTerm})`, 'gi');
  return escapeHtml(cleanText).replace(regex, '<mark style="background:rgba(246,193,119,0.5);color:#F6C177;padding:1px 3px;border-radius:2px;">$1</mark>');
}

export function parseSearchQuery(query) {
  const trimmed = query.trim();
  const colonMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    return { type: 'ayah', surah: parseInt(colonMatch[1]), ayah: parseInt(colonMatch[2]) };
  }
  const surahNum = parseInt(trimmed);
  if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
    return { type: 'surah', surah: surahNum };
  }
  return { type: 'search', query: trimmed };
}

export default {
  formatTranslation,
  formatTafsirText,
  stripHtmlTags,
  escapeHtml,
  highlightText,
  parseSearchQuery,
};