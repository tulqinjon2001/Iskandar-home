/// <reference types="node" />

export type TelegramConsultationBody = {
  name?: string;
  phone?: string;
  message?: string;
};

export type TelegramConsultationResult =
  | { status: 200; payload: { ok: true } }
  | { status: number; payload: { ok: false; error: string } };

export async function handleTelegramConsultation(
  body: TelegramConsultationBody,
): Promise<TelegramConsultationResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      status: 500,
      payload: { ok: false, error: 'Telegram env sozlanmagan' },
    };
  }

  const name = (body.name ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !phone) {
    return {
      status: 400,
      payload: { ok: false, error: "Ism va telefon majburiy." },
    };
  }

  const text = [
    'Yangi konsultatsiya so\'rovi',
    '',
    `Ism: ${name}`,
    `Telefon: ${phone}`,
    `Xabar: ${message || '-'}`,
    `Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
  ].join('\n');

  const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!tgResponse.ok) {
    const errText = await tgResponse.text();
    let userMessage =
      "Xabar yuborilmadi. Admin Telegram sozlamalarini (chat ID va bot) tekshirsin.";

    try {
      const parsed = JSON.parse(errText) as { description?: string; error_code?: number };
      const desc = (parsed.description ?? '').toLowerCase();

      if (desc.includes('chat not found') || desc.includes('chat_id is empty')) {
        userMessage =
          "Telegram chat topilmadi. .env dagi TELEGRAM_CHAT_ID noto‘g‘ri yoki bot guruh/kanaldan chiqib ketgan. Guruhda bot borligini va kanalga yuborish uchun admin huquqini tekshiring; superguruh uchun odatda -100... bilan boshlanadigan ID kerak.";
      } else if (
        desc.includes('unauthorized') ||
        desc.includes('invalid bot token') ||
        desc.includes('not valid')
      ) {
        userMessage =
          "Telegram bot token noto‘g‘ri yoki bekor qilingan. TELEGRAM_BOT_TOKEN ni @BotFather dan yangilang.";
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
