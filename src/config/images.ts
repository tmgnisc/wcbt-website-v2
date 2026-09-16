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
}

export const LOGO = '/images/logo.png';
export const CAMPUS = '/images/campus.jpg';
export const FALLBACK = CAMPUS;
const PROFILE = '/media/durham-university/site-assets/image/Blank-profile-INK.png';
const ai = (name: string) => `https://ik.imagekit.io/qn3m81dsk/university/ai/${name}.jpg?tr=w-1280`;

const PRESIDENT: ImageSource = { src: '/images/president.jpg', position: '50% 18%', portrait: true };

export const IMAGES: Record<string, ImageSource> = {
  'Yuvraj Sharma, President': PRESIDENT,
  'Yuvraj Sharma': PRESIDENT,
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

/** Section of the site -> page header photo. */
const SECTION_HEROES: [string, string][] = [
  ['/about/', CAMPUS],
  ['/visit/', CAMPUS],
  ['/contact/', CAMPUS],
  ['/programs/', ai('computer-lab')],
  ['/academics/scholarships/', ai('scholarship')],
  ['/academics/admissions/', ai('admissions')],
  ['/academics/research/', ai('ai-lab')],
  ['/apply-form/', ai('admissions')],
  ['/research/iot-labs/', ai('iot-robotics')],
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
