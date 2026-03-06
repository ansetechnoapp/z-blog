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
      // Show all categories
      document.title = 'Categories — Blog';
      const catList = categories.map(c =>
        `<a href="#/categories/${encodeURIComponent(c.slug || c.name)}" class="category-item">
          <span class="category-name">${c.name}</span>
        </a>`
      ).join('');
      content.innerHTML = `
        <h1 class="page-title">Categories</h1>
        <div class="categories-grid">${catList || '<p class="muted">No categories yet.</p>'}</div>
      `;
      renderSidebar(sidebar, { categories, tags, recentPosts: allPosts.slice(0, 5) });
      return;
    }

    const category = categories.find(c => (c.slug || c.name) === slug);
    const categoryName = category ? category.name : slug;
    document.title = `${categoryName} — Blog`;

    // Filter posts that belong to this category
    const filtered = allPosts.filter(p =>
      Array.isArray(p.categories) && p.categories.some(c => (c.slug || c.name) === slug)
    );

    if (filtered.length === 0) {
      content.innerHTML = `
        <a href="#/" class="back-link">&larr; Back to posts</a>
        <h1 class="page-title">${categoryName}</h1>
        <div class="empty-state"><p>No posts in this category.</p></div>
      `;
    } else {
      const container = document.createElement('div');
      const heading = document.createElement('div');
      heading.innerHTML = `<a href="#/" class="back-link">&larr; Back to posts</a><h1 class="page-title">${categoryName}</h1>`;
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
    content.innerHTML = '<div class="error">Failed to load category.</div>';
    if (BLOG_CONFIG.DEBUG) console.error(err);
  }
}
