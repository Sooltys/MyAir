/** Jedyny dopuszczalny cel proxy. Proxy dokleja do niego wyłącznie ścieżkę i query string. */
export const GIOS_BASE = 'https://api.gios.gov.pl/pjp-api/v1/rest/';

/** Prefiks, pod którym frontend woła API (taki sam jak w proxy.conf.json dla `ng serve`). */
export const PROXY_PREFIX = '/api/';

/**
 * Zamienia adres żądania `https://<host>/api/<ścieżka>?<query>` na adres w API GIOŚ.
 *
 * Zwraca `null`, gdy żądanie nie jest pod `/api/` albo gdy wynik wychodzi poza `GIOS_BASE`
 * (np. `/api//evil.example/x`, `/api/https://evil.example`, `/api/%2e%2e/...`).
 *
 * @param {string | URL} requestUrl
 * @returns {URL | null}
 */
export function buildGiosUrl(requestUrl) {
  const incoming = new URL(requestUrl);
  if (!incoming.pathname.startsWith(PROXY_PREFIX)) {
    return null;
  }

  const path = incoming.pathname.slice(PROXY_PREFIX.length);
  if (path === '') {
    return null;
  }

  let target;
  try {
    target = new URL(path + incoming.search, GIOS_BASE);
  } catch {
    return null;
  }

  if (!target.href.startsWith(GIOS_BASE) || target.username || target.password) {
    return null;
  }
  target.hash = '';
  return target;
}
