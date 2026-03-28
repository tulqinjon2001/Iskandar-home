export const formatPrice = (price: number | null): string => {
  if (price === null) return "Narx ko'rsatilmagan";
  return `${price.toLocaleString('ru-RU')} so'm`;
};

export const formatMoneyInput = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * O'zbekiston telefon raqamini formatlaydi.
 * Kiruvchi: ixtiyoriy matn  →  Chiquvchi: +998 XX XXX XX XX
 * Foydalanuvchi yozgan faqat raqamlar olinadi, 12 xonagacha.
 */
export const formatPhoneInput = (raw: string): string => {
  // faqat raqamlar
  let digits = raw.replace(/\D/g, '');

  // 998 bilan boshlansa olib tashlamaymiz, +dan avvalgi belgini olib tashlaymiz
  // agar 998 bilan boshlanmasa, lekin 9 bilan boshlansa ham qo'yamiz
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // max 9 ta raqam (operator kodi + raqam)
  digits = digits.slice(0, 9);

  if (!digits) return '+998 ';

  let result = '+998 ';
  if (digits.length <= 2) {
    result += digits;
  } else if (digits.length <= 5) {
    result += digits.slice(0, 2) + ' ' + digits.slice(2);
  } else if (digits.length <= 7) {
    result += digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  } else {
    result +=
      digits.slice(0, 2) +
      ' ' +
      digits.slice(2, 5) +
      ' ' +
      digits.slice(5, 7) +
      ' ' +
      digits.slice(7, 9);
  }
  return result;
};

/**
 * product_name maydonini o'qiydi.
 * Yangi format: JSON string {"uz":"...","ru":"..."}
 * Eski format: oddiy string — ikkala tilda ham shu ko'rinadi.
 */
export function parseProductName(
  raw: string | null | undefined,
  lang: 'uz' | 'ru',
  fallback = '',
): string {
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as Record<string, string>;
      return d[lang] || d['uz'] || d['ru'] || fallback;
    }
  } catch {
    // plain string (old data)
  }
  return raw || fallback;
}

/**
 * Admin form dagi ikkita nom maydonini JSON ga yig'adi.
 */
export function encodeProductName(uz: string, ru: string): string {
  return JSON.stringify({ uz: uz.trim(), ru: ru.trim() });
}

/**
 * JSON string yoki plain string ni { uz, ru } ga ochadi.
 */
export function decodeProductName(raw: string | null | undefined): { uz: string; ru: string } {
  if (!raw) return { uz: '', ru: '' };
  try {
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as Record<string, string>;
      return { uz: d['uz'] ?? '', ru: d['ru'] ?? '' };
    }
  } catch {
    // plain string — use as uz, ru stays empty
  }
  return { uz: raw, ru: '' };
}

export const makeSafeFileName = (originalName: string): string => {
  const lower = originalName.toLowerCase();
  const parts = lower.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  const base = parts.join('.');
  const safeBase = base
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const fallbackBase = safeBase || 'image';
  return ext ? `${fallbackBase}.${ext.replace(/[^a-z0-9]/g, '') || 'jpg'}` : fallbackBase;
};

export const makeStoragePath = (file: File): string => {
  const safeName = makeSafeFileName(file.name);
  const ext = safeName.includes('.') ? safeName.split('.').pop() : 'jpg';
  return `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || 'jpg'}`;
};
