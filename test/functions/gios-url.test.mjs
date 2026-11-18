import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GIOS_BASE, buildGiosUrl } from '../../functions/_lib/gios-url.mjs';

const ORIGIN = 'https://powietrze.example';

describe('buildGiosUrl', () => {
  it('maps /api/<path> onto the GIOŚ v1 base', () => {
    assert.equal(
      buildGiosUrl(`${ORIGIN}/api/station/findAll`)?.href,
      `${GIOS_BASE}station/findAll`,
    );
    assert.equal(
      buildGiosUrl(`${ORIGIN}/api/data/getData/291`)?.href,
      `${GIOS_BASE}data/getData/291`,
    );
  });

  it('keeps the query string and drops the fragment', () => {
    assert.equal(
      buildGiosUrl(`${ORIGIN}/api/station/findAll?page=0&size=500#x`)?.href,
      `${GIOS_BASE}station/findAll?page=0&size=500`,
    );
  });

  it('rejects requests outside /api/', () => {
    assert.equal(buildGiosUrl(`${ORIGIN}/station/findAll`), null);
    assert.equal(buildGiosUrl(`${ORIGIN}/api`), null);
    assert.equal(buildGiosUrl(`${ORIGIN}/api/`), null);
    assert.equal(buildGiosUrl(`${ORIGIN}/apix/station/findAll`), null);
  });

  it('rejects attempts to leave the target base', () => {
    const attempts = [
      '/api//evil.example/x',
      '/api/https://evil.example/x',
      '/api/http:evil.example',
      '/api/%2e%2e/%2e%2e/foo',
      '/api/%2E%2E/x',
      '/api/station/%2e%2e/%2e%2e/%2e%2e/x',
      '/api/\\\\evil.example/x',
    ];
    for (const path of attempts) {
      assert.equal(buildGiosUrl(`${ORIGIN}${path}`), null, path);
    }
  });

  it('never produces a URL outside the base', () => {
    const samples = ['/api/a/b/c', '/api/%2fevil', '/api/..%2f..%2fx', '/api/@evil.example'];
    for (const path of samples) {
      const result = buildGiosUrl(`${ORIGIN}${path}`);
      assert.ok(result === null || result.href.startsWith(GIOS_BASE), path);
    }
  });
});
