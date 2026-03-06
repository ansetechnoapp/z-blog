import { getAll } from '../api.js';
import { BLOG_CONFIG } from '../config.js';
import { createPostCard } from '../components/post-card.js';
import { renderSidebar } from '../components/sidebar.js';

export async function render(content, sidebar, params = {}) {
  const { slug } = params;
  content.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const res = await getAll(1, 100);
    const data = res.data || {};
    const allPosts = data.posts || [];
    const categories = data.categories || [];
    const tags = data.tags || [];

    if (!slug) {
      // Show all tags
      document.title = 'Tags — Blog';
      const tagBadges = tags.map(t =>
        `<a href="#/tags/${encodeURIComponent(t.slug || t.name)}" class="badge badge-tag badge-lg">${t.name}</a>`
      ).join('');
      content.innerHTML = `
        <h1 class="page-title">Tags</h1>
        <div class="tags-cloud tags-page">${tagBadges || '<p class="muted">No tags yet.</p>'}</div>
      `;
      renderSidebar(sidebar, { categories, tags, recentPosts: allPosts.slice(0, 5) });
      return;
    }

    const tag = tags.find(t => (t.slug || t.name) === slug);
    const tagName = tag ? tag.name : slug;
    document.title = `#${tagName} — Blog`;

    const filtered = allPosts.filter(p =>
      Array.isArray(p.tags) && p.tags.some(t => (t.slug || t.name) === slug)
    );

    if (filtered.length === 0) {
      content.innerHTML = `
        <a href="#/" class="back-link">&larr; Back to posts</a>
        <h1 class="page-title">#${tagName}</h1>
        <div class="empty-state"><p>No posts with this tag.</p></div>
      `;
    } else {
      const heading = document.createElement('div');
      heading.innerHTML = `<a href="#/" class="back-link">&larr; Back to posts</a><h1 class="page-title">#${tagName}</h1>`;
      const grid = document.createElement('div');
      grid.className = 'posts-grid';
      for (const post of filtered) {
        grid.appendChild(createPostCard(post));
      }
      content.innerHTML = '';
      content.appendChild(heading);
      content.appendChild(grid);
    }

    renderSidebar(sidebar, { categories, tags, recentPosts: allPosts.slice(0, 5) });
  } catch (err) {
    content.innerHTML = '<div class="error">Failed to load tag.</div>';
    if (BLOG_CONFIG.DEBUG) console.error(err);
  }
}
