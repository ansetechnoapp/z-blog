import { BLOG_CONFIG } from './config.js';

const cache = new Map();

async function request(url) {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.t < BLOG_CONFIG.CACHE_DURATION) return hit.d;

  const headers = { 'Content-Type': 'application/json' };
  if (BLOG_CONFIG.API_TOKEN) {
    headers['Authorization'] = `Bearer ${BLOG_CONFIG.API_TOKEN}`;
    headers['x-api-key'] = BLOG_CONFIG.API_TOKEN;
  }
  if (BLOG_CONFIG.PROJECT_ID) {
    headers['X-Project-Id'] = BLOG_CONFIG.PROJECT_ID;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Invalid API Key');
      throw new Error(`API Error: ${res.status}`);
    }
    const json = await res.json();
    cache.set(url, { t: now, d: json });
    return json;
  } catch (err) {
    if (BLOG_CONFIG.DEBUG) console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
}

function blogUrl(path) {
  return `${BLOG_CONFIG.API_URL}/${path}`;
}

export async function verifyConnection() {
  try {
    await request(blogUrl('posts'));
    return true;
  } catch {
    return false;
  }
}

export async function getAll(page = 1, perPage = BLOG_CONFIG.POSTS_PER_PAGE) {
  return request(blogUrl(`all?page=${page}&perPage=${perPage}`));
}

export async function getPosts() {
  return request(blogUrl('posts'));
}

export async function getPostBySlug(slug) {
  return request(blogUrl(`posts/${encodeURIComponent(slug)}`));
}

export async function getCategories() {
  return request(blogUrl('categories'));
}

export async function getTags() {
  return request(blogUrl('tags'));
}

export async function getComments(postId) {
  return request(blogUrl(`comments/${postId}`));
}

export async function getAuthors() {
  return request(`${BLOG_CONFIG.AUTHORS_API_URL}`);
}

export async function getAuthorBySlug(slug) {
  return request(`${BLOG_CONFIG.AUTHORS_API_URL}/${encodeURIComponent(slug)}`);
}
