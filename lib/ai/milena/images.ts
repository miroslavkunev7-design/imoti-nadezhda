import { resolveMilenaLlmConfig } from '@/lib/ai/milena/provider'

export async function generatePropertyImage(prompt: string): Promise<string | null> {
  const llm = await resolveMilenaLlmConfig()
  if (!llm) return null
  const { apiKey: key, imagesUrl } = llm
  const style =
    'Luxury real estate photography, professional staging, natural light, high resolution, Bulgarian apartment interior or exterior, no text, no watermark.'
  try {
    const res = await fetch(imagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${style}\n\n${prompt}`.slice(0, 3800),
        n: 1,
        size: '1792x1024',
        quality: 'hd',
      }),
      signal: AbortSignal.timeout(90_000),
    })
    const json = await res.json()
    return json.data?.[0]?.url ?? null
  } catch {
    return null
  }
}

export async function improvePropertyImage(
  imageUrl: string,
  instructions: string
): Promise<string | null> {
  const llm = await resolveMilenaLlmConfig()
  if (!llm) return null
  const prompt = `Improve this real estate photo: ${instructions || 'brighter, sharper, luxury look'}. Keep architecture realistic.`
  return generatePropertyImage(`${prompt} Reference style from: ${imageUrl}`)
}
