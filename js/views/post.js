import { getPostBySlug } from '../api.js';
import { BLOG_CONFIG } from '../config.js';

function renderComments(comments) {
  if (!Array.isArray(comments) || comments.length === 0) return '';

  const items = comments.map(c => {
    const date = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
    return `
      <div class="comment">
        <div class="comment-header">
          <strong class="comment-author">${c.authorName || 'Anonymous'}</strong>
          ${date ? `<time class="comment-date">${date}</time>` : ''}
        </div>
        <div class="comment-body">${c.content || ''}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="comments-section">
      <h3 class="comments-title">${comments.length} Comment${comments.length !== 1 ? 's' : ''}</h3>
      ${items}
    </section>
  `;
}

export async function render(content, sidebar, params = {}) {
  const { slug } = params;
  if (!slug) {
    content.innerHTML = '<div class="error">Post not found.</div>';
    return;
  }

  content.innerHTML = '<div class="loading">Loading post...</div>';

  try {
    const res = await getPostBySlug(slug);
    const { post, comments } = res.data || {};

    if (!post) {
      content.innerHTML = '<div class="error">Post not found.</div>';
      return;
    }

    document.title = `${post.title || 'Post'} — Blog`;

    const date = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

    content.innerHTML = `
      <article class="post-single">
        <a href="#/" class="back-link">&larr; Back to posts</a>
        ${post.featuredImage ? `<div class="post-hero"><img src="${post.featuredImage}" alt="${post.title || ''}"></div>` : ''}
        <header class="post-header">
          <h1 class="post-title">${post.title || 'Untitled'}</h1>
          <div class="post-meta">
            ${date ? `<time>${date}</time>` : ''}
            ${categoriesHtml ? `<div class="post-categories">${categoriesHtml}</div>` : ''}
          </div>
        </header>
        <div class="post-content">${post.content || ''}</div>
        ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
        ${renderComments(comments)}
      </article>
    `;

    sidebar.innerHTML = '';
  } catch (err) {
    content.innerHTML = '<div class="error">Failed to load post.</div>';
    if (BLOG_CONFIG.DEBUG) console.error(err);
  }
}
