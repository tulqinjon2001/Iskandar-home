type TelegramRequestBody = {
  name?: string;
  phone?: string;
  message?: string;
  page?: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: 'Telegram env sozlanmagan' });
    return;
  }

  const body = (req.body ?? {}) as TelegramRequestBody;
  const name = (body.name ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const message = (body.message ?? '').trim();
  const page = (body.page ?? '').trim();

  if (!name || !phone) {
    res.status(400).json({ ok: false, error: "Ism va telefon majburiy." });
    return;
  }

  const text = [
    'Yangi konsultatsiya so\'rovi',
    '',
    `Ism: ${name}`,
    `Telefon: ${phone}`,
    `Xabar: ${message || '-'}`,
    `Sahifa: ${page || '-'}`,
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
    res.status(502).json({ ok: false, error: `Telegram xatosi: ${errText}` });
    return;
  }

  res.status(200).json({ ok: true });
}
