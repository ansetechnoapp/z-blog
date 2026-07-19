const baseUrl = (process.env.BLOG_PRODUCTION_URL || 'https://blog.zodev.live').replace(/\/$/, '');
const apiRoot = `${baseUrl}/api/blog/v1/public`;
const expectedProjectId = Number(process.env.BLOG_PROJECT_ID || 1);

async function request(path, expectedStatus = 200, options = {}) {
  const response = await fetch(`${apiRoot}/${path}`, options);
  const body = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`${path}: attendu HTTP ${expectedStatus}, reçu ${response.status}: ${body.slice(0, 180)}`);
  }
  return { response, body };
}

function json(body, path) {
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${path}: réponse JSON invalide`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const homeResponse = await fetch(`${baseUrl}/`);
const home = await homeResponse.text();
assert(homeResponse.status === 200, `/: attendu HTTP 200, reçu ${homeResponse.status}`);
assert(home.includes('js/elevare.js'), '/: entrée ELEVARE absente');

const clientResponse = await fetch(`${baseUrl}/js/elevare-api.js`);
const client = await clientResponse.text();
assert(clientResponse.status === 200, 'js/elevare-api.js: asset absent');
assert(client.includes('/api/blog/v1/public'), 'client: chemin API same-origin absent');
assert(!/zb_[A-Za-z0-9]/i.test(client), 'client: token trouvé dans le bundle');
assert(!/authorization|x-api-key|integrations-api\.zodev\.live/i.test(client), 'client: détail serveur trouvé dans le bundle');

const aggregateResult = await request('all?perPage=50');
const aggregate = json(aggregateResult.body, 'all');
const data = aggregate.data || {};
assert(aggregate.success === true, 'all: success !== true');
assert(aggregate.metadata?.projectId === expectedProjectId, `all: projet inattendu (${aggregate.metadata?.projectId})`);
assert(Array.isArray(data.posts) && data.posts.length > 0, 'all: aucun article publié');
assert(Array.isArray(data.categories) && data.categories.length > 0, 'all: aucune catégorie');
assert(Array.isArray(data.tags) && data.tags.length > 0, 'all: aucun tag');
assert(Array.isArray(data.authors) && data.authors.length > 0, 'all: aucun auteur');

const firstPost = data.posts[0];
const slug = encodeURIComponent(firstPost.slug);
const detail = json((await request(`posts/${slug}`)).body, `posts/${firstPost.slug}`);
assert(detail.success === true && detail.data?.post?.slug === firstPost.slug, 'détail article incohérent');
assert(typeof detail.data.post.content === 'string' && detail.data.post.content.length > 0, 'détail article sans contenu');

const category = data.categories[0];
const categoryDetail = json((await request(`categories/${encodeURIComponent(category.slug)}`)).body, 'category');
assert(categoryDetail.success === true, 'détail catégorie invalide');

const tag = data.tags[0];
const tagDetail = json((await request(`tags/${encodeURIComponent(tag.slug)}`)).body, 'tag');
assert(tagDetail.success === true, 'détail tag invalide');

const author = data.authors[0];
const authorDetail = json((await request(`authors/${encodeURIComponent(author.slug)}`)).body, 'author');
assert(authorDetail.success === true, 'détail auteur invalide');

const search = json((await request(`search?q=${encodeURIComponent(firstPost.title)}`)).body, 'search');
assert(search.success === true && Array.isArray(search.data), 'recherche invalide');

const archives = json((await request('archives')).body, 'archives');
assert(archives.success === true && Array.isArray(archives.data), 'archives invalides');

for (const seoPath of ['seo/sitemap.xml', 'seo/robots.txt', 'seo/rss.xml']) {
  const seo = (await request(seoPath)).body;
  assert(!seo.includes('blog-1.example.com'), `${seoPath}: domaine fictif trouvé`);
  assert(seo.includes('blog.zodev.live'), `${seoPath}: domaine canonique absent`);
}

await request(`comments/${firstPost.id}`);
await request('posts', 200);
await request('posts', 405, { method: 'POST' });

for (const internalPath of ['worker.js', 'wrangler.jsonc', '.git/HEAD']) {
  const response = await fetch(`${baseUrl}/${internalPath}`);
  assert(response.status === 404, `${internalPath}: fichier interne exposé (${response.status})`);
}

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  projectId: aggregate.metadata.projectId,
  posts: data.posts.length,
  categories: data.categories.length,
  tags: data.tags.length,
  authors: data.authors.length,
  firstPost: firstPost.slug,
  seo: 'ok',
  browserSecrets: 'absent',
}, null, 2));
