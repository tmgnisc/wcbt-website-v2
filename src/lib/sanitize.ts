const ALLOWED_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'A', 'SPAN', 'DIV', 'H3', 'H4',
]);

/**
 * Notification bodies are authored in the in-app rich text editor and rendered back with
 * `dangerouslySetInnerHTML`, so strip anything that is not plain formatting before display.
 */
export function sanitizeHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }

      for (const attribute of Array.from(child.attributes)) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim().toLowerCase();
        const isSafeHref =
          name === 'href' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('mailto:'));
        if (!isSafeHref) {
          child.removeAttribute(attribute.name);
        }
      }

      if (child.tagName === 'A') {
        child.setAttribute('rel', 'noopener noreferrer');
        child.setAttribute('target', '_blank');
      }

      walk(child);
    }
  };

  walk(template.content as unknown as Element);
  return template.innerHTML;
}

/** Plain-text preview used in table cells and the notification bell dropdown. */
export function htmlToText(html: string): string {
  const element = document.createElement('div');
  element.innerHTML = sanitizeHtml(html);
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}
