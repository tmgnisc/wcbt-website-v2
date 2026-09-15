/** Shape of content/<slug>.json, produced by scripts/scraper/scrape_content.py. */

export type Tone = 'plain' | 'muted' | 'dark';

export interface Link {
  text: string;
  href: string | null;
}

export interface Quote {
  text: string;
  cite: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Item {
  eyebrow: string;
  title: string;
  stat: string;
  text: string[];
  bullets: string[];
  links: Link[];
  image: string | null;
  href: string | null;
}

export interface FormField {
  tag: 'input' | 'select' | 'textarea';
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

export interface FormSpec {
  fields: FormField[];
  submit: string;
  notes?: string[];
}

export interface Block {
  tone: Tone;
  eyebrow: string;
  h1: string;
  heading: string;
  paras: string[];
  bullets: string[];
  links: Link[];
  images: string[];
  quote: Quote | null;
  groups: Item[][];
  tables: string[][][];
  forms: FormSpec[];
  faqs: Faq[];
}

export interface PageContent {
  route: string;
  title: string;
  description: string;
  blocks: Block[];
}
