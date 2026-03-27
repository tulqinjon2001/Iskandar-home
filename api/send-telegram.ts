import { handleTelegramConsultation } from '../src/lib/send-telegram-consultation';

type TelegramRequestBody = {
  name?: string;
  phone?: string;
  message?: string;
  product?: string;
  price?: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const body = (req.body ?? {}) as TelegramRequestBody;
  const result = await handleTelegramConsultation({
    name: body.name,
    phone: body.phone,
    message: body.message,
    product: body.product,
    price: body.price,
  });
  res.status(result.status).json(result.payload);
}
