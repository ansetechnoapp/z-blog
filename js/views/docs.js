import { DOCS_CONFIG } from '../docs-config.js';
import { getSpacePages, verifyDocsConnection } from '../docs-api.js';

export async function render(content, sidebar) {
  document.title = 'Docs — Blog';
  sidebar.innerHTML = '';

  if (!verifyDocsConnection()) {
    content.innerHTML = '<div class="error">Docs API is not configured. Please set DOCS_CONFIG.API_TOKEN.</div>';
    return;
  }

  content.innerHTML = '<div class="loading">Loading docs...</div>';

  try {
    const res = await getSpacePages(DOCS_CONFIG.SPACE_SLUG);
    const data = res.data || {};
    const space = data.space;
    const pages = Array.isArray(data.pages) ? data.pages : [];

    const items = pages
      .map(
        (p) => `
          <li>
            <a href="#/docs/${encodeURIComponent(p.slug)}">${p.title || p.slug}</a>
            ${p.excerpt ? `<div class="muted">${p.excerpt}</div>` : ''}
          </li>
        `,
      )
      .join('');

    content.innerHTML = `
      <section>
        <h1 class="page-title">${space?.name || 'Docs'}</h1>
        ${space?.description ? `<p class="muted">${space.description}</p>` : ''}
        <ul class="sidebar-list">${items || '<li>No docs pages yet.</li>'}</ul>
      </section>
    `;
  } catch (err) {
    content.innerHTML = '<div class="error">Failed to load docs.</div>';
    if (DOCS_CONFIG.DEBUG) console.error(err);
  }
}
