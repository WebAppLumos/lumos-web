export default async function handler(request) {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'KAKAO_REST_API_KEY is not configured' },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/kakao-mobility\/?/, '');
  const targetUrl = `https://apis-navi.kakaomobility.com/${path}${url.search}`;

  const upstream = await fetch(targetUrl, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}
