import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import chatHandler from './api/chat'
import healthHandler from './api/health'
import insightsHandler from './api/insights'
import planHandler from './api/plan'

type VercelLikeResponse = ServerResponse & {
  status: (code: number) => VercelLikeResponse
  json: (payload: unknown) => void
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (!chunks.length) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function wrapResponse(res: ServerResponse): VercelLikeResponse {
  const wrapped = res as VercelLikeResponse
  wrapped.status = (code: number) => {
    res.statusCode = code
    return wrapped
  }
  wrapped.json = (payload: unknown) => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json')
    }
    res.end(JSON.stringify(payload))
  }
  return wrapped
}

export function localApiPlugin(): Plugin {
  return {
    name: 'summit-copilot-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next()
          return
        }

        try {
          const url = new URL(req.url, 'http://localhost')
          const pathname = url.pathname.replace(/\/$/, '') || '/'
          const query = Object.fromEntries(url.searchParams.entries())
          const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : {}
          const vercelReq = {
            method: req.method,
            query,
            body,
            headers: req.headers,
            url: req.url,
          }
          const vercelRes = wrapResponse(res)

          const routes: Record<string, (req: never, res: never) => Promise<void> | void> = {
            '/api/plan': planHandler,
            '/api/insights': insightsHandler,
            '/api/chat': chatHandler,
            '/api/health': healthHandler,
          }

          const handler = routes[pathname]
          if (handler) {
            await handler(vercelReq as never, vercelRes as never)
            return
          }

          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not found.' }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Local API error.',
            }),
          )
        }
      })
    },
  }
}
