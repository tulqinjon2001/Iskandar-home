import type { IncomingMessage } from "node:http"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type ViteDevServer } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { handleTelegramConsultation } from './api/send-telegram-consultation'

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/** Lokal `npm run dev` da `/api/send-telegram` Vercel funksiyasi bo‘lmagani uchun 404 berardi. */
function sendTelegramDevApi() {
  return {
    name: 'send-telegram-dev-api',
    configureServer(server: ViteDevServer) {
      const envLoadedForMode = new Set<string>()
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split('?')[0] ?? ''
        if (pathOnly !== '/api/send-telegram') {
          next()
          return
        }

        const mode = server.config.mode
        if (!envLoadedForMode.has(mode)) {
          const env = loadEnv(mode, process.cwd(), '')
          Object.assign(process.env, env)
          envLoadedForMode.add(mode)
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
          return
        }

        void readRequestBody(req)
          .then(async (raw) => {
            let parsed: Record<string, unknown> = {}
            try {
              parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: "Noto‘g‘ri JSON." }))
              return
            }
            const result = await handleTelegramConsultation({
              name: parsed.name as string | undefined,
              phone: parsed.phone as string | undefined,
              message: parsed.message as string | undefined,
              product: parsed.product as string | undefined,
              price: parsed.price as string | undefined,
            })
            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result.payload))
          })
          .catch(() => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: 'Server xatosi.' }))
          })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [sendTelegramDevApi(), inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
