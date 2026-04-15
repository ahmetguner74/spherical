// ============================================
// Basit Markdown → HTML dönüştürücü
// Desteklenen sözdizimi:
//   **kalın**  *italik*  `kod`
//   ## Başlık  ### Alt Başlık
//   - Liste öğesi
//   [link](url)
//   ![resim](url)
//   > Alıntı
//   --- (ayraç)
// ============================================

/** Satır içi markdown → HTML */
function inlineMarkdown(text: string): string {
  return text
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Görsel: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full inline" loading="lazy" />')
    // Link: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] underline">$1</a>')
    // Kalın + italik: ***text***
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    // Kalın: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // İtalik: *text*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Kod: `text`
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-sm font-mono">$1</code>');
}

/** Markdown string → HTML string */
export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ayraç
    if (/^---+$/.test(line.trim())) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push('<hr class="border-[var(--border)] my-4" />');
      continue;
    }

    // Başlık
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { html.push("</ul>"); inList = false; }
      const level = headingMatch[1].length;
      const sizes = ["text-xl font-bold", "text-lg font-bold", "text-base font-semibold", "text-sm font-semibold"];
      html.push(`<h${level} class="${sizes[level - 1]} text-[var(--foreground)] mt-4 mb-2">${inlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Alıntı
    if (line.trim().startsWith("> ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      const content = line.trim().slice(2);
      html.push(`<blockquote class="border-l-2 border-[var(--accent)] pl-3 py-1 text-[var(--muted-foreground)] italic">${inlineMarkdown(content)}</blockquote>`);
      continue;
    }

    // Liste
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) { html.push('<ul class="list-disc list-inside space-y-1 ml-2">'); inList = true; }
      html.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
      continue;
    }

    // Liste dışına çık
    if (inList && line.trim() === "") {
      html.push("</ul>");
      inList = false;
    }

    // Boş satır
    if (line.trim() === "") {
      html.push('<div class="h-2"></div>');
      continue;
    }

    // Normal paragraf
    if (inList) { html.push("</ul>"); inList = false; }
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (inList) html.push("</ul>");
  return html.join("\n");
}
