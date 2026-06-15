export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const apiKey = process.env.KAKAO_REST_API_KEY?.trim().replace(/^["']|["']$/g, '')
  if (!apiKey) {
    res.status(500).json({ error: 'KAKAO_REST_API_KEY is not configured' })
    return
  }

  const queryIndex = req.url?.indexOf('?') ?? -1
  const query = queryIndex >= 0 ? req.url.slice(queryIndex + 1) : ''
  const targetUrl = `https://apis-navi.kakaomobility.com/v1/directions${query ? `?${query}` : ''}`

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    })

    const body = await upstream.text()
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json')
    res.status(upstream.status).send(body)
  } catch {
    res.status(502).json({ error: 'Failed to reach Kakao Mobility API' })
  }
}
