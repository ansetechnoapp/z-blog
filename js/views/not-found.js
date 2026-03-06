export async function render(content, sidebar) {
  document.title = '404 — Blog';
  content.innerHTML = `
    <div class="empty-state">
      <h1>404</h1>
      <p>Page not found.</p>
      <a href="#/" class="back-link">&larr; Back to home</a>
    </div>
  `;
  sidebar.innerHTML = '';
}
