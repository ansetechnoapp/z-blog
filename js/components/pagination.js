export function renderPagination(container, { currentPage, totalPages, baseHash = '#/page/' }) {
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';

  if (currentPage > 1) {
    const prev = currentPage === 2 ? '#/' : `${baseHash}${currentPage - 1}`;
    html += `<a href="${prev}" class="page-link">&laquo; Prev</a>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === totalPages - 2) html += '<span class="page-dots">...</span>';
      continue;
    }
    const href = i === 1 ? '#/' : `${baseHash}${i}`;
    const active = i === currentPage ? ' active' : '';
    html += `<a href="${href}" class="page-link${active}">${i}</a>`;
  }

  if (currentPage < totalPages) {
    html += `<a href="${baseHash}${currentPage + 1}" class="page-link">Next &raquo;</a>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
