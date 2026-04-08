/// <reference types="node" />

/** Vercel’da env bo‘lmasa ham ishlashi uchun. Token oshkor bo‘lsa — @BotFather dan yangilang. */
const TELEGRAM_BOT_TOKEN_FALLBACK = '8009168007:AAGip26T4o2284I-Pd3wWYbrM645o8B1qD0';
const TELEGRAM_CHAT_ID_FALLBACK = '-1003725614675';

export type TelegramConsultationBody = {
  name?: string;
  phone?: string;
  message?: string;
  product?: string;
  price?: string;
};

export type TelegramConsultationResult =
  | { status: 200; payload: { ok: true } }
  | { status: number; payload: { ok: false; error: string } };

export async function handleTelegramConsultation(
  body: TelegramConsultationBody,
): Promise<TelegramConsultationResult> {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? TELEGRAM_BOT_TOKEN_FALLBACK).trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? TELEGRAM_CHAT_ID_FALLBACK).trim();

  const name = (body.name ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const message = (body.message ?? '').trim();
  const product = (body.product ?? '').trim();
  const price = (body.price ?? '').trim();

  if (!name || !phone) {
    return {
      status: 400,
      payload: { ok: false, error: "Ism va telefon majburiy." },
    };
  }

  const lines = [
    product ? '🛒 Yangi buyurtma (zayavka)' : 'Yangi konsultatsiya so\'rovi',
    '',
    ...(product ? [`Mahsulot: ${product}`] : []),
    ...(price ? [`Narx: ${price}`] : []),
    ...(product ? [''] : []),
    `Ism: ${name}`,
    `Telefon: ${phone}`,
    ...(message ? [`Izoh: ${message}`] : []),
    `Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
  ];
  const text = lines.join('\n');

  let tgResponse: Response;
  try {
    tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  } catch (err) {
    console.error('[send-telegram] fetch failed:', err);
    return {
      status: 502,
      payload: {
        ok: false,
        error:
          "Telegram serveriga ulanib bo‘lmadi. Internet yoki hosting cheklovini tekshiring; birozdan keyin qayta urinib ko‘ring.",
      },
    };
  }

  if (!tgResponse.ok) {
    const errText = await tgResponse.text();
    let userMessage =
      "Xabar yuborilmadi. Admin Telegram sozlamalarini (chat ID va bot) tekshirsin.";

    try {
      const parsed = JSON.parse(errText) as { description?: string; error_code?: number };
      const desc = (parsed.description ?? '').toLowerCase();

      if (desc.includes('chat not found') || desc.includes('chat_id is empty')) {
        userMessage =
          "Telegram chat topilmadi. Chat ID noto‘g‘ri yoki bot guruh/kanaldan chiqib ketgan. Guruhda bot borligini va kanalga yuborish uchun admin huquqini tekshiring; superguruh uchun odatda -100... bilan boshlanadigan ID kerak.";
      } else if (
        desc.includes('unauthorized') ||
        desc.includes('invalid bot token') ||
        desc.includes('not valid')
      ) {
        userMessage =
          "Telegram bot token noto‘g‘ri yoki bekor qilingan. @BotFather dan yangi token oling va kod/env ni yangilang.";
      } else if (desc.includes('blocked') || desc.includes('bot was blocked')) {
        userMessage =
          "Foydalanuvchi botni bloklagan. Boshqa chat ID ishlating (masalan, guruh yoki kanal).";
      } else if (parsed.error_code === 429) {
        userMessage = "Telegram limiti: birozdan keyin qayta urinib ko‘ring.";
      }
    } catch {
      // errText not JSON — keep generic message
    }

    console.error('[send-telegram] Telegram API:', tgResponse.status, errText);
    return { status: 502, payload: { ok: false, error: userMessage } };
  }

  return { status: 200, payload: { ok: true } };
}
