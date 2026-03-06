import { BLOG_CONFIG } from '../config.js';

export function renderHeader(container) {
  container.innerHTML = `
    <div class="container header-inner">
      <a href="#/" class="logo">Blog</a>
      <nav class="nav">
        <a href="#/" class="nav-link">Home</a>
        <a href="#/categories" class="nav-link">Categories</a>
        <a href="#/tags" class="nav-link">Tags</a>
      </nav>
      <button id="theme-toggle" class="theme-btn" aria-label="Toggle theme">
        <span class="theme-icon">${BLOG_CONFIG.THEME === 'dark' ? '☀' : '☾'}</span>
      </button>
    </div>
  `;

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('theme-light');
    document.getElementById('theme-toggle').querySelector('.theme-icon').textContent = isDark ? '☾' : '☀';
  });
}
