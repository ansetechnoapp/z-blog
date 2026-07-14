export function renderFooter(container) {
  const year = new Date().getFullYear();
  container.innerHTML = `
    <div class="container footer-inner">
      <p>&copy; ${year} Blog &mdash; Powered by <a href="https://zodev.live" target="_blank" rel="noopener">ZodBack</a></p>
    </div>
  `;
}
