import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { CACHE_SECONDS, handleProxyRequest } from '../../functions/_lib/proxy.mjs';

const ORIGIN = 'https://powietrze.example';

/** Minimalna atrapa `caches.default` z Cloudflare Workers. */
function createCache() {
  const store = new Map();
  return {
    store,
    async match(request) {
      const hit = store.get(request.url);
      return hit ? hit.clone() : undefined;
    },
    async put(request, response) {
      store.set(request.url, response);
    },
  };
}

function createContext(path, init = {}) {
  const pending = [];
  return {
    request: new Request(`${ORIGIN}${path}`, init),
    waitUntil: (promise) => pending.push(promise),
    settle: () => Promise.all(pending),
  };
}

describe('handleProxyRequest', () => {
  const realFetch = globalThis.fetch;
  let cache;
  let fetchCalls;

  beforeEach(() => {
    cache = createCache();
    globalThis.caches = { default: cache };
    fetchCalls = [];
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    delete globalThis.caches;
  });

  function stubFetch(impl) {
    globalThis.fetch = async (input, init) => {
      fetchCalls.push({ url: String(input), init });
      return impl(input, init);
    };
  }

  it('returns 405 for methods other than GET/HEAD', async () => {
    stubFetch(() => assert.fail('must not call upstream'));
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
      const res = await handleProxyRequest(createContext('/api/station/findAll', { method }));
      assert.equal(res.status, 405, method);
      assert.equal(res.headers.get('Allow'), 'GET, HEAD');
    }
  });

  it('returns 400 when the path would escape the target', async () => {
    stubFetch(() => assert.fail('must not call upstream'));
    const res = await handleProxyRequest(createContext('/api/%2e%2e/%2e%2e/x'));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'bad_request');
  });

  it('forwards GET to GIOŚ v1 and strips upstream headers', async () => {
    stubFetch(
      () =>
        new Response('{"ok":true}', {
          status: 200,
          headers: {
            'Content-Type': 'application/ld+json;charset=utf-8',
            'Set-Cookie': 'SERVERID=abc; HttpOnly',
            'Access-Control-Allow-Origin': 'powietrze.gios.gov.pl',
          },
        }),
    );
    const ctx = createContext('/api/station/findAll?size=500');
    const res = await handleProxyRequest(ctx);

    assert.equal(fetchCalls[0].url, 'https://api.gios.gov.pl/pjp-api/v1/rest/station/findAll?size=500');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Content-Type'), 'application/ld+json;charset=utf-8');
    assert.equal(res.headers.get('Set-Cookie'), null);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(res.headers.get('Cache-Control'), `public, max-age=${CACHE_SECONDS}`);
    assert.equal(res.headers.get('X-Proxy-Cache'), 'MISS');
    assert.deepEqual(await res.json(), { ok: true });
  });

  it('serves the second request from cache', async () => {
    stubFetch(() => new Response('{"n":1}', { headers: { 'Content-Type': 'application/json' } }));
    const first = createContext('/api/station/sensors/52');
    await (await handleProxyRequest(first)).text();
    await first.settle();

    const res = await handleProxyRequest(createContext('/api/station/sensors/52'));
    assert.equal(res.headers.get('X-Proxy-Cache'), 'HIT');
    assert.deepEqual(await res.json(), { n: 1 });
    assert.equal(fetchCalls.length, 1);
  });

  it('passes through GIOŚ 400 (manual sensor) and caches it', async () => {
    stubFetch(
      () =>
        new Response('{"error_code":"API-ERR-100003"}', {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const ctx = createContext('/api/data/getData/276');
    const res = await handleProxyRequest(ctx);
    await ctx.settle();
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error_code, 'API-ERR-100003');
    assert.equal(cache.store.size, 1);
  });

  it('does not cache 429 or 5xx responses', async () => {
    for (const status of [429, 500, 503]) {
      cache.store.clear();
      stubFetch(() => new Response('busy', { status }));
      const ctx = createContext('/api/station/findAll');
      const res = await handleProxyRequest(ctx);
      await ctx.settle();
      assert.equal(res.status, status);
      assert.equal(res.headers.get('Cache-Control'), 'no-store');
      assert.equal(cache.store.size, 0, String(status));
    }
  });

  it('returns 504 JSON when GIOŚ times out', async () => {
    stubFetch(() => {
      throw new DOMException('The operation timed out.', 'TimeoutError');
    });
    const res = await handleProxyRequest(createContext('/api/station/findAll'));
    assert.equal(res.status, 504);
    assert.equal((await res.json()).error, 'gios_timeout');
  });

  it('returns 502 JSON when GIOŚ is unreachable', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed');
    });
    const res = await handleProxyRequest(createContext('/api/station/findAll'));
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error, 'gios_unavailable');
  });

  it('passes an abort signal (timeout) to the upstream fetch', async () => {
    stubFetch(() => new Response('{}'));
    await handleProxyRequest(createContext('/api/station/findAll'));
    assert.ok(fetchCalls[0].init.signal instanceof AbortSignal);
  });

  it('answers HEAD without a body', async () => {
    stubFetch(() => new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }));
    const res = await handleProxyRequest(createContext('/api/station/findAll', { method: 'HEAD' }));
    assert.equal(res.status, 200);
    assert.equal(res.body, null);
  });
});
