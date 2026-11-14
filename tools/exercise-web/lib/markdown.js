'use strict';

// Minimal Markdown renderer used to display exercise statements.
// The statements come from the course platform and mix ordinary Markdown with
// raw HTML tables, so the renderer keeps HTML blocks untouched and only
// converts the Markdown constructs that actually appear in this repository.

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function escapeText(value) {
  return String(value)
    // Escape "&" unless it already starts an entity reference.
    .replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)/g, '&amp;')
    // Escape "<" unless it starts an HTML tag, closing tag or comment.
    .replace(/<(?![a-zA-Z/!])/g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeCode(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  const source = String(text);
  const pieces = source.split(/(`[^`\n]*`)/g);
  let out = '';
  for (let i = 0; i < pieces.length; i += 1) {
    const piece = pieces[i];
    if (i % 2 === 1) {
      out += `<code>${escapeCode(piece.slice(1, -1))}</code>`;
      continue;
    }
    let html = escapeText(piece);
    // Images before links, both only for inline URLs.
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => {
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    });
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      return `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    out += html;
  }
  return out;
}

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let current = '';
  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    if (ch === '\\' && trimmed[i + 1] === '|') {
      current += '|';
      i += 1;
    } else if (ch === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function isTableSeparator(line) {
  if (!/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line)) return false;
  return splitRow(line).every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, '')));
}

function alignmentsOf(line) {
  return splitRow(line).map((cell) => {
    const value = cell.replace(/\s/g, '');
    if (value.startsWith(':') && value.endsWith(':')) return 'center';
    if (value.endsWith(':')) return 'right';
    if (value.startsWith(':')) return 'left';
    return '';
  });
}

function isHtmlBlockStart(line) {
  const match = /^\s*<([a-zA-Z][a-zA-Z0-9-]*)\b/.exec(line);
  if (!match) return false;
  return !VOID_TAGS.has(match[1].toLowerCase()) || /\/>\s*$/.test(line);
}

function startsBlock(line) {
  return (
    /^\s*$/.test(line) ||
    /^\s*```/.test(line) ||
    /^\s{0,3}#{1,6}\s+/.test(line) ||
    /^\s{0,3}(?:[-*+]|\d+\.)\s+/.test(line) ||
    /^\s{0,3}>\s?/.test(line) ||
    /^\s{0,3}(?:\*\s*){3,}$/.test(line) ||
    /^\s{0,3}(?:-\s*){3,}$/.test(line) ||
    /^\s{0,3}(?:_\s*){3,}$/.test(line) ||
    isTableSeparator(line) ||
    /^\s*</.test(line)
  );
}

function renderMarkdown(source) {
  const lines = String(source == null ? '' : source).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i += 1;
      continue;
    }

    const fence = /^\s*```(\S*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1];
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      const cls = lang ? ` class="language-${escapeCode(lang)}"` : '';
      out.push(`<pre><code${cls}>${escapeCode(buffer.join('\n'))}</code></pre>`);
      continue;
    }

    if (i + 1 < lines.length && isTableSeparator(lines[i + 1]) && lines[i].includes('|')) {
      const header = splitRow(line);
      const aligns = alignmentsOf(lines[i + 1]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      const head = header
        .map((cell, index) => {
          const align = aligns[index] ? ` style="text-align:${aligns[index]}"` : '';
          return `<th${align}>${renderInline(cell)}</th>`;
        })
        .join('');
      const body = rows
        .map((cells) => {
          const tds = header
            .map((_, index) => {
              const align = aligns[index] ? ` style="text-align:${aligns[index]}"` : '';
              return `<td${align}>${renderInline(cells[index] || '')}</td>`;
            })
            .join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');
      out.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
      continue;
    }

    const heading = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^\s{0,3}(?:\*\s*){3,}$/.test(line) || /^\s{0,3}(?:-\s*){3,}$/.test(line) || /^\s{0,3}(?:_\s*){3,}$/.test(line)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    if (/^\s{0,3}>\s?/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^\s{0,3}>\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderMarkdown(buffer.join('\n'))}</blockquote>`);
      continue;
    }

    const listMarker = /^(\s*)([-*+]|\d+\.)\s+/.exec(line);
    if (listMarker) {
      const ordered = /\d/.test(listMarker[2]);
      const items = [];
      while (i < lines.length) {
        const match = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (!match) break;
        const indent = match[1].length;
        let content = match[3];
        i += 1;
        // Continuation lines of the same item.
        while (
          i < lines.length &&
          /^\s+\S/.test(lines[i]) &&
          !/^(\s*)([-*+]|\d+\.)\s+/.test(lines[i]) &&
          !/^\s*$/.test(lines[i])
        ) {
          content += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(`<li style="margin-left:${Math.min(indent, 8) * 6}px">${renderInline(content)}</li>`);
        if (i < lines.length && /^\s*$/.test(lines[i])) {
          // Blank line ends the list unless the next non-blank line is again a list item.
          let lookahead = i + 1;
          while (lookahead < lines.length && /^\s*$/.test(lines[lookahead])) lookahead += 1;
          if (lookahead < lines.length && /^(\s*)([-*+]|\d+\.)\s+/.test(lines[lookahead])) {
            i = lookahead;
            continue;
          }
          break;
        }
      }
      out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    if (isHtmlBlockStart(line)) {
      const buffer = [];
      while (i < lines.length && !/^\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      out.push(buffer.join('\n'));
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (i < lines.length && !startsBlock(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return out.join('\n');
}

module.exports = { renderMarkdown, escapeText, escapeCode };
