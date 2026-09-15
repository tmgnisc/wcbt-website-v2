import type { RenderedPage } from '@/lib/render/page';

/**
 * Outputs a rendered template page. The markup is driven by Alpine.js + jQuery (public/media/.../js), not React,
 * so it is inserted as HTML and React never reconciles inside it. Scripts are emitted as real <script> tags in the
 * server HTML so the browser runs them in order on first load; site links are plain <a> tags (full page loads).
 */
export function TemplatePage({ page }: { page: RenderedPage }) {
  return (
    <>
      {page.links.map((link) =>
        link.rel === 'stylesheet' ? (
          <link key={link.href} rel="stylesheet" href={link.href} precedence="template" />
        ) : (
          <link key={link.href} rel={link.rel} href={link.href} type={link.type} />
        ),
      )}
      {page.styles.map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <div className="template-root" dangerouslySetInnerHTML={{ __html: page.body }} suppressHydrationWarning />
      {page.scripts.map((script, i) =>
        script.src ? (
          <script key={i} src={script.src} type={script.type} />
        ) : (
          <script key={i} type={script.type} dangerouslySetInnerHTML={{ __html: script.code ?? '' }} />
        ),
      )}
    </>
  );
}
