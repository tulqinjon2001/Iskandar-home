const SCROLL_KEY = 'ih_landing_scroll_y';
const HASH_KEY = 'ih_landing_hash';

/** Bosh sahifadan xizmat sahifasiga o‘tishdan oldin chaqiring. */
export function saveLandingScrollForReturn(): void {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    sessionStorage.setItem(HASH_KEY, window.location.hash || '');
  } catch {
    /* private mode / disabled */
  }
}

/** Bosh sahifa yuklanganda chaqiring — saqlangan scroll va hashni tiklaydi. */
export function restoreLandingScrollIfNeeded(): void {
  let yStr: string | null;
  let hash: string | null;
  try {
    yStr = sessionStorage.getItem(SCROLL_KEY);
    hash = sessionStorage.getItem(HASH_KEY);
  } catch {
    return;
  }
  if (yStr === null) return;

  try {
    sessionStorage.removeItem(SCROLL_KEY);
    sessionStorage.removeItem(HASH_KEY);
  } catch {
    /* ignore */
  }

  const y = parseInt(yStr, 10);
  if (!Number.isFinite(y) || y < 0) return;

  const h = hash && hash.startsWith('#') ? hash : '';
  if (h && window.location.hash !== h) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${h}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  const apply = () => window.scrollTo(0, y);
  requestAnimationFrame(() => {
    requestAnimationFrame(apply);
  });
}
