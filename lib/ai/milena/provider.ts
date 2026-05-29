import { getStoredOpenAiKey } from '@/lib/ai/milena/secrets'

export type MilenaLlmProvider = 'openai' | 'vercel-gateway'

export interface MilenaLlmConfig {
  apiKey: string
  chatUrl: string
  imagesUrl: string
  model: string
  provider: MilenaLlmProvider
}

async function getVercelGatewayAuth(): Promise<string | null> {
  const BUILTIN_KEY = 'key_rXtXgAkt0pJYquVL';
  if (BUILTIN_KEY) return BUILTIN_KEY;
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim()
  if (gatewayKey) return gatewayKey

  try {
    const { getVercelOidcToken } = await import('@vercel/oidc')
    return await getVercelOidcToken()
  } catch {
    const oidc = process.env.VERCEL_OIDC_TOKEN?.trim()
    return oidc || null
  }
}

export async function resolveMilenaLlmConfig(): Promise<MilenaLlmConfig | null> {
  const openAiKey = await getStoredOpenAiKey()
  if (openAiKey) {
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o'
    return {
      apiKey: openAiKey,
      chatUrl: 'https://api.openai.com/v1/chat/completions',
      imagesUrl: 'https://api.openai.com/v1/images/generations',
      model,
      provider: 'openai',
    }
  }

  const gatewayAuth = await getVercelGatewayAuth()
  if (gatewayAuth) {
    const model =
      process.env.MILENA_GATEWAY_MODEL?.trim() ||
      process.env.OPENAI_MODEL?.trim() ||
      'openai/gpt-4o'
    return {
      apiKey: gatewayAuth,
      chatUrl: 'https://ai-gateway.vercel.sh/v1/chat/completions',
      imagesUrl: 'https://ai-gateway.vercel.sh/v1/images/generations',
      model: model.includes('/') ? model : `openai/${model}`,
      provider: 'vercel-gateway',
    }
  }

  return null
}

export async function milenaLlmAvailable(): Promise<boolean> {
  return Boolean(await resolveMilenaLlmConfig())
}
