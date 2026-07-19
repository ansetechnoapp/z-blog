const PUBLIC_API_PREFIX = "/api/blog/v1/public";
const PUBLIC_API_PATH = /^\/(?:all|posts(?:\/[A-Za-z0-9._~%-]+)?|search|categories(?:\/[A-Za-z0-9._~%-]+)?|tags(?:\/[A-Za-z0-9._~%-]+)?|authors(?:\/[A-Za-z0-9._~%-]+)?|archives|comments\/[0-9]+|seo\/(?:sitemap\.xml|robots\.txt|rss\.xml))$/;

function jsonError(status, message) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function isPublicApiRequest(url) {
  if (url.pathname === PUBLIC_API_PREFIX) return true;
  if (!url.pathname.startsWith(`${PUBLIC_API_PREFIX}/`)) return false;
  return PUBLIC_API_PATH.test(url.pathname.slice(PUBLIC_API_PREFIX.length));
}

function backendUrl(requestUrl, baseUrl) {
  const suffix = requestUrl.pathname.slice(PUBLIC_API_PREFIX.length);
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${PUBLIC_API_PREFIX}${suffix}${requestUrl.search}`;
}

function copyResponseHeaders(source) {
  const headers = new Headers();
  source.headers.forEach((value, name) => {
    const lowerName = name.toLowerCase();
    if (
      lowerName !== "set-cookie" &&
      !lowerName.startsWith("access-control-") &&
      lowerName !== "content-length"
    ) {
      headers.set(name, value);
    }
  });
  return headers;
}

async function proxyBlogApi(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonError(405, "Only GET and HEAD are supported");
  }
  if (!isPublicApiRequest(new URL(request.url))) {
    return jsonError(404, "Public Blog route not found");
  }
  if (!env.ZODBACK_API_TOKEN || !env.ZODBACK_PROJECT_ID) {
    return jsonError(500, "Blog proxy is not configured");
  }

  const target = new URL(backendUrl(
    new URL(request.url),
    env.ZODBACK_API_BASE_URL || "https://integrations-api.zodev.live",
  ));
  const headers = new Headers({
    Accept: request.headers.get("Accept") || "application/json",
    "X-Project-Id": env.ZODBACK_PROJECT_ID,
    "X-Api-Key": env.ZODBACK_API_TOKEN,
    Authorization: `Bearer ${env.ZODBACK_API_TOKEN}`,
  });
  const response = await fetch(target, { method: request.method, headers });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: copyResponseHeaders(response),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PUBLIC_API_PREFIX || url.pathname.startsWith(`${PUBLIC_API_PREFIX}/`)) {
      return proxyBlogApi(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
