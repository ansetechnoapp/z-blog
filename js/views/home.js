import { getAll } from '../api.js';
import { BLOG_CONFIG } from '../config.js';
import { createPostCard } from '../components/post-card.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderPagination } from '../components/pagination.js';

export async function render(content, sidebar, params = {}) {
  const page = parseInt(params.page) || 1;
  content.innerHTML = '<div class="loading">Loading posts...</div>';

  try {
    const res = await getAll(page, BLOG_CONFIG.POSTS_PER_PAGE);
    const data = res.data || {};
    const posts = data.posts || [];
    const categories = data.categories || [];
    const tags = data.tags || [];
    const total = data.total || posts.length;
    const totalPages = Math.ceil(total / BLOG_CONFIG.POSTS_PER_PAGE);

    document.title = page > 1 ? `Blog — Page ${page}` : 'Blog';

    if (posts.length === 0) {
      content.innerHTML = '<div class="empty-state"><h2>No posts yet</h2><p>Check back soon for new content.</p></div>';
    } else {
      let html = '<div class="posts-grid">';
      const container = document.createElement('div');
      container.className = 'posts-grid';
      for (const post of posts) {
        container.appendChild(createPostCard(post));
      }
      const paginationEl = document.createElement('div');
      renderPagination(paginationEl, { currentPage: page, totalPages });

      content.innerHTML = '';
      content.appendChild(container);
      content.appendChild(paginationEl);
    }

    renderSidebar(sidebar, { categories, tags, recentPosts: posts.slice(0, 5) });
  } catch (err) {
    content.innerHTML = '<div class="error">Failed to load posts. Please check your connection.</div>';
    if (BLOG_CONFIG.DEBUG) console.error(err);
  }
}
