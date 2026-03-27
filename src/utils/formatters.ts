export const formatPrice = (price: number | null): string => {
  if (price === null) return "Narx ko'rsatilmagan";
  return `${price.toLocaleString('ru-RU')} so'm`;
};

export const formatMoneyInput = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

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
