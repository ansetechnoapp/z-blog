export function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  let categoriesHtml = '';
  if (Array.isArray(post.categories) && post.categories.length > 0) {
    categoriesHtml = post.categories
      .map(c => `<a href="#/categories/${encodeURIComponent(c.slug || c.name)}" class="badge badge-cat">${c.name}</a>`)
      .join('');
  }

  let tagsHtml = '';
  if (Array.isArray(post.tags) && post.tags.length > 0) {
    tagsHtml = post.tags
      .map(t => `<a href="#/tags/${encodeURIComponent(t.slug || t.name)}" class="badge badge-tag">${t.name}</a>`)
      .join('');
  }

  card.innerHTML = `
    ${post.featuredImage ? `<div class="post-card-img"><img src="${post.featuredImage}" alt="${post.title || ''}" loading="lazy"></div>` : ''}
    <div class="post-card-body">
      ${date ? `<time class="post-date">${date}</time>` : ''}
      <h3 class="post-card-title"><a href="#/posts/${encodeURIComponent(post.slug)}">${post.title || 'Untitled'}</a></h3>
      ${post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ''}
      <div class="post-card-meta">
        ${categoriesHtml}${tagsHtml}
      </div>
    </div>
  `;

  return card;
}
