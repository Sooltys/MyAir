import { buildGiosUrl } from './gios-url.mjs';

/** Po tym czasie przestajemy czekać na GIOŚ i zwracamy 504. */
export const UPSTREAM_TIMEOUT_MS = 10_000;

/** Dane GIOŚ są godzinowe; 10 minut cache odciąża API (lista stacji ma limit ~2 zapytań/min). */
export const CACHE_SECONDS = 600;

const ALLOWED_METHODS = 'GET, HEAD';

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

/**
 * Cache'ujemy sukcesy oraz 400/404 (np. stanowisko manualne bez bieżących danych zawsze daje 400).
 * Nigdy: 429 (limit zapytań) i 5xx.
 */
function isCacheable(status) {
  return (status >= 200 && status < 300) || status === 400 || status === 404;
}

function withCacheStatus(response, method, cacheStatus) {
  const headers = new Headers(response.headers);
  headers.set('X-Proxy-Cache', cacheStatus);
  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    headers,
  });
}

/**
 * Proxy `/api/*` → `https://api.gios.gov.pl/pjp-api/v1/rest/*` dla Cloudflare Pages Functions.
 *
 * Z odpowiedzi GIOŚ przepuszcza tylko status, treść i `Content-Type` – bez `Set-Cookie`
 * i `Access-Control-Allow-Origin`.
 *
 * @param {{ request: Request, waitUntil: (promise: Promise<unknown>) => void }} context
 * @returns {Promise<Response>}
 */
export async function handleProxyRequest(context) {
  const { request } = context;
  const method = request.method;

  if (method !== 'GET' && method !== 'HEAD') {
    return jsonResponse(
      405,
      { error: 'method_not_allowed', message: `Dozwolone metody: ${ALLOWED_METHODS}.` },
      { Allow: ALLOWED_METHODS },
    );
  }

  const target = buildGiosUrl(request.url);
  if (!target) {
    return jsonResponse(400, { error: 'bad_request', message: 'Nieprawidłowa ścieżka API.' });
  }

  // Cache API działa w Pages Functions zarówno na *.pages.dev, jak i na własnej domenie.
  // Klucz: adres żądania (nasza domena), zawsze jako GET – HEAD korzysta z tego samego wpisu.
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    return withCacheStatus(cached, method, 'HIT');
  }

  let upstream;
  try {
    upstream = await fetch(target, {
      method: 'GET',
      headers: { Accept: 'application/ld+json, application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      return jsonResponse(504, {
        error: 'gios_timeout',
        message: 'API GIOŚ nie odpowiedziało na czas.',
      });
    }
    return jsonResponse(502, {
      error: 'gios_unavailable',
      message: 'Nie udało się połączyć z API GIOŚ.',
    });
  }

  const cacheable = isCacheable(upstream.status);
  const headers = new Headers({
    'Cache-Control': cacheable ? `public, max-age=${CACHE_SECONDS}` : 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  const contentType = upstream.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const response = new Response(upstream.body, { status: upstream.status, headers });
  if (cacheable) {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return withCacheStatus(response, method, 'MISS');
}
