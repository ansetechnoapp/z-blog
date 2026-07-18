/* Client public du module Blog ZodBack. Le Worker injecte l'authentification côté serveur. */
const API_ROOT = "/api/blog/v1/public";
const responseCache = new Map();

function unwrapEnvelope(payload) {
  let current = payload;

  for (let depth = 0; depth < 2; depth += 1) {
    if (
      current &&
      current.success === true &&
      current.data &&
      current.data.success === true &&
      Object.prototype.hasOwnProperty.call(current.data, "data")
    ) {
      current = current.data;
    }
  }

  return current;
}

async function request(path, options = {}) {
  const key = `${options.method || "GET"}:${path}`;
  if (!options.method || options.method === "GET") {
    const cached = responseCache.get(key);
    if (cached) return cached;
  }

  const requestPromise = fetch(`${API_ROOT}${path}`, {
    method: options.method || "GET",
    headers: { Accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Blog API ${response.status}`);
    }
    return unwrapEnvelope(await response.json());
  });

  if (!options.method || options.method === "GET") {
    responseCache.set(key, requestPromise);
  }

  try {
    return await requestPromise;
  } catch (error) {
    responseCache.delete(key);
    throw error;
  }
}

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(name, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export function getAggregate(params = {}) {
  return request(`/all${query({ perPage: 50, ...params })}`).then(
    (payload) => ({
      ...(payload.data || payload),
      metadata: payload.metadata || payload.data?.metadata || {},
    }),
  );
}

export function getPosts(params = {}) {
  return request(`/posts${query({ perPage: 50, ...params })}`).then(
    (payload) => ({
      posts: payload.data || [],
      metadata: payload.metadata || {},
    }),
  );
}

export function searchPosts(params = {}) {
  return request(`/search${query({ perPage: 50, ...params })}`).then(
    (payload) => ({
      posts: payload.data || [],
      metadata: payload.metadata || {},
    }),
  );
}

export function getPostBySlug(slug) {
  return request(`/posts/${encodeURIComponent(slug)}`).then(
    (payload) => payload.data || payload,
  );
}

export function getCategories() {
  return request("/categories").then((payload) => payload.data || []);
}

export function getCategoryBySlug(slug) {
  return request(`/categories/${encodeURIComponent(slug)}`).then(
    (payload) => payload.data || payload,
  );
}

export function getAuthors() {
  return request("/authors").then((payload) => payload.data || []);
}

export function getAuthorBySlug(slug) {
  return request(`/authors/${encodeURIComponent(slug)}`).then(
    (payload) => payload.data || payload,
  );
}

export function getArchives() {
  return request("/archives").then((payload) => payload.data || []);
}
