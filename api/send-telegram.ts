import type { IncomingMessage } from 'node:http';
import { handleTelegramConsultation } from './send-telegram-consultation';

type TelegramRequestBody = {
  name?: string;
  phone?: string;
  message?: string;
  product?: string;
  price?: string;
};

function parseBody(
  raw: unknown,
): { ok: true; body: TelegramRequestBody } | { ok: false; error: string } {
  if (raw == null) return { ok: true, body: {} };
  if (typeof raw === 'string') {
    try {
      const obj = raw ? JSON.parse(raw) : {};
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return { ok: false, error: "Noto‘g‘ri JSON." };
      }
      return { ok: true, body: obj as TelegramRequestBody };
    } catch {
      return { ok: false, error: "Noto‘g‘ri JSON." };
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return { ok: true, body: raw as TelegramRequestBody };
  }
  return { ok: false, error: "Noto‘g‘ri so‘rov." };
}

function readRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Vercel ba’zan `req.body` ni bermaydi; streamdan o‘qimiz. */
async function resolveJsonBody(
  req: IncomingMessage & { body?: unknown },
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  if (req.body !== undefined) return { ok: true, data: req.body };
  const raw = await readRawBody(req);
  if (!raw.trim()) return { ok: true, data: {} };
  try {
    return { ok: true, data: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, error: "Noto‘g‘ri JSON." };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const resolved = await resolveJsonBody(req);
    if (!resolved.ok) {
      res.status(400).json({ ok: false, error: resolved.error });
      return;
    }

    const parsed = parseBody(resolved.data);
    if (!parsed.ok) {
      res.status(400).json({ ok: false, error: parsed.error });
      return;
    }
    const body = parsed.body;
    const result = await handleTelegramConsultation({
      name: body.name,
      phone: body.phone,
      message: body.message,
      product: body.product,
      price: body.price,
    });
    res.status(result.status).json(result.payload);
  } catch (err) {
    console.error('[send-telegram] handler:', err);
    res.status(500).json({ ok: false, error: 'Server xatosi.' });
  }
}
