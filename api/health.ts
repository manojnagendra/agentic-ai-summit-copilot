import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendJson } from './_shared.js'

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  return sendJson(response, 200, {
    ok: true,
    app: 'agentic-ai-summit-copilot',
    ai: Boolean(process.env.OPENAI_API_KEY),
  })
}
