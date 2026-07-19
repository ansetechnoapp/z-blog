import { afterEach, describe, expect, test } from 'bun:test';
import worker from './worker.js';

const originalFetch = globalThis.fetch;
const env = {
  ZODBACK_API_BASE_URL: 'https://integrations-api.zodev.live',
  ZODBACK_API_TOKEN: 'server-token',
  ZODBACK_PROJECT_ID: '1',
  ASSETS: {
    fetch: async () => new Response('static asset', { status: 200 }),
  },
};

describe('ELEVARE Cloudflare Worker', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('proxies only public Blog GET requests with server-side credentials', async () => {
    let target = '';
    let forwardedHeaders;
    globalThis.fetch = async (input, init) => {
      target = String(input);
      forwardedHeaders = new Headers(init?.headers);
      return new Response('{"success":true}', {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
      });
    };

    const response = await worker.fetch(
      new Request('https://blog.zodev.live/api/blog/v1/public/posts?q=api'),
      env,
    );

    expect(response.status).toBe(200);
    expect(target).toBe(
      'https://integrations-api.zodev.live/api/blog/v1/public/posts?q=api',
    );
    expect(forwardedHeaders.get('X-Api-Key')).toBe('server-token');
    expect(forwardedHeaders.get('X-Project-Id')).toBe('1');
    expect(await response.text()).toBe('{"success":true}');
  });

  test('rejects writes and serves non-API paths from assets', async () => {
    const write = await worker.fetch(
      new Request('https://blog.zodev.live/api/blog/v1/public/posts', {
        method: 'POST',
      }),
      env,
    );
    const asset = await worker.fetch(
      new Request('https://blog.zodev.live/'),
      env,
    );

    expect(write.status).toBe(405);
    expect(asset.status).toBe(200);
    expect(await asset.text()).toBe('static asset');
  });
});
