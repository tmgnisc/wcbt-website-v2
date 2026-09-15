/**
 * Information architecture: every route, the design template it is built on, and the site navigation.
 * Adding a page = add an entry to PAGES, add content/<slug>.json, and (optionally) link it from a section/nav below.
 */

/** Design templates in /templates (file name without .html). */
export type TemplateName =
  | '01-homepage'
  | '02-news-listing'
  | '03-article'
  | '04-staff-profile'
  | '05-course-detail'
  | '06-contact-map'
  | '07-college'
  | '08-business-programme'
  | '09-event-detail'
  | '10-landing-about'
  | '11-landing-research'
  | '12-landing-study';

export type SectionKey =
  | 'about'
  | 'vision'
  | 'programs'
  | 'academics'
  | 'research'
  | 'studentlife'
  | 'community'
  | 'careers'
  | 'visit'
  | 'updates';

export interface Section {
  label: string;
  landing: string;
  children: string[];
}

export interface PageDef {
  title: string;
  template: TemplateName;
  section: SectionKey | null;
}

export type NavLink = [label: string, href: string];
export type NavEntry = [label: string, href: string, items: NavLink[]];

export const SECTIONS: Record<SectionKey, Section> = {
  about: { label: 'About Us', landing: '/about/', children: ['/about/ku-affiliation/', '/about/industry-exposure/', '/about/publications/', '/about/legacy/', '/about/governance/'] },
  vision: { label: 'Vision', landing: '/vision/', children: ['/vision/mission/', '/vision/values/', '/vision/strategy/', '/vision/reports/'] },
  programs: { label: 'Programs', landing: '/programs/', children: ['/programs/bit/', '/programs/btech-ed-it/'] },
  academics: { label: 'Academics', landing: '/academics/admissions/', children: ['/academics/research/', '/academics/admissions/', '/academics/scholarships/', '/apply-form/'] },
  research: { label: 'Research & Innovation', landing: '/academics/research/', children: ['/research/ai-labs/', '/research/iot-labs/', '/research/innovation-centers/'] },
  studentlife: { label: 'Student Life', landing: '/student-life/student-experience/', children: ['/student-life/student-experience/', '/student-life/student-support/', '/student-life/campus-life/'] },
  community: { label: 'Community', landing: '/community/', children: ['/community/board-members/', '/community/advisors/', '/community/faculty/', '/community/administration/', '/community/international/'] },
  careers: { label: 'Careers', landing: '/careers/', children: ['/careers/career-paths/', '/careers/graduate-success/', '/careers/placements/'] },
  visit: { label: 'Visit Us', landing: '/visit/', children: ['/visit/virtual-tour/', '/contact/'] },
  updates: { label: 'News & Events', landing: '/updates/news/', children: ['/updates/news/', '/updates/events/'] },
};

const page = (title: string, template: TemplateName, section: SectionKey | null): PageDef => ({ title, template, section });

export const PAGES: Record<string, PageDef> = {
  '/': page('Home', '01-homepage', null),
  '/about/': page('About Us', '10-landing-about', 'about'),
  '/about/ku-affiliation/': page('KU Affiliation', '08-business-programme', 'about'),
  '/about/industry-exposure/': page('Industry Exposure', '08-business-programme', 'about'),
  '/about/publications/': page('Publications', '02-news-listing', 'about'),
  '/about/legacy/': page('Legacy', '08-business-programme', 'about'),
  '/about/governance/': page('Governance', '08-business-programme', 'about'),
  '/vision/': page('Vision', '10-landing-about', 'vision'),
  '/vision/mission/': page('Mission', '08-business-programme', 'vision'),
  '/vision/values/': page('Values', '08-business-programme', 'vision'),
  '/vision/strategy/': page('Strategy', '08-business-programme', 'vision'),
  '/vision/reports/': page('Reports', '02-news-listing', 'vision'),
  '/programs/': page('Programs', '12-landing-study', 'programs'),
  '/programs/bit/': page('BIT — Bachelor in Information Technology', '05-course-detail', 'programs'),
  '/programs/btech-ed-it/': page('B.Tech Ed IT — Technology in Education', '05-course-detail', 'programs'),
  '/academics/research/': page('Research & Innovation', '11-landing-research', 'research'),
  '/academics/admissions/': page('Admissions', '08-business-programme', 'academics'),
  '/academics/scholarships/': page('Scholarships', '08-business-programme', 'academics'),
  '/apply-form/': page('Apply Now', '08-business-programme', 'academics'),
  '/research/ai-labs/': page('AI Labs', '07-college', 'research'),
  '/research/iot-labs/': page('IoT Labs', '07-college', 'research'),
  '/research/innovation-centers/': page('Innovation Centers', '07-college', 'research'),
  '/student-life/student-experience/': page('Student Experience', '07-college', 'studentlife'),
  '/student-life/student-support/': page('Student Support', '08-business-programme', 'studentlife'),
  '/student-life/campus-life/': page('Campus Life', '07-college', 'studentlife'),
  '/community/': page('Community', '10-landing-about', 'community'),
  '/community/board-members/': page('Board Members', '02-news-listing', 'community'),
  '/community/advisors/': page('Advisors', '02-news-listing', 'community'),
  '/community/faculty/': page('Faculty', '02-news-listing', 'community'),
  '/community/administration/': page('Administration', '02-news-listing', 'community'),
  '/community/international/': page('International', '08-business-programme', 'community'),
  '/careers/': page('Careers', '10-landing-about', 'careers'),
  '/careers/career-paths/': page('Career Paths', '08-business-programme', 'careers'),
  '/careers/graduate-success/': page('Graduate Success', '08-business-programme', 'careers'),
  '/careers/placements/': page('Placements', '08-business-programme', 'careers'),
  '/visit/': page('Visit Us', '06-contact-map', 'visit'),
  '/visit/virtual-tour/': page('Virtual Campus Tour', '07-college', 'visit'),
  '/contact/': page('Contact Us', '06-contact-map', 'visit'),
  '/updates/news/': page('News', '02-news-listing', 'updates'),
  '/updates/events/': page('Events', '03-article', 'updates'),
};

/** Short page label used in menus and breadcrumbs ("BIT — Bachelor in …" -> "BIT"). */
export function label(path: string): string {
  return PAGES[path].title.split(' — ')[0];
}

const links = (paths: string[]): NavLink[] => paths.map((p) => [PAGES[p].title, p]);

/** Mirrors the live site's header. */
export const PRIMARY_NAV: NavEntry[] = [
  ['About Us', '/about/', links(['/about/', ...SECTIONS.about.children, '/vision/', ...SECTIONS.vision.children])],
  ['Programs', '/programs/', links(['/programs/', ...SECTIONS.programs.children])],
  ['Academics', '/academics/admissions/', links([...SECTIONS.academics.children, ...SECTIONS.research.children])],
  ['Student Life', '/student-life/student-experience/', links([...SECTIONS.studentlife.children, '/community/', ...SECTIONS.community.children])],
  ['Visit Us', '/visit/', links(['/visit/', ...SECTIONS.visit.children])],
  ['Careers', '/careers/', links(['/careers/', ...SECTIONS.careers.children])],
];

export const UTILITY_NAV: NavLink[] = [
  ['Community', '/community/'],
  ['News', '/updates/news/'],
  ['Events', '/updates/events/'],
  ['Virtual Tour', '/visit/virtual-tour/'],
  ['Contact', '/contact/'],
  ['Apply Now', '/apply-form/'],
];

/** Mirrors the live site's footer columns. */
export const FOOTER_COLS: [heading: string, paths: string[]][] = [
  ['Community', SECTIONS.community.children],
  ['About', SECTIONS.about.children],
  ['Vision', SECTIONS.vision.children],
  ['Research', SECTIONS.research.children],
  ['Careers', SECTIONS.careers.children],
];

/** Cross-links between the original template files -> representative pages. */
export const TEMPLATE_LINKS: Record<string, string> = {
  '01-homepage.html': '/',
  '02-news-listing.html': '/updates/news/',
  '03-article.html': '/updates/events/',
  '04-staff-profile.html': '/community/faculty/',
  '05-course-detail.html': '/programs/bit/',
  '06-contact-map.html': '/contact/',
  '07-college.html': '/student-life/campus-life/',
  '08-business-programme.html': '/academics/admissions/',
  '09-event-detail.html': '/updates/events/',
  '10-landing-about.html': '/about/',
  '11-landing-research.html': '/academics/research/',
  '12-landing-study.html': '/programs/',
};

/** '/about/legacy/' <-> 'about_legacy' (content file name). */
export function contentSlug(path: string): string {
  return path.replace(/^\/+|\/+$/g, '').replace(/\//g, '_') || 'home';
}

/** Route segments from Next.js params -> canonical path with trailing slash. */
export function pathFromSegments(segments: string[] | undefined): string {
  return segments && segments.length ? `/${segments.join('/')}/` : '/';
}

export function segmentsFromPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}
