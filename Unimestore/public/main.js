// main.js – shared helpers

export function isMobileUA() {
  const ua = (navigator.userAgent || '').toLowerCase();
  return /mobile|android|iphone|ipad|ipod/.test(ua);
}

export function escapeHTML(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function fmtDateTH(iso) {
  try { return new Date(iso).toLocaleString('th-TH'); } catch { return iso || ''; }
}