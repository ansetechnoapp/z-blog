export function renderSidebar(container, { categories = [], tags = [], recentPosts = [] } = {}) {
  let html = '';

  if (categories.length > 0) {
    const catItems = categories
      .map(c => `<li><a href="#/categories/${encodeURIComponent(c.slug || c.name)}">${c.name}</a></li>`)
      .join('');
    html += `
      <div class="sidebar-section">
        <h3 class="sidebar-title">Categories</h3>
        <ul class="sidebar-list">${catItems}</ul>
      </div>
    `;
  }

  if (tags.length > 0) {
    const tagBadges = tags
      .map(t => `<a href="#/tags/${encodeURIComponent(t.slug || t.name)}" class="badge badge-tag">${t.name}</a>`)
      .join('');
    html += `
      <div class="sidebar-section">
        <h3 class="sidebar-title">Tags</h3>
        <div class="tags-cloud">${tagBadges}</div>
      </div>
    `;
  }

  if (recentPosts.length > 0) {
    const recentItems = recentPosts.slice(0, 5)
      .map(p => `<li><a href="#/posts/${encodeURIComponent(p.slug)}">${p.title || 'Untitled'}</a></li>`)
      .join('');
    html += `
      <div class="sidebar-section">
        <h3 class="sidebar-title">Recent Posts</h3>
        <ul class="sidebar-list">${recentItems}</ul>
      </div>
    `;
  }

  container.innerHTML = html || '<p class="muted">No data yet.</p>';
}
