import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { getAggregate, getPostBySlug } from './elevare-api.js';

const originalFetch = globalThis.fetch;

describe('ELEVARE Blog API client', () => {
  beforeEach(() => {
    globalThis.fetch = async (input) => {
      const url = String(input);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            success: true,
            data: {
              posts: [{ slug: 'article-api' }],
              categories: [],
              tags: [],
              authors: [],
            },
            metadata: { source: 'zodback' },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('uses same-origin API paths and normalizes one accidental legacy envelope', async () => {
    const aggregate = await getAggregate({ q: 'unique-envelope-test' });

    expect(aggregate.posts).toEqual([{ slug: 'article-api' }]);
    expect(aggregate.metadata).toEqual({ source: 'zodback' });
  });

  test('encodes the public post slug without adding credentials', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (input) => {
      requestedUrl = String(input);
      return new Response(
        JSON.stringify({ success: true, data: { post: { slug: 'a/b' } } }),
        { status: 200 },
      );
    };

    const result = await getPostBySlug('a/b');

    expect(result.post.slug).toBe('a/b');
    expect(requestedUrl).toBe('/api/blog/v1/public/posts/a%2Fb');
  });
});
