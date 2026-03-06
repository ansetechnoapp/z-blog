import { verifyConnection } from './api.js';
import { BLOG_CONFIG } from './config.js';
import { Router } from './router.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import * as homeView from './views/home.js';
import * as postView from './views/post.js';
import * as categoryView from './views/category.js';
import * as tagView from './views/tag.js';
import * as notFoundView from './views/not-found.js';

async function main() {
  const header = document.getElementById('blog-header');
  const content = document.getElementById('content');
  const sidebar = document.getElementById('sidebar');
  const footer = document.getElementById('blog-footer');

  renderHeader(header);
  renderFooter(footer);

  // Verify API connection
  const connected = await verifyConnection();
  if (!connected) {
    content.innerHTML = '<div class="error">Failed to connect to API. Please check your API token and project ID.</div>';
    sidebar.innerHTML = '';
    return;
  }

  // Set up routes
  const router = new Router();

  router
    .on('/', (params) => homeView.render(content, sidebar, params))
    .on('/page/:page', (params) => homeView.render(content, sidebar, params))
    .on('/posts/:slug', (params) => postView.render(content, sidebar, params))
    .on('/categories', (params) => categoryView.render(content, sidebar, params))
    .on('/categories/:slug', (params) => categoryView.render(content, sidebar, params))
    .on('/tags', (params) => tagView.render(content, sidebar, params))
    .on('/tags/:slug', (params) => tagView.render(content, sidebar, params))
    .notFound(() => notFoundView.render(content, sidebar));

  router.start();
}

main();
