export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const apiKey = process.env.KAKAO_REST_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'KAKAO_REST_API_KEY is not configured' },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const targetUrl = `https://apis-navi.kakaomobility.com/v1/directions${url.search}`

  const upstream = await fetch(targetUrl, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
  })

  const body = await upstream.text()

  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}
