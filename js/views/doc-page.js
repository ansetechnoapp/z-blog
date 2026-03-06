import { DOCS_CONFIG } from '../docs-config.js';
import { getPageBySlug, verifyDocsConnection } from '../docs-api.js';

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(text) {
  let out = text;
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return out;
}

function markdownToHtml(md) {
  const lines = escapeHtml(md || '').replace(/\r\n/g, '\n').split('\n');

  let html = '';
  let inCode = false;
  let codeLines = [];
  let inUl = false;
  let inOl = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${renderInline(paragraph.join(' '))}</p>`;
    paragraph = [];
  };

  const closeLists = () => {
    if (inUl) {
      html += '</ul>';
      inUl = false;
    }
    if (inOl) {
      html += '</ol>';
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.startsWith('```')) {
      flushParagraph();
      closeLists();

      if (inCode) {
        html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeLists();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeLists();
      const level = heading[1].length;
      html += `<h${level}>${renderInline(heading[2].trim())}</h${level}>`;
      continue;
    }

    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) {
      flushParagraph();
      closeLists();
      html += `<blockquote>${renderInline(blockquote[1].trim())}</blockquote>`;
      continue;
    }

    const ul = line.match(/^-\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (inOl) {
        html += '</ol>';
        inOl = false;
      }
      if (!inUl) {
        html += '<ul>';
        inUl = true;
      }
      html += `<li>${renderInline(ul[1].trim())}</li>`;
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (inUl) {
        html += '</ul>';
        inUl = false;
      }
      if (!inOl) {
        html += '<ol>';
        inOl = true;
      }
      html += `<li>${renderInline(ol[1].trim())}</li>`;
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) {
    html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
  }

  flushParagraph();
  closeLists();

  return html;
}

export async function render(content, sidebar, params = {}) {
  document.title = 'Docs — Blog';
  sidebar.innerHTML = '';

  if (!verifyDocsConnection()) {
    content.innerHTML =
      '<div class="error">Docs API is not configured. Please set DOCS_CONFIG.API_TOKEN.</div>';
    return;
  }

  const slug = params.slug;
  if (!slug) {
    content.innerHTML = '<div class="error">Doc page not found.</div>';
    return;
  }

  content.innerHTML = '<div class="loading">Loading doc...</div>';

  try {
    const res = await getPageBySlug(slug);
    const page = res.data;

    if (!page) {
      content.innerHTML = '<div class="error">Doc page not found.</div>';
      return;
    }

    document.title = `${page.title || 'Doc'} — Blog`;

    const html = markdownToHtml(page.content || '');

    content.innerHTML = `
      <article class="post-single">
        <a href="#/docs" class="back-link">&larr; Back to docs</a>
        <header class="post-header">
          <h1 class="post-title">${page.title || page.slug}</h1>
          ${page.excerpt ? `<div class="post-meta">${page.excerpt}</div>` : ''}
        </header>
        <div class="post-content">${html}</div>
      </article>
    `;
  } catch (err) {
    content.innerHTML = '<div class="error">Failed to load doc page.</div>';
    if (DOCS_CONFIG.DEBUG) console.error(err);
  }
}
