import type { VercelResponse } from '@vercel/node'

export function sendJson(
  response: VercelResponse,
  status: number,
  body: unknown,
  cache: 'none' | 'short' = 'none',
) {
  response.setHeader('Content-Type', 'application/json')
  if (cache === 'short') {
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  } else {
    response.setHeader('Cache-Control', 'no-store')
  }
  return response.status(status).json(body)
}

export function messageFrom(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}

export async function readJson<T>(request: { body?: unknown }): Promise<T> {
  return (request.body ?? {}) as T
}
