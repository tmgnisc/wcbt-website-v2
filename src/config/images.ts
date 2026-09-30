/**
 * Photos for content images. Content JSON only stores an image's alt text; `imageFor` picks the photo for an alt:
 * an exact entry in IMAGES, then a named person, then the first matching topic rule, then a stable pick from the
 * general pool. Local files live in public/images (campus.jpg is the real college premises). AI-generated photos are
 * hosted on ImageKit under university/ai/<name>.jpg (see scripts/ai-images.md); until one is uploaded, pages fall
 * back to FALLBACK.
 */
export interface ImageSource {
  src: string;
  /** CSS object-position used when the photo is cropped to its frame (e.g. keep a face in view). */
  position?: string;
  /** Portrait photos get a square frame instead of 16:9. */
  portrait?: boolean;
  /** Fit inside the frame instead of cropping — for logos and other artwork that must not be cut off. */
  contain?: boolean;
}

export const LOGO = '/images/logo.png';
export const CAMPUS = '/images/campus.jpg';
export const FALLBACK = CAMPUS;
const PROFILE = '/media/durham-university/site-assets/image/Blank-profile-INK.png';
const ai = (name: string) => `https://ik.imagekit.io/qn3m81dsk/university/ai/${name}.jpg?tr=w-1280`;

/** Photos in ImageKit's `White_house_college` folder; the key names the section that shows them. */
const wc = (path: string) => `https://ik.imagekit.io/pyyly2fkm/White_house_college/${path}`;

export const PHOTOS = {
  bitProgram: wc('BIT%20Program.avif?updatedAt=1790577012839'),
  btechEdIt: wc('B.Tech%20Ed%20IT.avif?updatedAt=1790577390690'),
  admission: wc('Admission.avif?updatedAt=1790577945274'),
  scholarship: wc('scholarshipt.webp?updatedAt=1790578166529'),
  academicInquiry: wc('Academic%20inquiry.avif?updatedAt=1790578389089'),
  researchEcosystem: wc('Research%20&%20Innovation%20Ecosystem.avif?updatedAt=1790578493558'),
  orientation: wc('Orientation%20Program.avif?updatedAt=1790579346805'),
  guestLecture: wc('Guest%20Lecture.avif?updatedAt=1790579763068'),
  sportsWeek: wc('sports%20week.avif?updatedAt=1790579979721'),
  techBootcamp: wc('tech%20bootcamp.avif?updatedAt=1790580062486'),
  kuLogo: wc('Kathmandu_University_Logo.svg?updatedAt=1790580289641'),
  smartClassrooms: wc('smart%20classrooms.webp?updatedAt=1790580372984'),
  aiInnovationLab: wc('ai%20innovates%20lab.avif?updatedAt=1790580448413'),
  eligibility: wc('eligibility.avif?updatedAt=1790592890890'),
  entrepreneurshipHub: wc('Student%20life%20section/Entrepreneurship%20Hub.avif?updatedAt=1790593930379'),
  communityOutreach: wc('Student%20life%20section/Community%20Outreach.avif?updatedAt=1790593887061'),
  artsMusicMedia: wc('Student%20life%20section/arts,%20music%20and%20media.avif?updatedAt=1790593837192'),
  sportsRecreation: wc('Student%20life%20section/sports%20and%20recreation.avif?updatedAt=1790593792469'),
  edTech: wc('Student%20life%20section/ed-tech.avif?updatedAt=1790593708229'),
  codingRobotics: wc('Student%20life%20section/coding%20and%20robotics.avif?updatedAt=1790593594512'),
  connectedCommunity: wc('Student%20life%20section/A%20connected%20learning%20community%20.avif?updatedAt=1790593185738'),
} as const;

const PRESIDENT: ImageSource = { src: '/images/president.jpg', position: '50% 18%', portrait: true };

export const IMAGES: Record<string, ImageSource> = {
  'Yuvraj Sharma, President': PRESIDENT,
  'Yuvraj Sharma': PRESIDENT,

  // programs
  'BIT — Bachelor in Information Technology': { src: PHOTOS.bitProgram },
  'B.Tech Ed IT — Technology in Education': { src: PHOTOS.btechEdIt },

  // /programs/ cards: facilities + career outcomes, matched by card name
  'AI & Innovation Lab': { src: PHOTOS.aiInnovationLab },
  'Smart Classrooms': { src: PHOTOS.smartClassrooms },
  'Software Developer': { src: PHOTOS.bitProgram },
  'IT Support & Systems Admin': { src: PHOTOS.techBootcamp },
  'Ed-Tech Specialist': { src: PHOTOS.edTech },
  'ICT Teacher / Trainer': { src: PHOTOS.btechEdIt },
  'Data & AI Analyst': { src: PHOTOS.researchEcosystem },
  'Startup Founder': { src: PHOTOS.entrepreneurshipHub },

  // /about/ page cards
  'Empowering Eastern Nepal through technology education': { src: PHOTOS.connectedCommunity },
  'A regional hub for innovation and lifelong learning': { src: PHOTOS.researchEcosystem },
  'Industry Partners': { src: PHOTOS.guestLecture },
  'Smart Facilities': { src: PHOTOS.smartClassrooms },

  // /academics/admissions/ cards ("Who should apply?" already maps to PHOTOS.eligibility)
  'Entrance Exam': { src: PHOTOS.academicInquiry },
  'Interview Round': { src: PHOTOS.admission },

  // homepage "Your next academic step" cards
  'Admission Process': { src: PHOTOS.admission },
  'Scholarship Schemes': { src: PHOTOS.scholarship },
  'Academic Inquiry': { src: PHOTOS.academicInquiry },

  // research & admissions sections
  'AI Robotics & IoT Innovation': { src: PHOTOS.researchEcosystem },
  'Who should apply?': { src: PHOTOS.eligibility },

  // news & events cards
  'Orientation Program 2026': { src: PHOTOS.orientation },
  'Guest Lecture: AI Ethics': { src: PHOTOS.guestLecture },
  'Tech Bootcamp — Web3': { src: PHOTOS.techBootcamp },
  'Inter-college Sports Week': { src: PHOTOS.sportsWeek },

  // campus cards
  'Smart classroom': { src: PHOTOS.smartClassrooms },
  'AI labs': { src: PHOTOS.aiInnovationLab },

  // student life
  'A connected learning community': { src: PHOTOS.connectedCommunity },
  'Coding & Robotics': { src: PHOTOS.codingRobotics },
  'Ed-Tech Circle': { src: PHOTOS.edTech },
  'Sports & Recreation': { src: PHOTOS.sportsRecreation },
  'Arts, Music & Media': { src: PHOTOS.artsMusicMedia },
  'Community Outreach': { src: PHOTOS.communityOutreach },
  'Entrepreneurship Hub': { src: PHOTOS.entrepreneurshipHub },

  // KU affiliation
  'Kathmandu University Logo': { src: PHOTOS.kuLogo, contain: true },
};

/** Real people without a photo yet: a neutral profile image, never a generated face. */
const PEOPLE = ['Ranjit Shah', 'Sanjog Kharel', 'Arya Bhattarai', 'Aarohi Basnet'];

/** Alt text pattern -> photo, first match wins. */
const RULES: [RegExp, string][] = [
  [/exam|interview/i, ai('exam')],
  [/evening|night/i, ai('campus-evening')],
  [/fest|celebrat/i, ai('festival')],
  [/sport/i, ai('sports')],
  [/green|sustainab/i, ai('green-campus')],
  [/campus|entrance|academic block|grounds|infrastructure|jhapa|visit|living near|premises/i, CAMPUS],
  [/nlp|language/i, ai('nepali-nlp')],
  [/agricultur/i, ai('smart-agriculture')],
  [/\bvr\b|virtual/i, ai('vr-classroom')],
  [/iot|robot/i, ai('iot-robotics')],
  [/lecture|seminar/i, ai('lecture')],
  [/data|analytics/i, ai('data-analytics')],
  [/\bai\b|machine learning|artificial|research/i, ai('ai-lab')],
  [/cyber|security/i, ai('cybersecurity')],
  [/it support|system/i, ai('server-room')],
  [/software|developer|coding|web3|bootcamp/i, ai('software-developer')],
  [/startup|founder|entrepreneur/i, ai('startup')],
  [/teacher|trainer|ed-tech|b\.tech|education/i, ai('teacher-training')],
  [/lab|computer|\bbit\b|information technology|innovation|facilit/i, ai('computer-lab')],
  [/smart class|classroom/i, ai('smart-classroom')],
  [/library|resource|publication|report/i, ai('library')],
  [/study|project|team/i, ai('study-space')],
  [/orientation/i, ai('orientation')],
  [/graduat|alumni|success/i, ai('graduation')],
  [/music|arts?\b|creative/i, ai('music-arts')],
  [/photo|media/i, ai('photography')],
  [/cafeteria|canteen|food/i, ai('cafeteria')],
  [/lounge|balanced|life/i, ai('student-lounge')],
  [/scholarship|merit|excellence|fund|deserving/i, ai('scholarship')],
  [/admission|inquir|apply|who should/i, ai('admissions')],
  [/community|outreach|connected/i, ai('community')],
  [/industry|partner|career|placement/i, ai('industry')],
  [/support|advis|counsel/i, ai('admissions')],
];

const POOL = ['teamwork', 'study-space', 'smart-classroom', 'computer-lab', 'library', 'lecture'].map(ai);

/** Section of the site -> page header photo. Longest path first: `startsWith` picks the first match. */
const SECTION_HEROES: [string, string][] = [
  ['/about/', CAMPUS],
  ['/visit/', CAMPUS],
  ['/contact/', CAMPUS],
  ['/programs/bit/', PHOTOS.bitProgram],
  ['/programs/btech-ed-it/', PHOTOS.btechEdIt],
  ['/programs/', ai('computer-lab')],
  ['/academics/scholarships/', PHOTOS.scholarship],
  ['/academics/admissions/', PHOTOS.admission],
  ['/academics/research/', PHOTOS.researchEcosystem],
  ['/apply-form/', ai('admissions')],
  ['/research/ai-labs/', ai('iot-robotics')],
  ['/research/innovation-centers/', ai('startup')],
  ['/research/', ai('ai-lab')],
  ['/careers/graduate-success/', ai('graduation')],
  ['/careers/', ai('industry')],
  ['/community/international/', ai('lecture')],
  ['/community/', ai('teamwork')],
  ['/student-life/campus-life/', ai('festival')],
  ['/student-life/student-support/', ai('admissions')],
  ['/student-life/', ai('study-space')],
  ['/updates/events/', ai('festival')],
  ['/updates/', ai('lecture')],
  ['/vision/', ai('graduation')],
];

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}

export function imageFor(alt: string): ImageSource {
  if (IMAGES[alt]) return IMAGES[alt];
  if (PEOPLE.includes(alt)) return { src: PROFILE, portrait: true };
  const rule = RULES.find(([pattern]) => pattern.test(alt));
  return { src: rule ? rule[1] : POOL[hash(alt) % POOL.length] };
}

export function heroImageFor(path: string): string {
  return SECTION_HEROES.find(([prefix]) => path.startsWith(prefix))?.[1] ?? CAMPUS;
}
