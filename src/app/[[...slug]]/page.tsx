import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { TemplatePage } from '@/components/TemplatePage';
import { PAGES, pathFromSegments, segmentsFromPath } from '@/config/navigation';
import { renderPage } from '@/lib/render/page';

type Props = { params: Promise<{ slug?: string[] }> };

/** Every route is known up front (src/config/navigation.ts) and pre-rendered at build time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PAGES).map((path) => ({ slug: segmentsFromPath(path) }));
}

const renderCached = cache(renderPage);

async function getPage(params: Props['params']) {
  const path = pathFromSegments((await params).slug);
  if (!(path in PAGES)) notFound();
  const page = renderCached(path);
  if (page.leftovers.length) console.warn(`[${path}] template lorem left in output:`, page.leftovers.slice(0, 4));
  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params);
  return { title: { absolute: page.title }, description: page.description, other: page.meta };
}

export default async function Page({ params }: Props) {
  return <TemplatePage page={await getPage(params)} />;
}
